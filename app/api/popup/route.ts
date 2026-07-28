import { NextResponse } from "next/server";
import { getSitePopup } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const popup = await getSitePopup();
  if (!popup.active) {
    return NextResponse.json({ active: false });
  }
  return NextResponse.json({
    active: true,
    title: popup.title,
    message: popup.message,
    imageUrl: popup.imageUrl || null,
    ctaLabel: popup.ctaLabel || "",
    ctaHref: popup.ctaHref || "",
    updatedAt: popup.updatedAt,
  });
}
