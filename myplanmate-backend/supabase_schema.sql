-- ============================================================
--  MyPlanMate – Supabase Database Schema
--  Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    course_name   TEXT,
    student_type  TEXT,
    weekly_work_limit INTEGER DEFAULT 20,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_name  TEXT NOT NULL,
    date        DATE NOT NULL,
    time        TIME NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORK SHIFTS
CREATE TABLE IF NOT EXISTS work_shifts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workplace_name   TEXT NOT NULL,
    date             DATE NOT NULL,
    time             TIME NOT NULL,
    duration_hours   NUMERIC(4,2) NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSESSMENTS
CREATE TABLE IF NOT EXISTS assessments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_title  TEXT NOT NULL,
    due_date          DATE NOT NULL,
    time              TIME NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DAILY CHECK-INS
CREATE TABLE IF NOT EXISTS daily_checkins (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    attended_class          BOOLEAN NOT NULL DEFAULT FALSE,
    went_to_work            BOOLEAN NOT NULL DEFAULT FALSE,
    worked_on_assessment    BOOLEAN NOT NULL DEFAULT FALSE,
    hours_worked            NUMERIC(4,2) DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  Row Level Security (RLS) – users can only see their own data
-- ============================================================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_shifts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Allow the service-role key (used by backend) to bypass RLS
-- The policies below are for reference if you later add Supabase Auth

-- classes: user sees only their rows
CREATE POLICY "users_own_classes" ON classes
    USING (user_id = auth.uid());

-- work_shifts
CREATE POLICY "users_own_shifts" ON work_shifts
    USING (user_id = auth.uid());

-- assessments
CREATE POLICY "users_own_assessments" ON assessments
    USING (user_id = auth.uid());

-- daily_checkins
CREATE POLICY "users_own_checkins" ON daily_checkins
    USING (user_id = auth.uid());

-- ============================================================
--  Indexes for faster lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_classes_user        ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user         ON work_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user    ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user       ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date         ON work_shifts(user_id, date);
