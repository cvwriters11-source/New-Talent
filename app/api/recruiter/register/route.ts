import { NextResponse } from "next/server";
import {
  RECRUITER_COOKIE,
  createRecruiterToken,
} from "@/lib/recruiter/auth";
import { registerRecruiter } from "@/lib/recruiter/store";
import { uploadPublicFile } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/jpg", "image/webp"]);

function isAllowedImage(file: File) {
  const name = file.name.toLowerCase();
  return (
    IMAGE_TYPES.has(file.type) ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

function normalizeWebsite(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const company = String(form.get("company") || "").trim();
  const registrationNumber = String(
    form.get("registrationNumber") || "",
  ).trim();
  const website = normalizeWebsite(String(form.get("website") || ""));
  const whatsapp = String(form.get("whatsapp") || "").trim();
  const logo = form.get("logo");

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (company.length < 2) {
    return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  }
  if (registrationNumber.length < 2) {
    return NextResponse.json(
      { error: "Company registration number is required." },
      { status: 400 },
    );
  }
  try {
    const parsed = new URL(website);
    if (!parsed.hostname.includes(".")) {
      throw new Error("invalid");
    }
  } catch {
    return NextResponse.json(
      { error: "Enter a valid company website address." },
      { status: 400 },
    );
  }
  if (!(logo instanceof File) || logo.size === 0) {
    return NextResponse.json(
      { error: "Company logo is required." },
      { status: 400 },
    );
  }
  if (!isAllowedImage(logo)) {
    return NextResponse.json(
      { error: "Logo must be a JPG, PNG, or WebP image." },
      { status: 400 },
    );
  }
  if (logo.size > MAX_LOGO_BYTES) {
    return NextResponse.json(
      { error: "Logo must be under 2MB." },
      { status: 400 },
    );
  }

  let logoUrl: string | null = null;
  try {
    logoUrl = await uploadPublicFile(logo, "recruiters/logos");
  } catch (err) {
    console.error("[recruiter] logo upload failed", err);
  }
  if (!logoUrl) {
    return NextResponse.json(
      { error: "Could not upload logo. Try again." },
      { status: 502 },
    );
  }

  try {
    const recruiter = await registerRecruiter({
      name,
      email,
      password,
      company,
      registrationNumber,
      website,
      logoUrl,
      whatsapp: whatsapp || undefined,
    });
    const token = await createRecruiterToken({
      id: recruiter.id,
      email: recruiter.email,
      name: recruiter.name,
      company: recruiter.company,
    });
    const res = NextResponse.json({
      ok: true,
      recruiter,
      message:
        "Account created. An admin will verify your registration before you can post jobs.",
    });
    res.cookies.set(RECRUITER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 },
    );
  }
}
