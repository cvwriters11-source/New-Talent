export type InterviewerId = "lisa" | "clemence";

export type InterviewDuration = 15 | 30 | 60;

export type InterviewSessionStatus =
  | "registered"
  | "in_progress"
  | "completed";

export type InterviewSession = {
  sessionId?: string;
  firstName: string;
  surname: string;
  position: string;
  phone: string;
  email: string;
  interviewer: InterviewerId;
  durationMinutes: InterviewDuration;
};

export type InterviewPhase = "greeting" | "interview" | "wrapup";

export type InterviewApiContext = {
  firstName: string;
  surname: string;
  position: string;
  phone: string;
  email: string;
  interviewer: InterviewerId;
  durationMinutes: InterviewDuration;
  phase?: InterviewPhase;
  elapsedMinutes?: number;
  sessionId?: string;
};

export type VoiceStatus =
  | "idle"
  | "speaking"
  | "listening"
  | "processing"
  | "error";

export type TranscriptRole = "user" | "assistant" | "system";

export type TranscriptEntry = {
  id: string;
  role: TranscriptRole;
  content: string;
};

export type InterviewAudioClip = {
  id: string;
  role: "user" | "assistant" | "system";
  url: string;
  text?: string;
};

export type InterviewCorrection = {
  question: string;
  candidateAnswer: string;
  whatWorked: string;
  betterAnswer: string;
};

export type InterviewResults = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: InterviewCorrection[];
  closingAdvice: string;
};
