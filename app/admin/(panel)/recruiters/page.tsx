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
        Verify company registrations (name, registration number, website, logo)
        before they can submit job posts.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
        {recruiters.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No recruiters registered yet.
          </p>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {recruiters.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-line bg-paper-deep p-4"
                >
                  <div className="flex items-start gap-3">
                    {r.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.logoUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 border border-line object-contain bg-white p-1"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-slate-100 text-xs text-muted">
                        —
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{r.company}</p>
                      <p className="text-sm">{r.name}</p>
                      <p className="text-xs text-muted">{r.email}</p>
                      {r.registrationNumber ? (
                        <p className="text-xs text-muted">
                          Reg: {r.registrationNumber}
                        </p>
                      ) : null}
                      {r.website ? (
                        <a
                          href={r.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-teal underline"
                        >
                          {r.website.replace(/^https?:\/\//i, "")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${VERIFY_STYLES[r.verificationStatus]}`}
                    >
                      {r.verificationStatus}
                    </span>
                    <AdminRecruiterActions
                      recruiterId={r.id}
                      currentStatus={r.verificationStatus}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-paper-deep text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Registration</th>
                    <th className="px-4 py-3">Website</th>
                    <th className="px-4 py-3">Contact</th>
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
                              className="h-10 w-10 border border-line object-contain bg-white p-0.5"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center bg-slate-100 text-xs text-muted">
                              —
                            </span>
                          )}
                          <div>
                            <p className="font-semibold">{r.company}</p>
                            <p className="text-xs text-muted">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.registrationNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.website ? (
                          <a
                            href={r.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-teal underline"
                          >
                            {r.website.replace(/^https?:\/\//i, "")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted">
                          {r.whatsapp || "No WhatsApp"}
                        </p>
                      </td>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
