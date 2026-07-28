import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Promotions" };

export default async function Page() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Promotions</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
            </tr>
          </thead>
          <tbody>
            {store.promotions.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{p.code}</td>
                <td className="px-4 py-3">{p.discountPercent}%</td>
                <td className="px-4 py-3">
                  {p.active ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(p.expiresAt).toLocaleDateString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
