import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
      <div className="flex min-h-svh items-center justify-center bg-navy px-5 py-12">
      <div className="w-full max-w-md border border-line bg-paper p-7 shadow-xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
          Talent Crafters
        </p>
        <h1 className="mt-2 text-2xl text-ink">Admin login</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to manage orders, customers, and operations.
        </p>
        <div className="mt-7">
          <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
