import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getSitePopup, updateSitePopup } from "@/lib/admin/store";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
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

async function savePopupImage(file: File): Promise<string> {
  const ext =
    file.name.toLowerCase().match(/\.(jpe?g|png|webp)$/)?.[0] || ".jpg";
  const filename = `popup-${Date.now()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`popup/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error("BLOB_REQUIRED");
  }

  const dir = path.join(process.cwd(), "public", "uploads", "popup");
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/popup/${filename}`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const popup = await getSitePopup();
  return NextResponse.json({ popup });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const title = String(form.get("title") || "").trim();
  const message = String(form.get("message") || "").trim();
  const ctaLabel = String(form.get("ctaLabel") || "").trim();
  const ctaHref = String(form.get("ctaHref") || "").trim();
  const active = String(form.get("active") || "") === "true";
  const clearImage = String(form.get("clearImage") || "") === "true";
  const imageUrlField = String(form.get("imageUrl") || "").trim();
  const image = form.get("image");

  if (!title || title.length > 120) {
    return NextResponse.json(
      { error: "Title is required (max 120 characters)." },
      { status: 400 },
    );
  }
  if (!message || message.length > 800) {
    return NextResponse.json(
      { error: "Message is required (max 800 characters)." },
      { status: 400 },
    );
  }

  let imageUrl: string | null | undefined = undefined;
  if (clearImage) {
    imageUrl = null;
  } else if (image instanceof File && image.size > 0) {
    if (!isAllowedImage(image)) {
      return NextResponse.json(
        { error: "Image must be JPG, PNG, or WebP." },
        { status: 400 },
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 2MB or smaller." },
        { status: 400 },
      );
    }
    try {
      imageUrl = await savePopupImage(image);
    } catch (err) {
      console.error("[popup] image upload failed", err);
      const message =
        err instanceof Error && err.message === "BLOB_REQUIRED"
          ? "Image upload requires BLOB_READ_WRITE_TOKEN on Vercel."
          : "Could not upload image. Try again.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } else if (imageUrlField) {
    imageUrl = imageUrlField;
  }

  const popup = await updateSitePopup({
    active,
    title,
    message,
    ctaLabel,
    ctaHref,
    imageUrl,
    clearImage: clearImage && imageUrl === null,
  });

  return NextResponse.json({ ok: true, popup });
}
