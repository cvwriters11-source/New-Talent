"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminWriter } from "@/lib/admin/store";
import { formatRand } from "@/lib/admin/format";

const fieldClass =
  "w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-teal";

export function WritersManager({ writers }: { writers: AdminWriter[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/writers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not add writer.");
      setName("");
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add writer.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string, writerName: string) {
    if (
      !window.confirm(
        `Remove writer “${writerName}”? Their assigned orders will become unassigned.`,
      )
    ) {
      return;
    }
    setRemovingId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/writers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not remove writer.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove writer.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onAdd}
        className="rounded-xl border border-line bg-paper p-5 shadow-sm"
      >
        <h2 className="text-base font-bold text-ink">Add writer</h2>
        <p className="mt-1 text-sm text-muted">
          Writers appear in the Orders page so you can assign CV work to them.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="w-name">
              Name
            </label>
            <input
              id="w-name"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="w-email">
              Email
            </label>
            <input
              id="w-email"
              type="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-4 px-5 py-2.5 text-sm"
        >
          {busy ? "Saving…" : "Add writer"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
        <div className="space-y-3 p-4 md:hidden">
          {writers.length === 0 ? (
            <p className="text-sm text-muted">No writers yet. Add your first CV writer above.</p>
          ) : (
            writers.map((writer) => (
              <article
                key={writer.id}
                className="rounded-lg border border-line bg-paper-deep p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{writer.name}</p>
                    <p className="text-xs text-muted">{writer.email}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-danger underline"
                    disabled={removingId === writer.id}
                    onClick={() => void onRemove(writer.id, writer.name)}
                  >
                    {removingId === writer.id ? "Removing…" : "Remove"}
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Active</dt>
                    <dd className="font-semibold">{writer.activeOrders}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Done</dt>
                    <dd className="font-semibold">{writer.completed}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Revenue</dt>
                    <dd className="font-semibold text-teal">
                      {formatRand(writer.totalRevenue)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-paper-deep text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Writer</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {writers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-muted">
                    No writers yet. Add your first CV writer above.
                  </td>
                </tr>
              ) : (
                writers.map((writer) => (
                  <tr key={writer.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{writer.name}</p>
                      <p className="text-xs text-muted">{writer.email}</p>
                    </td>
                    <td className="px-4 py-3">{writer.activeOrders}</td>
                    <td className="px-4 py-3">{writer.completed}</td>
                    <td className="px-4 py-3 font-semibold text-teal">
                      {formatRand(writer.totalRevenue)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-xs font-semibold text-danger underline"
                        disabled={removingId === writer.id}
                        onClick={() => void onRemove(writer.id, writer.name)}
                      >
                        {removingId === writer.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
