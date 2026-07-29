"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecruiterLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/recruiter/logout", { method: "POST" });
    router.push("/recruiter/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="text-sm font-semibold text-muted hover:text-ink disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
