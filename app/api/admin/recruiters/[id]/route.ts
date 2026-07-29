import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  updateRecruiterVerification,
  type VerificationStatus,
} from "@/lib/recruiter/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: { status?: VerificationStatus; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const allowed: VerificationStatus[] = ["pending", "approved", "rejected"];
  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const recruiter = await updateRecruiterVerification(
    id,
    body.status,
    body.note,
  );
  if (!recruiter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ recruiter });
}
