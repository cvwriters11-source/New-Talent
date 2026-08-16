"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminOrder, AdminWriter, OrderStatus } from "@/lib/admin/store";
import { formatAdminDateTime, formatRand } from "@/lib/admin/format";

const statuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

const selectClass =
  "min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm";

export function OrdersTable({
  orders,
  writers,
}: {
  orders: AdminOrder[];
  writers: AdminWriter[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patchOrder(
    id: string,
    body: { status?: OrderStatus; assignedWriter?: string | null },
  ) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(json?.error || "Could not update order.");
      }
      router.refresh();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not update order.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-paper p-6 text-sm text-muted">
        No checkout orders yet. New package checkouts will appear here.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl border border-line bg-paper p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
                  className="text-base font-bold tracking-wide text-teal underline underline-offset-2"
                >
                  {order.orderNumber || order.id}
                </Link>
                <p className="mt-1 font-semibold text-ink">
                  {order.firstName} {order.surname}
                </p>
                <p className="text-xs text-muted">{order.email}</p>
                <p className="text-xs text-muted">{order.whatsapp}</p>
              </div>
              <p className="shrink-0 text-base font-bold text-teal">
                {formatRand(order.amount)}
              </p>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-muted">Package:</span> {order.packageName}
              </p>
              {order.cvColor ? (
                <p className="text-xs text-muted">Colour: {order.cvColor}</p>
              ) : null}
              <p className="text-xs text-muted">
                {formatAdminDateTime(order.createdAt)}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-ink">Writer</span>
                <select
                  className={selectClass}
                  value={order.assignedWriter || ""}
                  disabled={busyId === order.id || writers.length === 0}
                  onChange={(e) =>
                    void patchOrder(order.id, {
                      assignedWriter: e.target.value || null,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {writers.map((writer) => (
                    <option key={writer.id} value={writer.name}>
                      {writer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-ink">Status</span>
                <select
                  className={selectClass}
                  value={order.status}
                  disabled={busyId === order.id}
                  onChange={(e) =>
                    void patchOrder(order.id, {
                      status: e.target.value as OrderStatus,
                    })
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Link
              href={`/admin/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
              className="btn-secondary mt-4 inline-flex w-full justify-center px-4 py-2.5 text-sm"
            >
              Open order details
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-line bg-paper shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper-deep text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Package / CV</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Writer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
                      className="font-bold tracking-wide text-teal underline underline-offset-2"
                    >
                      {order.orderNumber || order.id}
                    </Link>
                    <p className="mt-1">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
                        className="text-xs font-semibold text-ink underline"
                      >
                        Open details
                      </Link>
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
                      className="min-h-10 min-w-[9rem] border border-line bg-paper px-2 py-1.5 text-xs"
                      value={order.assignedWriter || ""}
                      disabled={busyId === order.id || writers.length === 0}
                      onChange={(e) =>
                        void patchOrder(order.id, {
                          assignedWriter: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {writers.map((writer) => (
                        <option key={writer.id} value={writer.name}>
                          {writer.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="min-h-10 border border-line bg-paper px-2 py-1.5 text-xs"
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(e) =>
                        void patchOrder(order.id, {
                          status: e.target.value as OrderStatus,
                        })
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
                    {formatAdminDateTime(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
