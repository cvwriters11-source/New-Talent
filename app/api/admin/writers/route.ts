import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  deleteWriter,
  listWriters,
  upsertWriter,
} from "@/lib/admin/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const writers = await listWriters();
  return NextResponse.json({ writers });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const writer = await upsertWriter({
      id: body.id,
      name: body.name || "",
      email: body.email || "",
    });
    return NextResponse.json({ ok: true, writer });
  } catch (err) {
    console.error("[admin/writers]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save writer.",
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "Writer id is required." }, { status: 400 });
  }

  try {
    const ok = await deleteWriter(body.id);
    if (!ok) {
      return NextResponse.json({ error: "Writer not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/writers]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not delete writer.",
      },
      { status: 502 },
    );
  }
}
