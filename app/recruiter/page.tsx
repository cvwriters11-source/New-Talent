import { redirect } from "next/navigation";
import { getRecruiterSession } from "@/lib/recruiter/auth";

export default async function RecruiterIndexPage() {
  const session = await getRecruiterSession();
  redirect(session ? "/recruiter/dashboard" : "/recruiter/login");
}
