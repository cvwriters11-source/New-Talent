"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminNav } from "@/lib/admin/nav";

const mobileNav = adminNav.filter((item) =>
  [
    "/admin",
    "/admin/orders",
    "/admin/writers",
    "/admin/packages",
    "/admin/recruiters",
    "/admin/job-posts",
    "/admin/cv-generator",
    "/admin/popup",
    "/admin/settings",
  ].includes(item.href),
);

export function AdminMobileNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-[#0f172a] text-white md:hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">Talent Crafters Admin</p>
          <p className="truncate text-[11px] text-white/60">{email}</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open ? (
        <div
          id="admin-mobile-menu"
          className="border-t border-white/10 bg-[#0f172a] px-3 py-3"
        >
          <nav className="grid gap-1">
            {mobileNav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-3 text-sm font-semibold ${
                    active
                      ? "bg-teal text-navy"
                      : "bg-white/5 text-white/90 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 w-full rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}
