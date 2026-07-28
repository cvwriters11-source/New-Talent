import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-muted">People who submitted checkouts.</p>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Orders</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  No customers yet.
                </td>
              </tr>
            ) : (
              store.customers.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">
                    <p>{c.email}</p>
                    <p className="text-xs text-muted">{c.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3">{c.country}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
