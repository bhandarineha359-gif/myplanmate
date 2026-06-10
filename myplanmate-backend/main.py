# ============================================================
#  MyPlanMate – Python FastAPI Backend
#  File: main.py
# ============================================================

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime, timedelta
import os
import uuid
import hashlib
import hmac
import base64
import json

from supabase import create_client, Client
from dotenv import load_dotenv

# ── Load environment variables ──────────────────────────────
load_dotenv()

SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_KEY")
JWT_SECRET        = os.getenv("JWT_SECRET", "change-me-in-production")
FRONTEND_URL      = os.getenv("FRONTEND_URL", "http://localhost:5173")

print("SUPABASE_URL =", SUPABASE_URL)
print("KEY EXISTS =", bool(SUPABASE_KEY))
print("KEY START =", SUPABASE_KEY[:15] if SUPABASE_KEY else None)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")

# ── Supabase client ──────────────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── FastAPI app ──────────────────────────────────────────────
app = FastAPI(
    title="MyPlanMate API",
    description="Backend for the MyPlanMate student scheduling app",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# ============================================================
#  Simple JWT helpers (no external library needed)
# ============================================================

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * padding)

def create_token(user_id: str, email: str) -> str:
    header  = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = _b64url_encode(json.dumps({
        "sub": user_id,
        "email": email,
        "exp": (datetime.utcnow() + timedelta(days=7)).timestamp(),
    }).encode())
    signature = _b64url_encode(
        hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    )
    return f"{header}.{payload}.{signature}"

def verify_token(token: str) -> dict:
    try:
        header, payload, signature = token.split(".")
        expected_sig = _b64url_encode(
            hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature")
        data = json.loads(_b64url_decode(payload))
        if data["exp"] < datetime.utcnow().timestamp():
            raise ValueError("Token expired")
        return data
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def hash_password(password: str) -> str:
    """SHA-256 hash – acceptable for an academic MVP."""
    return hashlib.sha256(password.encode()).hexdigest()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return verify_token(credentials.credentials)


# ============================================================
#  Pydantic Models (Request / Response)
# ============================================================

# ── Auth ────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    course_name: Optional[str] = None
    student_type: Optional[str] = None
    weekly_work_limit: Optional[int] = 20

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: str
    username: str
    email: str
    course_name: Optional[str]
    student_type: Optional[str]
    weekly_work_limit: int

# ── Classes ─────────────────────────────────────────────────
class ClassCreate(BaseModel):
    class_name: str
    date: date
    time: str          # "HH:MM"

class ClassResponse(ClassCreate):
    id: str
    user_id: str
    created_at: str

# ── Work Shifts ──────────────────────────────────────────────
class ShiftCreate(BaseModel):
    workplace_name: str
    date: date
    time: str
    duration_hours: float

class ShiftResponse(ShiftCreate):
    id: str
    user_id: str
    created_at: str

# ── Assessments ──────────────────────────────────────────────
class AssessmentCreate(BaseModel):
    assessment_title: str
    due_date: date
    time: str

class AssessmentResponse(AssessmentCreate):
    id: str
    user_id: str
    created_at: str

# ── Daily Check-ins ──────────────────────────────────────────
class CheckinCreate(BaseModel):
    attended_class: bool
    went_to_work: bool
    worked_on_assessment: bool
    hours_worked: float

class CheckinResponse(CheckinCreate):
    id: str
    user_id: str
    checkin_date: str
    created_at: str

# ── Dashboard ────────────────────────────────────────────────
class DashboardResponse(BaseModel):
    upcoming_classes: List[ClassResponse]
    upcoming_shifts: List[ShiftResponse]
    upcoming_assessments: List[AssessmentResponse]
    notifications: List[str]


# ============================================================
#  Health Check
# ============================================================

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "MyPlanMate API v1.0"}


# ============================================================
#  Auth Routes
# ============================================================

@app.post("/auth/register", response_model=AuthResponse, status_code=201, tags=["Auth"])
def register(body: RegisterRequest):
    """Register a new user account."""
    # Check if email already exists
    existing = supabase.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "id": str(uuid.uuid4()),
        "username": body.username,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "course_name": body.course_name,
        "student_type": body.student_type,
        "weekly_work_limit": body.weekly_work_limit or 20,
    }

    result = supabase.table("users").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    token = create_token(user["id"], user["email"])

    return AuthResponse(
        token=token,
        user_id=user["id"],
        username=user["username"],
        email=user["email"],
        course_name=user.get("course_name"),
        student_type=user.get("student_type"),
        weekly_work_limit=user["weekly_work_limit"],
    )


