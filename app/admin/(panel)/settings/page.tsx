import type { Metadata } from "next";
import { getAdminCredentials } from "@/lib/admin/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  const creds = getAdminCredentials();
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="font-bold">Admin account</h2>
          <p className="mt-2 text-sm text-muted">Login email</p>
          <p className="font-semibold">{creds.email}</p>
          <p className="mt-4 text-xs text-muted">
            Password is set via <code>ADMIN_PASSWORD</code> in environment
            variables.
          </p>
        </article>
        <article className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="font-bold">Site contact</h2>
          <p className="mt-2 text-sm text-muted">Public contact email</p>
          <p className="font-semibold">{site.email}</p>
          <p className="mt-3 text-sm text-muted">Location</p>
          <p className="font-semibold">{site.location}</p>
        </article>
      </div>
    </div>
  );
}
