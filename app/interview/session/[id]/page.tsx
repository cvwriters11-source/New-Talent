import { notFound, redirect } from "next/navigation";
import { VoiceInterviewRoom } from "@/components/interview/VoiceInterviewRoom";
import { getCandidateSession } from "@/lib/interview/auth";
import {
  pickQuestionsForDuration,
  type InterviewDuration,
} from "@/lib/interview/question-bank";
import { getSession, getTurnsForSession } from "@/lib/interview/store";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getCandidateSession();
  if (!auth) redirect("/interview");

  const { id } = await params;
  const session = await getSession(id);
  if (!session || session.candidateId !== auth.id) notFound();

  if (session.status === "completed" || session.status === "abandoned") {
    redirect(`/interview/session/${id}/results`);
  }

  const questions = pickQuestionsForDuration(
    session.durationMinutes as InterviewDuration,
  );
  const turns = await getTurnsForSession(id);
  // If turns already exist mid-session, room will ask next unanswered; if all answered, go results
  const allAnswered =
    turns.length >= questions.length &&
    turns.every((t) => t.answerTranscript);

  if (allAnswered) {
    redirect(`/interview/session/${id}/results`);
  }

  return (
    <VoiceInterviewRoom
      sessionId={id}
      initialSession={session}
      initialQuestions={questions}
    />
  );
}
