import type { Metadata } from "next";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl">Customers</h1>
      <p className="mt-1 text-sm text-muted">People who submitted checkouts.</p>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
        {store.customers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">No customers yet.</p>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {store.customers.map((c) => (
                <article
                  key={c.id}
                  className="rounded-lg border border-line bg-paper-deep p-4"
                >
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="mt-1 text-sm">{c.email}</p>
                  <p className="text-xs text-muted">{c.whatsapp}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Country</dt>
                      <dd>{c.country}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Orders</dt>
                      <dd className="font-semibold">{c.orders}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-paper-deep text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {store.customers.map((c) => (
                    <tr key={c.id} className="border-t border-line">
                      <td className="px-4 py-3 font-semibold">{c.name}</td>
                      <td className="px-4 py-3">
                        <p>{c.email}</p>
                        <p className="text-xs text-muted">{c.whatsapp}</p>
                      </td>
                      <td className="px-4 py-3">{c.country}</td>
                      <td className="px-4 py-3">{c.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
