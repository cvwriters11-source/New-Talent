import { promises as fs } from "fs";
import path from "path";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/server";
import {
  hashPassword,
  localCandidateId,
  verifyPassword,
} from "@/lib/interview/candidate-session";
import {
  interviewQuestionBank,
  type InterviewDuration,
} from "@/lib/interview/question-bank";

export type InterviewCandidate = {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type InterviewSessionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "abandoned";

export type InterviewSession = {
  id: string;
  candidateId: string;
  durationMinutes: InterviewDuration;
  status: InterviewSessionStatus;
  accessTier: "free" | "paid";
  orderId: string | null;
  targetRole: string | null;
  startedAt: string | null;
  endedAt: string | null;
  overallScore: number | null;
  summaryFeedback: string | null;
  fixAreas: string[];
  createdAt: string;
};

export type InterviewTurn = {
  id: string;
  sessionId: string;
  questionId: string | null;
  questionSlug: string | null;
  questionText: string;
  answerTranscript: string | null;
  audioUrl: string | null;
  score: number | null;
  feedback: string | null;
  fixAreas: string[];
  askedAt: string;
  answeredAt: string | null;
  sortOrder: number;
};

type CandidateRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  whatsapp: string | null;
  last_login_at: string | null;
  created_at: string;
};

type SessionRow = {
  id: string;
  candidate_id: string;
  duration_minutes: number;
  status: InterviewSessionStatus;
  access_tier: string;
  order_id: string | null;
  target_role: string | null;
  started_at: string | null;
  ended_at: string | null;
  overall_score: number | string | null;
  summary_feedback: string | null;
  fix_areas: unknown;
  created_at: string;
};

type TurnRow = {
  id: string;
  session_id: string;
  question_id: string | null;
  question_slug: string | null;
  question_text: string;
  answer_transcript: string | null;
  audio_url: string | null;
  score: number | string | null;
  feedback: string | null;
  fix_areas: unknown;
  asked_at: string;
  answered_at: string | null;
  sort_order: number;
};

type LocalStore = {
  candidates: (CandidateRow & { password_hash: string })[];
  sessions: SessionRow[];
  turns: TurnRow[];
};

const STORE_PATH = path.join(process.cwd(), "data", "interview-store.json");

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function mapCandidate(row: CandidateRow): InterviewCandidate {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

function mapSession(row: SessionRow): InterviewSession {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    durationMinutes: row.duration_minutes as InterviewDuration,
    status: row.status,
    accessTier: row.access_tier === "paid" ? "paid" : "free",
    orderId: row.order_id,
    targetRole: row.target_role,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    overallScore:
      row.overall_score === null || row.overall_score === undefined
        ? null
        : Number(row.overall_score),
    summaryFeedback: row.summary_feedback,
    fixAreas: asStringArray(row.fix_areas),
    createdAt: row.created_at,
  };
}

function mapTurn(row: TurnRow): InterviewTurn {
  return {
    id: row.id,
    sessionId: row.session_id,
    questionId: row.question_id,
    questionSlug: row.question_slug,
    questionText: row.question_text,
    answerTranscript: row.answer_transcript,
    audioUrl: row.audio_url,
    score:
      row.score === null || row.score === undefined ? null : Number(row.score),
    feedback: row.feedback,
    fixAreas: asStringArray(row.fix_areas),
    askedAt: row.asked_at,
    answeredAt: row.answered_at,
    sortOrder: row.sort_order,
  };
}

async function readLocal(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch {
    return { candidates: [], sessions: [], turns: [] };
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function newId() {
  return crypto.randomUUID();
}

export async function ensureQuestionBankSeeded() {
  if (!isSupabaseAdminConfigured()) return;
  const sb = createAdminClient();
  const { count } = await sb
    .from("tc_interview_questions")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return;
  await sb.from("tc_interview_questions").upsert(
    interviewQuestionBank.map((q) => ({
      slug: q.slug,
      prompt: q.prompt,
      why_asking: q.whyAsking ?? null,
      sample_answer: q.sampleAnswer,
      category: q.category,
      sort_order: q.sortOrder,
    })),
    { onConflict: "slug" },
  );
}

export async function registerCandidate(input: {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
}): Promise<InterviewCandidate> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const passwordHash = hashPassword(input.password);
  const whatsapp = input.whatsapp?.trim() || null;

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("tc_interview_candidates")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        whatsapp,
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("EMAIL_TAKEN");
      throw error;
    }
    return mapCandidate(data as CandidateRow);
  }

  const store = await readLocal();
  if (store.candidates.some((c) => c.email === email)) {
    throw new Error("EMAIL_TAKEN");
  }
  const row: CandidateRow = {
    id: localCandidateId(email),
    name,
    email,
    password_hash: passwordHash,
    whatsapp,
    last_login_at: null,
    created_at: new Date().toISOString(),
  };
  store.candidates.push(row);
  await writeLocal(store);
  return mapCandidate(row);
}

