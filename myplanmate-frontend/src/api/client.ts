// ============================================================
//  MyPlanMate – API Client
//  All fetch calls to the Python backend go through here.
//  Replaces the old localStorage calls from Assignment 2.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Helper: get the JWT token stored after login ────────────
function getToken(): string | null {
  return localStorage.getItem("mpm_token");
}

// ── Helper: build headers (with or without auth) ────────────
function headers(auth = true): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
}

// ── Helper: handle response errors cleanly ─────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

// ============================================================
//  Types (mirrors Pydantic models from backend)
// ============================================================
export interface User {
  token: string;
  user_id: string;
  username: string;
  email: string;
  course_name?: string;
  student_type?: string;
  weekly_work_limit: number;
}

export interface ClassItem {
  id: string;
  user_id: string;
  class_name: string;
  date: string;
  time: string;
  created_at: string;
}

export interface ShiftItem {
  id: string;
  user_id: string;
  workplace_name: string;
  date: string;
  time: string;
  duration_hours: number;
  created_at: string;
}

export interface AssessmentItem {
  id: string;
  user_id: string;
  assessment_title: string;
  due_date: string;
  time: string;
  created_at: string;
}

export interface CheckinItem {
  id: string;
  user_id: string;
  checkin_date: string;
  attended_class: boolean;
  went_to_work: boolean;
  worked_on_assessment: boolean;
  hours_worked: number;
  created_at: string;
}

export interface DashboardData {
  upcoming_classes: ClassItem[];
  upcoming_shifts: ShiftItem[];
  upcoming_assessments: AssessmentItem[];
  notifications: string[];
}

export interface CalendarEvent {
  id: string;
  type: "class" | "shift" | "assessment";
  title: string;
  time: string;
  duration_hours?: number;
}

// ============================================================
//  Auth
// ============================================================
export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    course_name?: string;
    student_type?: string;
    weekly_work_limit?: number;
  }) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<User>(r)),

  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify({ email, password }),
    }).then((r) => handleResponse<User>(r)),
};

// ============================================================
//  Classes
// ============================================================
export const classesApi = {
  getAll: () =>
    fetch(`${BASE_URL}/classes`, { headers: headers() }).then((r) =>
      handleResponse<ClassItem[]>(r)
    ),

  add: (body: { class_name: string; date: string; time: string }) =>
    fetch(`${BASE_URL}/classes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<ClassItem>(r)),

  delete: (id: string) =>
    fetch(`${BASE_URL}/classes/${id}`, {
      method: "DELETE",
      headers: headers(),
    }),
};

// ============================================================
//  Work Shifts
// ============================================================
export const shiftsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/shifts`, { headers: headers() }).then((r) =>
      handleResponse<ShiftItem[]>(r)
    ),

  add: (body: {
    workplace_name: string;
    date: string;
    time: string;
    duration_hours: number;
  }) =>
    fetch(`${BASE_URL}/shifts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<ShiftItem>(r)),

  delete: (id: string) =>
    fetch(`${BASE_URL}/shifts/${id}`, {
      method: "DELETE",
      headers: headers(),
    }),
};

// ============================================================
//  Assessments
// ============================================================
export const assessmentsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/assessments`, { headers: headers() }).then((r) =>
      handleResponse<AssessmentItem[]>(r)
    ),

  add: (body: {
    assessment_title: string;
    due_date: string;
    time: string;
  }) =>
    fetch(`${BASE_URL}/assessments`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<AssessmentItem>(r)),

  delete: (id: string) =>
    fetch(`${BASE_URL}/assessments/${id}`, {
      method: "DELETE",
      headers: headers(),
    }),
};

// ============================================================
//  Daily Check-ins
// ============================================================
export const checkinsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/checkins`, { headers: headers() }).then((r) =>
      handleResponse<CheckinItem[]>(r)
    ),

  add: (body: {
    attended_class: boolean;
    went_to_work: boolean;
    worked_on_assessment: boolean;
    hours_worked: number;
  }) =>
    fetch(`${BASE_URL}/checkins`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<CheckinItem>(r)),
};

// ============================================================
//  Dashboard
// ============================================================
export const dashboardApi = {
  get: () =>
    fetch(`${BASE_URL}/dashboard`, { headers: headers() }).then((r) =>
      handleResponse<DashboardData>(r)
    ),
};

// ============================================================
//  Calendar
// ============================================================
export const calendarApi = {
  getByDate: (dateStr: string) =>
    fetch(`${BASE_URL}/calendar/${dateStr}`, { headers: headers() }).then(
      (r) =>
        handleResponse<{ date: string; events: CalendarEvent[] }>(r)
    ),
};
