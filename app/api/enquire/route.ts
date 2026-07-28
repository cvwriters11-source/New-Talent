import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getPackageBySlug } from "@/lib/admin/store";
import type { CareerPackage } from "@/lib/packages";
import { site } from "@/lib/site";

const enquireSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  packageSlug: z.string().trim().min(1).max(80),
  cvColor: z.string().trim().max(40).nullable().optional(),
  preferredContact: z.enum(["whatsapp", "email", "either"]),
  message: z.string().trim().min(10).max(4000),
});

function resolvePackageLabel(
  pkg: CareerPackage | undefined,
  slug: string,
): string {
  if (slug === "not-sure") return "Not sure yet";
  if (!pkg) return slug;
  return pkg.subtitle ? `${pkg.name} (${pkg.subtitle})` : pkg.name;
}

function resolveColorLabel(
  pkg: CareerPackage | undefined,
  colorId?: string | null,
): string | null {
  if (!colorId) return null;
  return pkg?.colorOptions?.find((c) => c.id === colorId)?.label || colorId;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = enquireSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const pkg =
    data.packageSlug === "not-sure"
      ? undefined
      : await getPackageBySlug(data.packageSlug);

  if (pkg?.colorOptions?.length) {
    const valid = pkg.colorOptions.some((c) => c.id === data.cvColor);
    if (!valid) {
      return NextResponse.json(
        { error: "Please choose a CV colour for this package." },
        { status: 400 },
      );
    }
  }

  const packageLabel = resolvePackageLabel(pkg, data.packageSlug);
  const colorLabel = resolveColorLabel(pkg, data.cvColor);
  const to = process.env.CONTACT_EMAIL || site.email;
  const subject = `Career Development enquiry — ${packageLabel}`;
  const text = [
    `New Career Development enquiry`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Package: ${packageLabel}`,
    colorLabel ? `CV colour: ${colorLabel}` : null,
    `Preferred contact: ${data.preferredContact}`,
    ``,
    `Message:`,
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[enquire] RESEND_API_KEY missing — logging enquiry only.");
    console.info(text);
    return NextResponse.json({ ok: true, mode: "logged" });
  }

  try {
    const resend = new Resend(apiKey);
    const from =
      process.env.RESEND_FROM_EMAIL || "Talent Crafters <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: data.email,
      subject,
      text,
    });

    if (error) {
      console.error("[enquire] Resend error", error);
      return NextResponse.json(
        { error: "Could not send enquiry right now. Please try WhatsApp." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[enquire] Unexpected error", err);
    return NextResponse.json(
      { error: "Could not send enquiry right now. Please try WhatsApp." },
      { status: 500 },
    );
  }
}
