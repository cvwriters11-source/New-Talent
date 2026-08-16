import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getOrderById } from "@/lib/admin/store";

export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

function guessContentType(url: string, kind: "cv" | "picture") {
  const lower = url.toLowerCase();
  if (kind === "picture") {
    if (lower.includes(".png")) return "image/png";
    if (lower.includes(".webp")) return "image/webp";
    return "image/jpeg";
  }
  if (lower.includes(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.includes(".doc")) return "application/msword";
  return "application/pdf";
}

function fileNameFromUrl(url: string, fallback: string) {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.split("?")[0] || fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") === "picture" ? "picture" : "cv";
  const asDownload = searchParams.get("download") === "1";
  const probeOnly = searchParams.get("probe") === "1";
  const fileUrl = kind === "picture" ? order.pictureUrl : order.cvUrl;

  if (!fileUrl) {
    return NextResponse.json(
      { error: kind === "picture" ? "No picture on this order." : "No CV on this order." },
      { status: 404 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(fileUrl, {
      cache: "no-store",
      headers: { Accept: "*/*" },
    });
  } catch (err) {
    console.error("[admin order file] fetch failed", err);
    return NextResponse.json(
      { error: "Could not reach the stored file." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Stored file returned ${upstream.status}.` },
      { status: 502 },
    );
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  const contentType =
    upstream.headers.get("content-type") ||
    guessContentType(fileUrl, kind);

  // Tiny / stub PDFs break the browser viewer — surface a clear error.
  const isInvalidPdf =
    kind === "cv" &&
    (contentType.includes("pdf") || fileUrl.toLowerCase().includes(".pdf")) &&
    (buffer.length < 200 ||
      !buffer.subarray(0, 5).toString("utf8").startsWith("%PDF"));

  if (isInvalidPdf) {
    const message =
      "This CV file is incomplete or not a valid PDF. Ask the client to upload again.";
    if (probeOnly || request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>CV unavailable</title>
<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;margin:0}
main{max-width:28rem;padding:1.5rem;border:1px solid #334155;border-radius:12px;background:#1e293b}
h1{font-size:1.1rem;margin:0 0 .5rem}p{margin:0;color:#94a3b8;line-height:1.5}</style></head>
<body><main><h1>Could not open CV</h1><p>${message}</p></main></body></html>`,
      {
        status: 422,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  if (probeOnly) {
    return NextResponse.json({
      ok: true,
      contentType,
      size: buffer.length,
      filename: fileNameFromUrl(
        fileUrl,
        kind === "picture"
          ? `${order.orderNumber || order.id}-picture`
          : `${order.orderNumber || order.id}-cv.pdf`,
      ),
    });
  }

  const filename = `${(order.orderNumber || order.id).replace(/[^\w.-]+/g, "_")}-${
    kind === "picture" ? "picture" : "cv"
  }${
    kind === "picture"
      ? fileUrl.toLowerCase().includes(".png")
        ? ".png"
        : ".jpg"
      : fileUrl.toLowerCase().includes(".docx")
        ? ".docx"
        : fileUrl.toLowerCase().includes(".doc") &&
            !fileUrl.toLowerCase().includes(".docx")
          ? ".doc"
          : ".pdf"
  }`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        contentType.includes("octet-stream") || !contentType
          ? guessContentType(fileUrl, kind)
          : contentType.split(";")[0].trim(),
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
