"use client";

import { useRouter } from "next/navigation";

export function InterviewLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/interview/logout", { method: "POST" });
    router.push("/interview");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="text-sm font-semibold text-muted underline hover:text-ink"
    >
      Log out
    </button>
  );
}
