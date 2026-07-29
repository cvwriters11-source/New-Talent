import Link from "next/link";
import { RecruiterLogoutButton } from "@/components/recruiter/RecruiterLogoutButton";
import { getRecruiterSession } from "@/lib/recruiter/auth";

export default async function RecruiterPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getRecruiterSession();

  return (
    <div className="min-h-svh bg-[#f1f5f9]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link href="/recruiter/dashboard" className="text-sm font-bold text-teal">
              Talent Crafters
            </Link>
            <p className="text-xs text-muted">Recruiter portal</p>
          </div>
          {session ? (
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink">{session.name}</p>
                <p className="text-xs text-muted">{session.company}</p>
              </div>
              <RecruiterLogoutButton />
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
