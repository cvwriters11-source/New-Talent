import { NextResponse } from "next/server";
import { parseCvFromText } from "@/lib/resume/ai";
import { extractTextFromUpload } from "@/lib/resume/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let rawText = "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const pasted = form.get("text");
      if (typeof pasted === "string" && pasted.trim()) {
        rawText = pasted.trim();
      } else if (file instanceof File && file.size > 0) {
        if (file.size > 8_000_000) {
          return NextResponse.json(
            { error: "File is too large (max 8MB)." },
            { status: 400 },
          );
        }
        rawText = await extractTextFromUpload(file);
      }
    } else {
      const body = (await request.json()) as { text?: string };
      rawText = (body.text || "").trim();
    }

    if (!rawText || rawText.length < 40) {
      return NextResponse.json(
        {
          error:
            "Not enough text to parse. Upload a clearer PDF or paste your CV content.",
        },
        { status: 400 },
      );
    }

    const cv = await parseCvFromText(rawText);
    return NextResponse.json({ cv, extractedChars: rawText.length });
  } catch (err) {
    console.error("[api/resume/parse]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not parse this CV. Try another file.",
      },
      { status: 500 },
    );
  }
}