@app.post("/auth/login", response_model=AuthResponse, tags=["Auth"])
def login(body: LoginRequest):
    """Login with email and password."""
    result = supabase.table("users").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]
    if user["password_hash"] != hash_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"], user["email"])

    return AuthResponse(
        token=token,
        user_id=user["id"],
        username=user["username"],
        email=user["email"],
        course_name=user.get("course_name"),
        student_type=user.get("student_type"),
        weekly_work_limit=user["weekly_work_limit"],
    )


# ============================================================
#  Classes Routes
# ============================================================

@app.post("/classes", response_model=ClassResponse, status_code=201, tags=["Classes"])
def add_class(body: ClassCreate, current_user: dict = Depends(get_current_user)):
    """Save a new class to the database."""
    new_class = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["sub"],
        "class_name": body.class_name,
        "date": str(body.date),
        "time": body.time,
    }
    result = supabase.table("classes").insert(new_class).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save class")

    row = result.data[0]
    return ClassResponse(**{**body.dict(), "id": row["id"], "user_id": row["user_id"], "created_at": str(row["created_at"])})


@app.get("/classes", response_model=List[ClassResponse], tags=["Classes"])
def get_classes(current_user: dict = Depends(get_current_user)):
    """Get all classes for the logged-in user."""
    result = supabase.table("classes") \
        .select("*") \
        .eq("user_id", current_user["sub"]) \
        .order("date", desc=False) \
        .execute()
    return [
        ClassResponse(
            id=r["id"], user_id=r["user_id"], class_name=r["class_name"],
            date=r["date"], time=r["time"], created_at=str(r["created_at"])
        )
        for r in result.data
    ]


@app.delete("/classes/{class_id}", status_code=204, tags=["Classes"])
def delete_class(class_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a class (only the owner can delete)."""
    supabase.table("classes") \
        .delete() \
        .eq("id", class_id) \
        .eq("user_id", current_user["sub"]) \
        .execute()


# ============================================================
#  Work Shifts Routes
# ============================================================

@app.post("/shifts", response_model=ShiftResponse, status_code=201, tags=["Work Shifts"])
def add_shift(body: ShiftCreate, current_user: dict = Depends(get_current_user)):
    """Save a new work shift."""
    new_shift = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["sub"],
        "workplace_name": body.workplace_name,
        "date": str(body.date),
        "time": body.time,
        "duration_hours": body.duration_hours,
    }
    result = supabase.table("work_shifts").insert(new_shift).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save shift")

    row = result.data[0]
    return ShiftResponse(**{**body.dict(), "id": row["id"], "user_id": row["user_id"], "created_at": str(row["created_at"])})


@app.get("/shifts", response_model=List[ShiftResponse], tags=["Work Shifts"])
def get_shifts(current_user: dict = Depends(get_current_user)):
    """Get all work shifts for the logged-in user."""
    result = supabase.table("work_shifts") \
        .select("*") \
        .eq("user_id", current_user["sub"]) \
        .order("date", desc=False) \
        .execute()
    return [
        ShiftResponse(
            id=r["id"], user_id=r["user_id"], workplace_name=r["workplace_name"],
            date=r["date"], time=r["time"], duration_hours=r["duration_hours"],
            created_at=str(r["created_at"])
        )
        for r in result.data
    ]


@app.delete("/shifts/{shift_id}", status_code=204, tags=["Work Shifts"])
def delete_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("work_shifts") \
        .delete() \
        .eq("id", shift_id) \
        .eq("user_id", current_user["sub"]) \
        .execute()


# ============================================================
#  Assessments Routes
# ============================================================

@app.post("/assessments", response_model=AssessmentResponse, status_code=201, tags=["Assessments"])
def add_assessment(body: AssessmentCreate, current_user: dict = Depends(get_current_user)):
    """Save a new assessment."""
    new_assessment = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["sub"],
        "assessment_title": body.assessment_title,
        "due_date": str(body.due_date),
        "time": body.time,
    }
    result = supabase.table("assessments").insert(new_assessment).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save assessment")

    row = result.data[0]
    return AssessmentResponse(**{**body.dict(), "id": row["id"], "user_id": row["user_id"], "created_at": str(row["created_at"])})


@app.get("/assessments", response_model=List[AssessmentResponse], tags=["Assessments"])
def get_assessments(current_user: dict = Depends(get_current_user)):
    """Get all assessments for the logged-in user."""
    result = supabase.table("assessments") \
        .select("*") \
        .eq("user_id", current_user["sub"]) \
        .order("due_date", desc=False) \
        .execute()
    return [
        AssessmentResponse(
            id=r["id"], user_id=r["user_id"], assessment_title=r["assessment_title"],
            due_date=r["due_date"], time=r["time"], created_at=str(r["created_at"])
        )
        for r in result.data
    ]


@app.delete("/assessments/{assessment_id}", status_code=204, tags=["Assessments"])
def delete_assessment(assessment_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("assessments") \
        .delete() \
        .eq("id", assessment_id) \
        .eq("user_id", current_user["sub"]) \
        .execute()


# ============================================================
#  Daily Check-ins Routes
# ============================================================

@app.post("/checkins", response_model=CheckinResponse, status_code=201, tags=["Check-ins"])
def add_checkin(body: CheckinCreate, current_user: dict = Depends(get_current_user)):
    """Submit today's daily check-in."""
    new_checkin = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["sub"],
        "checkin_date": str(date.today()),
        "attended_class": body.attended_class,
        "went_to_work": body.went_to_work,
        "worked_on_assessment": body.worked_on_assessment,
        "hours_worked": body.hours_worked,
    }
    result = supabase.table("daily_checkins").insert(new_checkin).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save check-in")

    row = result.data[0]
    return CheckinResponse(
        **{**body.dict(), "id": row["id"], "user_id": row["user_id"],
           "checkin_date": str(row["checkin_date"]), "created_at": str(row["created_at"])}
    )


