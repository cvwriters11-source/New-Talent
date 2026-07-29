import type { Metadata } from "next";
import { listRecruiters } from "@/lib/recruiter/store";

export const metadata: Metadata = { title: "Recruiters" };

export const dynamic = "force-dynamic";

export default async function Page() {
  const recruiters = await listRecruiters();
  return (
    <div>
      <h1 className="text-2xl font-bold">Recruiters</h1>
      <p className="mt-1 text-sm text-muted">
        Accounts that can submit job posts for approval.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {recruiters.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No recruiters registered yet.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3">{r.company}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.whatsapp || "—"}</td>
                  <td className="px-4 py-3">
                    {r.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
