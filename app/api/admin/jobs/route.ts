import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { listAllJobs } from "@/lib/recruiter/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await listAllJobs();
  return NextResponse.json({ jobs });
}