@app.get("/checkins", response_model=List[CheckinResponse], tags=["Check-ins"])
def get_checkins(current_user: dict = Depends(get_current_user)):
    """Get all check-ins for the logged-in user."""
    result = supabase.table("daily_checkins") \
        .select("*") \
        .eq("user_id", current_user["sub"]) \
        .order("checkin_date", desc=True) \
        .execute()
    return [
        CheckinResponse(
            id=r["id"], user_id=r["user_id"], checkin_date=str(r["checkin_date"]),
            attended_class=r["attended_class"], went_to_work=r["went_to_work"],
            worked_on_assessment=r["worked_on_assessment"],
            hours_worked=r["hours_worked"], created_at=str(r["created_at"])
        )
        for r in result.data
    ]


# ============================================================
#  Dashboard (combined data + smart notifications)
# ============================================================

@app.get("/dashboard", response_model=DashboardResponse, tags=["Dashboard"])
def get_dashboard(current_user: dict = Depends(get_current_user)):
    """
    Returns upcoming classes, shifts, assessments, and smart
    notification messages for the logged-in user.
    """
    user_id   = current_user["sub"]
    today     = date.today()
    in_7_days = today + timedelta(days=7)

    # ── Fetch upcoming data ──────────────────────────────────
    classes_res = supabase.table("classes") \
        .select("*").eq("user_id", user_id) \
        .gte("date", str(today)).lte("date", str(in_7_days)) \
        .order("date").execute()

    shifts_res = supabase.table("work_shifts") \
        .select("*").eq("user_id", user_id) \
        .gte("date", str(today)).lte("date", str(in_7_days)) \
        .order("date").execute()

    assessments_res = supabase.table("assessments") \
        .select("*").eq("user_id", user_id) \
        .gte("due_date", str(today)).lte("due_date", str(in_7_days)) \
        .order("due_date").execute()

    # ── Weekly work-hours calculation ────────────────────────
    week_start = today - timedelta(days=today.weekday())
    week_end   = week_start + timedelta(days=6)

    weekly_shifts = supabase.table("work_shifts") \
        .select("duration_hours").eq("user_id", user_id) \
        .gte("date", str(week_start)).lte("date", str(week_end)) \
        .execute()

    total_weekly_hours = sum(float(r["duration_hours"]) for r in weekly_shifts.data)

    # Fetch user's weekly limit
    user_res = supabase.table("users") \
        .select("weekly_work_limit, username").eq("id", user_id).execute()
    weekly_limit = 20
    if user_res.data:
        weekly_limit = user_res.data[0].get("weekly_work_limit", 20) or 20

    # ── Build smart notifications ────────────────────────────
    notifications: List[str] = []

    for c in classes_res.data:
        days_away = (date.fromisoformat(c["date"]) - today).days
        if days_away == 0:
            notifications.append(f"📚 Class today – {c['class_name']} at {c['time']}")
        elif days_away == 1:
            notifications.append(f"📚 Class tomorrow – {c['class_name']} at {c['time']}")

    for s in shifts_res.data:
        days_away = (date.fromisoformat(s["date"]) - today).days
        if days_away == 0:
            notifications.append(f"💼 Work shift today at {s['time']} ({s['workplace_name']})")
        elif days_away == 1:
            notifications.append(f"💼 Work shift tomorrow at {s['time']} ({s['workplace_name']})")

    for a in assessments_res.data:
        days_away = (date.fromisoformat(a["due_date"]) - today).days
        if days_away == 0:
            notifications.append(f"⚠️ Assessment due TODAY – {a['assessment_title']}")
        elif days_away <= 3:
            notifications.append(f"⚠️ Assessment due in {days_away} days – {a['assessment_title']}")
        elif days_away <= 7:
            notifications.append(f"📝 Assessment due in {days_away} days – {a['assessment_title']}")

    hours_left = weekly_limit - total_weekly_hours
    if total_weekly_hours >= weekly_limit:
        notifications.append(
            f"🚨 You have reached your weekly work limit of {weekly_limit} hrs. "
            "Be careful not to exceed your allowed hours."
        )
    elif hours_left <= 2:
        notifications.append(
            f"⚠️ You worked {total_weekly_hours:.1f} hrs this week. "
            f"Only {hours_left:.1f} hr(s) left before your limit."
        )

    if not notifications:
        notifications.append("✅ All good! No urgent reminders right now.")

    # ── Build response ───────────────────────────────────────
    upcoming_classes = [
        ClassResponse(id=r["id"], user_id=r["user_id"], class_name=r["class_name"],
                      date=r["date"], time=r["time"], created_at=str(r["created_at"]))
        for r in classes_res.data
    ]
    upcoming_shifts = [
        ShiftResponse(id=r["id"], user_id=r["user_id"], workplace_name=r["workplace_name"],
                      date=r["date"], time=r["time"], duration_hours=r["duration_hours"],
                      created_at=str(r["created_at"]))
        for r in shifts_res.data
    ]
    upcoming_assessments = [
        AssessmentResponse(id=r["id"], user_id=r["user_id"], assessment_title=r["assessment_title"],
                           due_date=r["due_date"], time=r["time"], created_at=str(r["created_at"]))
        for r in assessments_res.data
    ]

    return DashboardResponse(
        upcoming_classes=upcoming_classes,
        upcoming_shifts=upcoming_shifts,
        upcoming_assessments=upcoming_assessments,
        notifications=notifications,
    )


