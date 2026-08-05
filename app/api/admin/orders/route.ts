import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { updateOrder, type OrderStatus } from "@/lib/admin/store";

const statuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    status?: string;
    assignedWriter?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 });
  }

  const hasStatus = typeof body.status === "string";
  const hasWriter = Object.prototype.hasOwnProperty.call(body, "assignedWriter");
  if (!hasStatus && !hasWriter) {
    return NextResponse.json(
      { error: "Provide a status and/or assignedWriter." },
      { status: 400 },
    );
  }
  if (hasStatus && !statuses.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  try {
    const order = await updateOrder(body.id, {
      status: hasStatus ? (body.status as OrderStatus) : undefined,
      ...(hasWriter
        ? { assignedWriter: body.assignedWriter?.trim() || null }
        : {}),
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error("[admin/orders]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not update order.",
      },
      { status: 502 },
    );
  }
}
