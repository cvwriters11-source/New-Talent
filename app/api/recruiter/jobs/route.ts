import { NextResponse } from "next/server";
import { getRecruiterSession } from "@/lib/recruiter/auth";
import {
  createJob,
  listJobsForRecruiter,
  type EmploymentType,
} from "@/lib/recruiter/store";

export const runtime = "nodejs";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "remote",
];

export async function GET() {
  const session = await getRecruiterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await listJobsForRecruiter(session.id);
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await getRecruiterSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    companyName?: string;
    location?: string;
    employmentType?: string;
    description?: string;
    requirements?: string;
    salaryLabel?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = body.title?.trim() || "";
  const companyName = body.companyName?.trim() || session.company;
  const location = body.location?.trim() || "";
  const employmentType = body.employmentType as EmploymentType;
  const description = body.description?.trim() || "";
  const requirements = body.requirements?.trim() || "";
  const salaryLabel = body.salaryLabel?.trim();

  if (title.length < 2) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (location.length < 2) {
    return NextResponse.json({ error: "Location is required." }, { status: 400 });
  }
  if (!EMPLOYMENT_TYPES.includes(employmentType)) {
    return NextResponse.json(
      { error: "Invalid employment type." },
      { status: 400 },
    );
  }
  if (description.length < 10) {
    return NextResponse.json(
      { error: "Description is required." },
      { status: 400 },
    );
  }
  if (requirements.length < 5) {
    return NextResponse.json(
      { error: "Requirements are required." },
      { status: 400 },
    );
  }

  try {
    const job = await createJob({
      recruiterId: session.id,
      title,
      companyName,
      location,
      employmentType,
      description,
      requirements,
      salaryLabel,
      contactEmail: session.email,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create job." },
      { status: 500 },
    );
  }
}
