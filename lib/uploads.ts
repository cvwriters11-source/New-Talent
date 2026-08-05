import { put } from "@vercel/blob";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/server";

const BUCKET = "tc-uploads";

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
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
  if (!isSupabaseAdminConfigured()) return null;
  const client = createAdminClient();
  const path = `${folder}/${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    console.warn("[uploads] supabase storage failed", error.message);
    return null;
  }
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}

/**
 * Uploads a checkout/invoice file and returns a durable public URL.
 * Prefers Vercel Blob, then Supabase Storage (service role).
 */
export async function uploadPublicFile(
  file: File,
  folder: string,
): Promise<string | null> {
  try {
    const blobUrl = await uploadToVercelBlob(file, folder);
    if (blobUrl) return blobUrl;
  } catch (err) {
    console.warn("[uploads] vercel blob failed", err);
  }

  try {
    const supabaseUrl = await uploadToSupabaseStorage(file, folder);
    if (supabaseUrl) return supabaseUrl;
  } catch (err) {
    console.warn("[uploads] supabase upload threw", err);
  }

  return null;
}

export function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url) || url.toLowerCase().includes("application/pdf");
}

export function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)($|\?)/i.test(url);
}
