import { NextResponse } from "next/server";
import { getRecruiterSession } from "@/lib/recruiter/auth";
import {
  getJob,
  getRecruiterById,
  updateJob,
  type EmploymentType,
} from "@/lib/recruiter/store";

export const runtime = "nodejs";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "remote",
];

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const session = await getRecruiterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job || job.recruiterId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function PATCH(request: Request, context: Ctx) {
  const session = await getRecruiterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const recruiter = await getRecruiterById(session.id);
  if (!recruiter || recruiter.verificationStatus !== "approved") {
    return NextResponse.json(
      { error: "Account must be verified to update jobs." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const existing = await getJob(id);
  if (!existing || existing.recruiterId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    companyName?: string;
    location?: string;
    employmentType?: string;
    description?: string;
    requirements?: string;
    salaryLabel?: string | null;
    close?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.close) {
    const job = await updateJob(
      id,
      { status: "closed" },
      { recruiterId: session.id },
    );
    return NextResponse.json({ job });
  }

  const employmentType = body.employmentType as EmploymentType | undefined;
  if (
    employmentType !== undefined &&
    !EMPLOYMENT_TYPES.includes(employmentType)
  ) {
    return NextResponse.json(
      { error: "Invalid employment type." },
      { status: 400 },
    );
  }

  const resubmit =
    existing.status === "rejected" || existing.status === "closed";

  const job = await updateJob(
    id,
    {
      title: body.title,
      companyName: body.companyName,
      location: body.location,
      employmentType,
      description: body.description,
      requirements: body.requirements,
      salaryLabel: body.salaryLabel,
      companyLogoUrl: recruiter.logoUrl,
      ...(resubmit
        ? {
            status: "pending" as const,
            adminNote: null,
            publishedAt: null,
          }
        : existing.status === "published"
          ? { status: "pending" as const, publishedAt: null }
          : {}),
    },
    { recruiterId: session.id },
  );

  return NextResponse.json({ job });
}
