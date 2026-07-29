import type { CandidateSession } from "@/lib/interview/candidate-session";

/**
 * Free practice for now. When paid launches, require an order_id / package
 * entitlement here and reject candidates without access.
 */
export function assertInterviewAccess(_candidate: CandidateSession): {
  allowed: boolean;
  accessTier: "free";
  reason?: string;
} {
  return { allowed: true, accessTier: "free" };
}
