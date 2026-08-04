import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { updateOrderStatus, type OrderStatus } from "@/lib/admin/store";

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

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id || !body.status || !statuses.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(body.id, body.status as OrderStatus);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error("[admin/orders]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not update order status.",
      },
      { status: 502 },
    );
  }
}
