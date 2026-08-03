"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminOrder, OrderStatus } from "@/lib/admin/store";
import { formatRand } from "@/lib/admin/format";

const statuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-white p-6 text-sm text-muted">
        No checkout orders yet. New package checkouts will appear here.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <p className="font-bold tracking-wide text-teal">
                    {order.orderNumber || order.id}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">
                    {order.firstName} {order.surname}
                  </p>
                  <p className="text-xs text-muted">{order.email}</p>
                  <p className="text-xs text-muted">{order.whatsapp}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{order.packageName}</p>
                  {order.cvColor ? (
                    <p className="text-xs text-muted">Colour: {order.cvColor}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-semibold text-teal">
                  {formatRand(order.amount)}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="min-h-10 border border-line bg-white px-2 py-1.5 text-xs"
                    value={order.status}
                    disabled={busyId === order.id}
                    onChange={(e) =>
                      void updateStatus(order.id, e.target.value as OrderStatus)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
