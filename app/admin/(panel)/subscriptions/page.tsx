import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper-deep text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renews</th>
            </tr>
          </thead>
          <tbody>
            {store.subscriptions.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{s.customer}</td>
                <td className="px-4 py-3">{s.plan}</td>
                <td className="px-4 py-3 capitalize">{s.status}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(s.renewsAt).toLocaleDateString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
