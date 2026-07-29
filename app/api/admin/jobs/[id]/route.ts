import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getJob, updateJob, type JobStatus } from "@/lib/recruiter/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getJob(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { status?: JobStatus; adminNote?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const allowed: JobStatus[] = ["pending", "published", "rejected", "closed"];
  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const job = await updateJob(id, {
    status: body.status,
    adminNote:
      body.adminNote !== undefined
        ? body.adminNote.trim() || null
        : existing.adminNote,
    publishedAt:
      body.status === "published"
        ? existing.publishedAt || now
        : body.status === "pending"
          ? null
          : existing.publishedAt,
  });

  return NextResponse.json({ job });
}
