import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getOrderById, updateOrder } from "@/lib/admin/store";
import { uploadPublicFile } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_CV_BYTES = 8 * 1024 * 1024;
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

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

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const cv = form.get("cv");
  const picture = form.get("picture");
  const patch: { cvUrl?: string; pictureUrl?: string } = {};

  try {
    if (cv instanceof File && cv.size > 0) {
      if (!isAllowedCv(cv)) {
        return NextResponse.json(
          { error: "CV must be PDF, DOC, or DOCX." },
          { status: 400 },
        );
      }
      if (cv.size > MAX_CV_BYTES) {
        return NextResponse.json(
          { error: "CV must be 8MB or smaller." },
          { status: 400 },
        );
      }
      const cvUrl = await uploadPublicFile(cv, `orders/${order.id}/cv`);
      if (!cvUrl) {
        return NextResponse.json(
          { error: "Could not store CV file." },
          { status: 502 },
        );
      }
      patch.cvUrl = cvUrl;
    }

    if (picture instanceof File && picture.size > 0) {
      if (!isAllowedPicture(picture)) {
        return NextResponse.json(
          { error: "Picture must be JPG or PNG." },
          { status: 400 },
        );
      }
      if (picture.size > MAX_PICTURE_BYTES) {
        return NextResponse.json(
          { error: "Picture must be 5MB or smaller." },
          { status: 400 },
        );
      }
      const pictureUrl = await uploadPublicFile(
        picture,
        `orders/${order.id}/pictures`,
      );
      if (!pictureUrl) {
        return NextResponse.json(
          { error: "Could not store picture file." },
          { status: 502 },
        );
      }
      patch.pictureUrl = pictureUrl;
    }
  } catch (err) {
    console.error("[admin/orders files]", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 502 },
    );
  }

  if (!patch.cvUrl && !patch.pictureUrl) {
    return NextResponse.json(
      { error: "Choose a CV or picture file to upload." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateOrder(order.id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("[admin/orders files]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not update order files.",
      },
      { status: 502 },
    );
  }
}
