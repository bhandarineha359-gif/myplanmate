# MyPlanMate – Python Backend

FastAPI backend for the MyPlanMate student scheduling app.  
Connects to Supabase and is deployable to Vercel.

---

## Project Structure

```
myplanmate-backend/
├── main.py               ← All API routes
├── requirements.txt      ← Python dependencies
├── vercel.json           ← Vercel deployment config
├── .env.example          ← Copy to .env and fill in values
├── .gitignore            ← Excludes .env and cache files
└── supabase_schema.sql   ← Run this in Supabase SQL Editor
```

---

## Setup (Local)

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Set environment variables
```bash
cp .env.example .env
# Open .env and fill in your Supabase URL, service key, and JWT secret
```

### 3. Create database tables
- Open Supabase Dashboard → SQL Editor → New Query
- Paste the contents of `supabase_schema.sql` and click Run

### 4. Run locally
```bash
uvicorn main:app --reload
```
API will be live at: http://localhost:8000  
Interactive docs at: http://localhost:8000/docs

---

## Deployment (Vercel)

1. Push this folder to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Set these Environment Variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your React frontend Vercel URL)
4. Deploy

---

## API Endpoints

| Method | Endpoint                  | Description                        | Auth Required |
|--------|---------------------------|------------------------------------|---------------|
| GET    | /                         | Health check                       | No            |
| POST   | /auth/register            | Create new account                 | No            |
| POST   | /auth/login               | Login, returns JWT token           | No            |
| POST   | /classes                  | Add a class                        | Yes           |
| GET    | /classes                  | Get all classes                    | Yes           |
| DELETE | /classes/{id}             | Delete a class                     | Yes           |
| POST   | /shifts                   | Add a work shift                   | Yes           |
| GET    | /shifts                   | Get all work shifts                | Yes           |
| DELETE | /shifts/{id}              | Delete a shift                     | Yes           |
| POST   | /assessments              | Add an assessment                  | Yes           |
| GET    | /assessments              | Get all assessments                | Yes           |
| DELETE | /assessments/{id}         | Delete an assessment               | Yes           |
| POST   | /checkins                 | Submit daily check-in              | Yes           |
| GET    | /checkins                 | Get all check-ins                  | Yes           |
| GET    | /dashboard                | Dashboard data + notifications     | Yes           |
| GET    | /calendar/{YYYY-MM-DD}    | Events for a specific date         | Yes           |

---

## Security Notes

- Supabase keys are stored in `.env` (environment variables), never in code
- JWT tokens expire after 7 days
- Passwords are hashed with SHA-256 before storage
- CORS is restricted to your frontend URL only
- `.env` is excluded from Git via `.gitignore`
