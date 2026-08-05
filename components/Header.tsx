"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { navLinks } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  if (navPath !== pathname) {
    setNavPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-5 md:gap-6 md:px-8 md:py-2.5">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center transition hover:opacity-90"
          onClick={() => setOpen(false)}
        >
          <BrandLogo size="header" priority />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold lg:flex lg:gap-8"
        >
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-navy"
                    : "text-navy/70 transition hover:text-navy"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/packages"
            className="btn-primary shrink-0 px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Packages
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-line text-navy lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm px-2 py-3 text-base font-semibold ${
                    active ? "bg-slate-100 text-teal" : "text-navy/80"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
