-- Applied remotely via Supabase MCP
-- Adds results, transcript, and audio clip storage for interview sessions

ALTER TABLE public.tc_interview_sessions
  ADD COLUMN IF NOT EXISTS transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results jsonb,
  ADD COLUMN IF NOT EXISTS overall_score integer,
  ADD COLUMN IF NOT EXISTS audio_clips jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;
