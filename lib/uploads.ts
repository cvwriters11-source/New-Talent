import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  createAdminClient,
  createAnonClient,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

const BUCKET = "tc-uploads";
const UPLOAD_TIMEOUT_MS = 15_000;

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

async function uploadToVercelBlob(file: File, folder: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return null;
  const blob = await put(
    `${folder}/${Date.now()}-${safeFileName(file.name)}`,
    file,
    { access: "public", token },
  );
  return blob.url;
}

async function uploadToSupabaseStorage(file: File, folder: string) {
  if (!isSupabaseConfigured()) return null;

  const client = isSupabaseAdminConfigured()
    ? createAdminClient()
    : createAnonClient();

  const pathName = `${folder}/${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(BUCKET).upload(pathName, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    console.warn("[uploads] supabase storage failed", error.message);
    return null;
  }
  const { data } = client.storage.from(BUCKET).getPublicUrl(pathName);
  return data.publicUrl || null;
}

/** Local/dev fallback so checkout files stay viewable in admin without cloud tokens. */
async function uploadToLocalPublic(file: File, folder: string) {
  // Vercel serverless filesystem is ephemeral — skip there.
  if (process.env.VERCEL) return null;

  const safeFolder = folder
    .split("/")
    .map((part) => safeFileName(part))
    .filter(Boolean)
    .join("/");
  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${safeFileName(file.name)}`;
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
  return `${siteOrigin()}/uploads/${safeFolder}/${filename}`;
}

/**
 * Uploads a checkout/invoice file and returns a durable public URL.
 * Prefers Vercel Blob, then Supabase Storage, then local public/uploads.
 */
export async function uploadPublicFile(
  file: File,
  folder: string,
): Promise<string | null> {
  try {
    const blobUrl = await withTimeout(
      uploadToVercelBlob(file, folder),
      UPLOAD_TIMEOUT_MS,
      "vercel blob",
    );
    if (blobUrl) return blobUrl;
  } catch (err) {
    console.warn("[uploads] vercel blob failed", err);
  }

  try {
    const supabaseUrl = await withTimeout(
      uploadToSupabaseStorage(file, folder),
      UPLOAD_TIMEOUT_MS,
      "supabase storage",
    );
    if (supabaseUrl) return supabaseUrl;
  } catch (err) {
    console.warn("[uploads] supabase upload threw", err);
  }

  try {
    const localUrl = await withTimeout(
      uploadToLocalPublic(file, folder),
      UPLOAD_TIMEOUT_MS,
      "local upload",
    );
    if (localUrl) return localUrl;
  } catch (err) {
    console.warn("[uploads] local upload failed", err);
  }

  return null;
}

export function isPdfUrl(url: string) {
  return (
    /\.pdf($|\?)/i.test(url) ||
    url.toLowerCase().includes("application/pdf") ||
    url.toLowerCase().includes("/uploads/")
  );
}

export function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)($|\?)/i.test(url);
}

export function isDocUrl(url: string) {
  return /\.(docx?|DOCX?)($|\?)/.test(url);
}
