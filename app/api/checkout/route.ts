import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { addCheckoutOrder, getPackageBySlug } from "@/lib/admin/store";
import type { CareerPackage } from "@/lib/packages";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const MAX_CV_BYTES = 8 * 1024 * 1024;
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

const checkoutFieldsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  whatsapp: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200),
  location: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  packageSlug: z.string().trim().min(1).max(80),
  cvColor: z.string().trim().max(40).nullable().optional(),
  acceptTerms: z.literal("yes"),
});

const CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

const PICTURE_TYPES = new Set(["image/jpeg", "image/png", "image/jpg"]);

function resolvePackageLabel(pkg: CareerPackage | undefined, slug: string): string {
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

function isAllowedCv(file: File) {
  const name = file.name.toLowerCase();
  return (
    CV_TYPES.has(file.type) ||
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  );
}

function isAllowedPicture(file: File) {
  const name = file.name.toLowerCase();
  return (
    PICTURE_TYPES.has(file.type) ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

async function uploadIfConfigured(file: File, folder: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const blob = await put(`checkout/${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const parsed = checkoutFieldsSchema.safeParse({
    firstName: form.get("firstName"),
    surname: form.get("surname"),
    whatsapp: form.get("whatsapp"),
    email: form.get("email"),
    location: form.get("location"),
    country: form.get("country"),
    packageSlug: form.get("packageSlug"),
    cvColor: form.get("cvColor") || null,
    acceptTerms: form.get("acceptTerms"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error:
          issue?.message ||
          "Please check the form fields and try again.",
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const pkg = await getPackageBySlug(data.packageSlug);
  if (!pkg) {
    return NextResponse.json({ error: "Invalid package." }, { status: 400 });
  }
  if (pkg.colorOptions?.length) {
    const valid = pkg.colorOptions.some((c) => c.id === data.cvColor);
    if (!valid) {
      return NextResponse.json(
        { error: "Please choose a CV colour for this package." },
        { status: 400 },
      );
    }
  }

  const cv = form.get("cv");
  const picture = form.get("picture");

  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json(
      { error: "Please upload your CV (PDF, DOC, or DOCX)." },
      { status: 400 },
    );
  }
  if (!isAllowedCv(cv)) {
    return NextResponse.json(
      { error: "CV must be a PDF, DOC, or DOCX file." },
      { status: 400 },
    );
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json(
      { error: "CV must be 8MB or smaller." },
      { status: 400 },
    );
  }

  let pictureFile: File | null = null;
  if (picture instanceof File && picture.size > 0) {
    if (!isAllowedPicture(picture)) {
      return NextResponse.json(
        { error: "Picture must be a JPG or PNG file." },
        { status: 400 },
      );
    }
    if (picture.size > MAX_PICTURE_BYTES) {
      return NextResponse.json(
        { error: "Picture must be 5MB or smaller." },
        { status: 400 },
      );
    }
    pictureFile = picture;
  }

  let cvUrl: string | null = null;
  let pictureUrl: string | null = null;
  try {
    cvUrl = await uploadIfConfigured(cv, "cv");
    if (pictureFile) {
      pictureUrl = await uploadIfConfigured(pictureFile, "pictures");
    }
  } catch (err) {
    console.error("[checkout] Blob upload failed", err);
    return NextResponse.json(
      { error: "Could not upload files. Please try again." },
      { status: 502 },
    );
  }

  const packageLabel = resolvePackageLabel(pkg, data.packageSlug);
  const colorLabel = resolveColorLabel(pkg, data.cvColor);

  let order;
  try {
    order = await addCheckoutOrder({
      firstName: data.firstName,
      surname: data.surname,
      email: data.email,
      whatsapp: data.whatsapp,
      location: data.location,
      country: data.country,
      packageSlug: data.packageSlug,
      cvColor: colorLabel,
      cvUrl,
      pictureUrl,
    });
  } catch (err) {
    console.error("[checkout] admin store failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not save this order. Please try WhatsApp.",
      },
      { status: 502 },
    );
  }

  const to = process.env.CONTACT_EMAIL || site.email;
  const subject = `Order ${order.orderNumber} — ${packageLabel}`;
  const text = [
    `New Career Development checkout order`,
    ``,
    `Order number: ${order.orderNumber}`,
    `Name: ${data.firstName} ${data.surname}`,
    `Email: ${data.email}`,
    `WhatsApp: ${data.whatsapp}`,
    `Location: ${data.location}`,
    `Country: ${data.country}`,
    `Package: ${packageLabel}`,
    colorLabel ? `CV colour: ${colorLabel}` : null,
    `Terms accepted: yes`,
    ``,
    `CV file: ${cv.name} (${Math.round(cv.size / 1024)} KB)`,
    cvUrl ? `CV URL: ${cvUrl}` : "CV URL: not uploaded (BLOB_READ_WRITE_TOKEN missing)",
    pictureFile
      ? `Picture file: ${pictureFile.name} (${Math.round(pictureFile.size / 1024)} KB)`
      : "Picture: not provided",
    pictureUrl ? `Picture URL: ${pictureUrl}` : null,
    ``,
    `Follow up with quote and payment instructions.`,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[checkout] RESEND_API_KEY missing — logging order only.");
    console.info(text);
    return NextResponse.json({
      ok: true,
      mode: "logged",
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  }

  try {
    const resend = new Resend(apiKey);
    const from =
      process.env.RESEND_FROM_EMAIL || "Talent Crafters <onboarding@resend.dev>";

    const attachments: { filename: string; content: Buffer }[] = [];
    if (!cvUrl) {
      attachments.push({
        filename: cv.name,
        content: Buffer.from(await cv.arrayBuffer()),
      });
    }
    if (pictureFile && !pictureUrl) {
      attachments.push({
        filename: pictureFile.name,
        content: Buffer.from(await pictureFile.arrayBuffer()),
      });
    }

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: data.email,
      subject,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error("[checkout] Resend error", error);
      return NextResponse.json({
        ok: true,
        emailSent: false,
        orderNumber: order.orderNumber,
        orderId: order.id,
      });
    }

    return NextResponse.json({
      ok: true,
      emailSent: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (err) {
    console.error("[checkout] Unexpected email error", err);
    return NextResponse.json({
      ok: true,
      emailSent: false,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  }
}
