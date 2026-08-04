import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { addCheckoutOrder } from "@/lib/admin/store";

export const runtime = "nodejs";

const INVOICE_EMAIL = "sam@creative-cv.co.za";
const MAX_CV_BYTES = 8 * 1024 * 1024;
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

const fieldsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  countryCode: z.string().trim().regex(/^\+\d{1,4}$/),
  whatsapp: z.string().trim().min(6).max(20),
});

const CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

const PICTURE_TYPES = new Set(["image/jpeg", "image/png", "image/jpg"]);

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

function normalizeWhatsapp(countryCode: string, raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  const codeDigits = countryCode.replace(/\D/g, "");
  return `+${codeDigits}${digits}`;
}

async function uploadIfConfigured(file: File, folder: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const blob = await put(`invoice/${folder}/${Date.now()}-${safeName}`, file, {
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = fieldsSchema.safeParse({
    firstName: form.get("firstName"),
    surname: form.get("surname"),
    countryCode: form.get("countryCode"),
    whatsapp: form.get("whatsapp"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your name and WhatsApp number." },
      { status: 400 },
    );
  }

  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: "Please upload your CV." }, { status: 400 });
  }
  if (!isAllowedCv(cv)) {
    return NextResponse.json(
      { error: "CV must be a PDF, DOC, or DOCX file." },
      { status: 400 },
    );
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json(
      { error: "CV must be under 8MB." },
      { status: 400 },
    );
  }

  const pictureRaw = form.get("picture");
  const pictureFile =
    pictureRaw instanceof File && pictureRaw.size > 0 ? pictureRaw : null;
  if (pictureFile) {
    if (!isAllowedPicture(pictureFile)) {
      return NextResponse.json(
        { error: "Picture must be a JPG or PNG." },
        { status: 400 },
      );
    }
    if (pictureFile.size > MAX_PICTURE_BYTES) {
      return NextResponse.json(
        { error: "Picture must be under 5MB." },
        { status: 400 },
      );
    }
  }

  const data = parsed.data;
  const whatsapp = normalizeWhatsapp(data.countryCode, data.whatsapp);
  const placeholderEmail = `invoice.${Date.now()}@talentcrafters.local`;

  let cvUrl: string | null = null;
  let pictureUrl: string | null = null;
  try {
    cvUrl = await uploadIfConfigured(cv, "cv");
    if (pictureFile) {
      pictureUrl = await uploadIfConfigured(pictureFile, "pictures");
    }
  } catch (err) {
    console.error("[invoice-request] Blob upload failed", err);
    return NextResponse.json(
      { error: "Could not upload files. Please try again." },
      { status: 500 },
    );
  }

  let order;
  try {
    order = await addCheckoutOrder({
      firstName: data.firstName,
      surname: data.surname,
      email: placeholderEmail,
      whatsapp,
      location: "Invoice request",
      country: data.countryCode,
      packageSlug: "invoice-request",
      cvUrl,
      pictureUrl,
    });
  } catch (err) {
    console.error("[invoice-request] admin store failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not save this request. Please try WhatsApp.",
      },
      { status: 502 },
    );
  }

  const text = [
    `New invoice request from Talent Crafters contact page`,
    ``,
    `Order number: ${order.orderNumber}`,
    `Name: ${data.firstName} ${data.surname}`,
    `WhatsApp: ${whatsapp}`,
    `Country code: ${data.countryCode}`,
    ``,
    `CV file: ${cv.name} (${Math.round(cv.size / 1024)} KB)`,
    cvUrl ? `CV URL: ${cvUrl}` : "CV URL: attached / not uploaded to blob",
    pictureFile
      ? `Picture file: ${pictureFile.name} (${Math.round(pictureFile.size / 1024)} KB)`
      : "Picture: not provided",
    pictureUrl ? `Picture URL: ${pictureUrl}` : null,
    ``,
    `Please send an invoice and follow up on WhatsApp.`,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[invoice-request] RESEND_API_KEY missing — logging only.");
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
      to: [INVOICE_EMAIL],
      subject: `Invoice request ${order.orderNumber} — ${data.firstName} ${data.surname}`,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error("[invoice-request] Resend error", error);
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
    console.error("[invoice-request] Unexpected email error", err);
    return NextResponse.json({
      ok: true,
      emailSent: false,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  }
}