# ============================================================
#  Calendar – events for a specific date
# ============================================================

@app.get("/calendar/{target_date}", tags=["Calendar"])
def get_calendar_events(target_date: str, current_user: dict = Depends(get_current_user)):
    """
    Returns all classes, shifts, and assessments for a given date (YYYY-MM-DD).
    Used by the Calendar screen to show day-specific events.
    """
    user_id = current_user["sub"]

    classes_res = supabase.table("classes") \
        .select("*").eq("user_id", user_id).eq("date", target_date).execute()

    shifts_res = supabase.table("work_shifts") \
        .select("*").eq("user_id", user_id).eq("date", target_date).execute()

    assessments_res = supabase.table("assessments") \
        .select("*").eq("user_id", user_id).eq("due_date", target_date).execute()

    events = []

    for c in classes_res.data:
        events.append({"type": "class", "title": c["class_name"], "time": c["time"], "id": c["id"]})

    for s in shifts_res.data:
        events.append({
            "type": "shift", "title": s["workplace_name"],
            "time": s["time"], "duration_hours": s["duration_hours"], "id": s["id"]
        })

    for a in assessments_res.data:
        events.append({"type": "assessment", "title": a["assessment_title"], "time": a["time"], "id": a["id"]})

    return {"date": target_date, "events": events}
