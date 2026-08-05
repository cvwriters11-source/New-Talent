import type { Metadata } from "next";
import { InterviewPrepCoach } from "@/components/InterviewPrepCoach";

export const metadata: Metadata = {
  title: "Interview Preparation",
  description:
    "AI-powered interview coaching from Talent Crafters — practice questions, STAR feedback, and confidence before your next interview.",
};

export default function InterviewPrepPage() {
  return (
    <div className="bg-cream">
      <InterviewPrepCoach />
    </div>
  );
}
