import type { Metadata } from "next";
import { AdminRecruiterActions } from "@/components/admin/AdminRecruiterActions";
import { listRecruiters, type VerificationStatus } from "@/lib/recruiter/store";

export const metadata: Metadata = { title: "Recruiters" };

export const dynamic = "force-dynamic";

const VERIFY_STYLES: Record<VerificationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default async function Page() {
  const recruiters = await listRecruiters();
  return (
    <div>
      <h1 className="text-2xl font-bold">Recruiters</h1>
      <p className="mt-1 text-sm text-muted">
        Verify registrations before they can submit job posts. Company logos appear on published listings.
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
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.logoUrl}
                          alt=""
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center bg-slate-100 text-xs text-muted">
                          —
                        </span>
                      )}
                      <div>
                        <p className="font-semibold">{r.company}</p>
                        <p className="text-xs text-muted">{r.whatsapp || "No WhatsApp"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${VERIFY_STYLES[r.verificationStatus]}`}
                    >
                      {r.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminRecruiterActions
                      recruiterId={r.id}
                      currentStatus={r.verificationStatus}
                    />
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