export async function authenticateCandidate(
  emailRaw: string,
  password: string,
): Promise<InterviewCandidate | null> {
  const email = emailRaw.trim().toLowerCase();

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_candidates")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!data) return null;
    const row = data as CandidateRow;
    if (!verifyPassword(password, row.password_hash)) return null;
    const now = new Date().toISOString();
    await sb
      .from("tc_interview_candidates")
      .update({ last_login_at: now })
      .eq("id", row.id);
    return mapCandidate({ ...row, last_login_at: now });
  }

  const store = await readLocal();
  const row = store.candidates.find((c) => c.email === email);
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  row.last_login_at = new Date().toISOString();
  await writeLocal(store);
  return mapCandidate(row);
}

export async function getCandidateById(
  id: string,
): Promise<InterviewCandidate | null> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_candidates")
      .select("id,name,email,whatsapp,last_login_at,created_at")
      .eq("id", id)
      .maybeSingle();
    return data ? mapCandidate(data as CandidateRow) : null;
  }
  const store = await readLocal();
  const row = store.candidates.find((c) => c.id === id);
  return row ? mapCandidate(row) : null;
}

export async function listCandidates(): Promise<
  (InterviewCandidate & { sessionCount: number })[]
> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data: candidates } = await sb
      .from("tc_interview_candidates")
      .select("id,name,email,whatsapp,last_login_at,created_at")
      .order("created_at", { ascending: false });
    const { data: sessions } = await sb
      .from("tc_interview_sessions")
      .select("candidate_id");
    const counts = new Map<string, number>();
    for (const s of sessions ?? []) {
      const id = (s as { candidate_id: string }).candidate_id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return (candidates ?? []).map((c) => ({
      ...mapCandidate(c as CandidateRow),
      sessionCount: counts.get((c as CandidateRow).id) ?? 0,
    }));
  }

  const store = await readLocal();
  return store.candidates
    .map((c) => ({
      ...mapCandidate(c),
      sessionCount: store.sessions.filter((s) => s.candidate_id === c.id).length,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createInterviewSession(input: {
  candidateId: string;
  durationMinutes: InterviewDuration;
  targetRole?: string;
}): Promise<InterviewSession> {
  const now = new Date().toISOString();
  if (isSupabaseAdminConfigured()) {
    await ensureQuestionBankSeeded();
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("tc_interview_sessions")
      .insert({
        candidate_id: input.candidateId,
        duration_minutes: input.durationMinutes,
        status: "pending",
        access_tier: "free",
        order_id: null,
        target_role: input.targetRole?.trim() || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapSession(data as SessionRow);
  }

  const store = await readLocal();
  const row: SessionRow = {
    id: newId(),
    candidate_id: input.candidateId,
    duration_minutes: input.durationMinutes,
    status: "pending",
    access_tier: "free",
    order_id: null,
    target_role: input.targetRole?.trim() || null,
    started_at: null,
    ended_at: null,
    overall_score: null,
    summary_feedback: null,
    fix_areas: [],
    created_at: now,
  };
  store.sessions.push(row);
  await writeLocal(store);
  return mapSession(row);
}

export async function getSession(id: string): Promise<InterviewSession | null> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapSession(data as SessionRow) : null;
  }
  const store = await readLocal();
  const row = store.sessions.find((s) => s.id === id);
  return row ? mapSession(row) : null;
}

export async function listSessionsForCandidate(
  candidateId: string,
): Promise<InterviewSession[]> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_sessions")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((r) => mapSession(r as SessionRow));
  }
  const store = await readLocal();
  return store.sessions
    .filter((s) => s.candidate_id === candidateId)
    .map(mapSession)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllSessions(): Promise<
  (InterviewSession & {
    candidateName: string;
    candidateEmail: string;
  })[]
> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data: sessions } = await sb
      .from("tc_interview_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const { data: candidates } = await sb
      .from("tc_interview_candidates")
      .select("id,name,email");
    const map = new Map(
      (candidates ?? []).map((c) => [
        (c as { id: string }).id,
        c as { id: string; name: string; email: string },
      ]),
    );
    return (sessions ?? []).map((s) => {
      const session = mapSession(s as SessionRow);
      const cand = map.get(session.candidateId);
      return {
        ...session,
        candidateName: cand?.name ?? "Unknown",
        candidateEmail: cand?.email ?? "",
      };
    });
  }

  const store = await readLocal();
  return store.sessions
    .map((s) => {
      const cand = store.candidates.find((c) => c.id === s.candidate_id);
      return {
        ...mapSession(s),
        candidateName: cand?.name ?? "Unknown",
        candidateEmail: cand?.email ?? "",
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function startSession(id: string): Promise<InterviewSession | null> {
  const now = new Date().toISOString();
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_sessions")
      .update({ status: "in_progress", started_at: now })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? mapSession(data as SessionRow) : null;
  }
  const store = await readLocal();
  const row = store.sessions.find((s) => s.id === id);
  if (!row) return null;
  row.status = "in_progress";
  row.started_at = now;
  await writeLocal(store);
  return mapSession(row);
}

export async function completeSession(
  id: string,
  input: {
    overallScore: number;
    summaryFeedback: string;
    fixAreas: string[];
    status?: "completed" | "abandoned";
  },
): Promise<InterviewSession | null> {
  const now = new Date().toISOString();
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_sessions")
      .update({
        status: input.status ?? "completed",
        ended_at: now,
        overall_score: input.overallScore,
        summary_feedback: input.summaryFeedback,
        fix_areas: input.fixAreas,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? mapSession(data as SessionRow) : null;
  }
  const store = await readLocal();
  const row = store.sessions.find((s) => s.id === id);
  if (!row) return null;
  row.status = input.status ?? "completed";
  row.ended_at = now;
  row.overall_score = input.overallScore;
  row.summary_feedback = input.summaryFeedback;
  row.fix_areas = input.fixAreas;
  await writeLocal(store);
  return mapSession(row);
}

export async function getTurnsForSession(
  sessionId: string,
): Promise<InterviewTurn[]> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_turns")
      .select("*")
      .eq("session_id", sessionId)
      .order("sort_order", { ascending: true });
    return (data ?? []).map((r) => mapTurn(r as TurnRow));
  }
  const store = await readLocal();
  return store.turns
    .filter((t) => t.session_id === sessionId)
    .map(mapTurn)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTurn(input: {
  sessionId: string;
  questionSlug: string;
  questionText: string;
  sortOrder: number;
}): Promise<InterviewTurn> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    let questionId: string | null = null;
    const { data: q } = await sb
      .from("tc_interview_questions")
      .select("id")
      .eq("slug", input.questionSlug)
      .maybeSingle();
    questionId = (q as { id: string } | null)?.id ?? null;

    const { data, error } = await sb
      .from("tc_interview_turns")
      .insert({
        session_id: input.sessionId,
        question_id: questionId,
        question_slug: input.questionSlug,
        question_text: input.questionText,
        sort_order: input.sortOrder,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapTurn(data as TurnRow);
  }

  const store = await readLocal();
  const row: TurnRow = {
    id: newId(),
    session_id: input.sessionId,
    question_id: null,
    question_slug: input.questionSlug,
    question_text: input.questionText,
    answer_transcript: null,
    audio_url: null,
    score: null,
    feedback: null,
    fix_areas: [],
    asked_at: new Date().toISOString(),
    answered_at: null,
    sort_order: input.sortOrder,
  };
  store.turns.push(row);
  await writeLocal(store);
  return mapTurn(row);
}

export async function updateTurnAnswer(
  turnId: string,
  input: {
    answerTranscript: string;
    audioUrl?: string | null;
    score: number;
    feedback: string;
    fixAreas: string[];
  },
): Promise<InterviewTurn | null> {
  const now = new Date().toISOString();
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_interview_turns")
      .update({
        answer_transcript: input.answerTranscript,
        audio_url: input.audioUrl ?? null,
        score: input.score,
        feedback: input.feedback,
        fix_areas: input.fixAreas,
        answered_at: now,
      })
      .eq("id", turnId)
      .select("*")
      .maybeSingle();
    return data ? mapTurn(data as TurnRow) : null;
  }
  const store = await readLocal();
  const row = store.turns.find((t) => t.id === turnId);
  if (!row) return null;
  row.answer_transcript = input.answerTranscript;
  row.audio_url = input.audioUrl ?? null;
  row.score = input.score;
  row.feedback = input.feedback;
  row.fix_areas = input.fixAreas;
  row.answered_at = now;
  await writeLocal(store);
  return mapTurn(row);
}

export async function getQuestionSample(slug: string): Promise<string | null> {
  const bank = interviewQuestionBank.find((q) => q.slug === slug);
  if (bank) return bank.sampleAnswer;
  if (!isSupabaseAdminConfigured()) return null;
  const sb = createAdminClient();
  const { data } = await sb
    .from("tc_interview_questions")
    .select("sample_answer")
    .eq("slug", slug)
    .maybeSingle();
  return (data as { sample_answer: string } | null)?.sample_answer ?? null;
}
