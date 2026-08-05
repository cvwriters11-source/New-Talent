-- Applied remotely via Supabase MCP (tc_interview_sessions)
-- Project: jwgjsotzauhwkgobywdr

CREATE TABLE IF NOT EXISTS public.tc_interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  surname text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  interviewer text CHECK (interviewer IN ('lisa', 'clemence')),
  duration_minutes integer CHECK (duration_minutes IN (15, 30, 60)),
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'in_progress', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tc_interview_sessions ENABLE ROW LEVEL SECURITY;
