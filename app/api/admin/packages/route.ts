import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/auth";
import {
  deletePackage,
  upsertPackage,
  type CareerPackage,
} from "@/lib/admin/store";
import { slugifyPackageName } from "@/lib/packages";

export const runtime = "nodejs";

const colorSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(60),
  hex: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
});

const packageSchema = z.object({
  slug: z.string().trim().min(1).max(80).optional(),
  previousSlug: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(120).optional().nullable(),
  tagline: z.string().trim().min(2).max(240),
  summary: z.string().trim().min(2).max(4000),
  priceLabel: z.string().trim().min(1).max(80),
  includes: z.array(z.string().trim().min(1).max(400)).min(1).max(40),
  idealFor: z.string().trim().min(2).max(500),
  timeline: z.string().trim().min(1).max(120),
  region: z.string().trim().max(120).optional().nullable(),
  quoteAmount: z.number().finite().min(0).max(1_000_000),
  sampleImage: z.string().trim().max(300).optional().nullable(),
  active: z.boolean().optional(),
  colorOptions: z.array(colorSchema).max(12).optional(),
});

function toPackage(data: z.infer<typeof packageSchema>): CareerPackage {
  const slug = (data.slug || slugifyPackageName(data.name)).toLowerCase();
  return {
    slug,
    name: data.name,
    subtitle: data.subtitle || undefined,
    tagline: data.tagline,
    summary: data.summary,
    priceLabel: data.priceLabel,
    includes: data.includes,
    idealFor: data.idealFor,
    timeline: data.timeline,
    region: data.region || undefined,
    quoteAmount: data.quoteAmount,
    sampleImage: data.sampleImage || undefined,
    active: data.active !== false,
    colorOptions: data.colorOptions?.length ? data.colorOptions : undefined,
  };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the package fields." },
      { status: 400 },
    );
  }

  try {
    const pkg = await upsertPackage(toPackage(parsed.data));
    return NextResponse.json({ ok: true, package: pkg });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save package." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the package fields." },
      { status: 400 },
    );
  }

  try {
    const pkg = await upsertPackage(toPackage(parsed.data), {
      previousSlug: parsed.data.previousSlug || parsed.data.slug,
    });
    return NextResponse.json({ ok: true, package: pkg });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update package." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.slug) {
    return NextResponse.json({ error: "Slug required." }, { status: 400 });
  }

  const removed = await deletePackage(body.slug);
  if (!removed) {
    return NextResponse.json({ error: "Package not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
