import type { Metadata } from "next";
import { formatRand } from "@/lib/admin/format";
import {
  getAccurateNotificationCount,
  getDashboardStats,
  getStore,
  getWriterPerformance,
} from "@/lib/admin/store";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-amber-600">{hint}</p> : null}
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-white ${tone}`}
        >
          ●
        </span>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const store = await getStore();
  const stats = getDashboardStats(store);
  const writers = getWriterPerformance(store);
  const notifications = getAccurateNotificationCount(store);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Live totals from real checkout orders — not sample figures.
          </p>
        </div>
        <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white">
          <span aria-hidden>🔔</span>
          {notifications > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-teal px-1.5 text-[10px] font-bold text-white">
              {notifications > 9 ? "9+" : notifications}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Revenue cards count <strong>completed</strong> orders only. Pending
        orders appear under Pending and Open pipeline.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={formatRand(stats.today)} tone="bg-teal" />
        <StatCard
          label="This Week"
          value={formatRand(stats.week)}
          tone="bg-emerald-500"
        />
        <StatCard
          label="This Month"
          value={formatRand(stats.month)}
          tone="bg-sky-500"
        />
        <StatCard
          label="All Time"
          value={formatRand(stats.allTime)}
          tone="bg-violet-500"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          tone="bg-sky-600"
        />
        <StatCard
          label="Pending Orders"
          value={String(stats.pendingOrders)}
          hint={
            stats.pendingOrders > 0 ? "Requires attention" : "All clear"
          }
          tone="bg-amber-500"
        />
        <StatCard
          label="Completed Orders"
          value={String(stats.completedOrders)}
          tone="bg-emerald-600"
        />
        <StatCard
          label="Total Customers"
          value={String(stats.totalCustomers)}
          tone="bg-violet-600"
        />
      </div>

      <div className="mt-4">
        <StatCard
          label="Open pipeline (quoted)"
          value={formatRand(stats.pipelineQuoted)}
          hint="Pending + in-progress package quotes"
          tone="bg-ink"
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold text-ink">Writer Performance</h2>
          <p className="mt-1 text-xs text-muted">
            Calculated from assigned orders in this system.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Writer</th>
                <th className="px-5 py-3 font-semibold">Active Orders</th>
                <th className="px-5 py-3 font-semibold">Completed</th>
                <th className="px-5 py-3 font-semibold">Avg. Turnaround</th>
                <th className="px-5 py-3 font-semibold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {writers.map((writer) => (
                <tr key={writer.id} className="border-t border-line">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{writer.name}</p>
                    <p className="text-xs text-muted">{writer.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-700">
                      {writer.activeOrders}
                    </span>
                  </td>
                  <td className="px-5 py-4">{writer.completed}</td>
                  <td className="px-5 py-4">
                    {writer.avgTurnaroundDays > 0
                      ? `${writer.avgTurnaroundDays} days`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-teal">
                    {formatRand(writer.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
