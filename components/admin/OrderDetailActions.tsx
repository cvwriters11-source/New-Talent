"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminWriter, OrderStatus } from "@/lib/admin/store";

const statuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export function OrderDetailActions({
  orderId,
  status,
  assignedWriter,
  writers,
}: {
  orderId: string;
  status: OrderStatus;
  assignedWriter?: string | null;
  writers: AdminWriter[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: {
    status?: OrderStatus;
    assignedWriter?: string | null;
  }) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, ...body }),
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
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <label className="flex w-full min-w-0 flex-1 flex-col gap-1.5 text-sm sm:min-w-[12rem]">
        <span className="font-semibold text-ink">Assigned writer</span>
        <select
          className="min-h-11 border border-line bg-paper px-3 py-2 text-sm"
          value={assignedWriter || ""}
          disabled={busy || writers.length === 0}
          onChange={(e) =>
            void patch({ assignedWriter: e.target.value || null })
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
      <label className="flex w-full min-w-0 flex-1 flex-col gap-1.5 text-sm sm:min-w-[10rem]">
        <span className="font-semibold text-ink">Status</span>
        <select
          className="min-h-11 border border-line bg-paper px-3 py-2 text-sm"
          value={status}
          disabled={busy}
          onChange={(e) =>
            void patch({ status: e.target.value as OrderStatus })
          }
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
