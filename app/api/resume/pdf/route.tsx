import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { SamuelCvPdfDocument } from "@/lib/resume/pdf-document";
import { parseResumeCv } from "@/lib/resume/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cv = parseResumeCv(body?.cv ?? body);
    if (!cv.fullName.trim()) {
      return NextResponse.json(
        { error: "Add a full name before generating a PDF." },
        { status: 400 },
      );
    }

    const buffer = await renderToBuffer(<SamuelCvPdfDocument cv={cv} />);
    const filename = `${cv.fullName.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_") || "CV"}_Talent_Crafters.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/resume/pdf]", err);
    return NextResponse.json(
      { error: "Could not generate the PDF." },
      { status: 500 },
    );
  }
}
