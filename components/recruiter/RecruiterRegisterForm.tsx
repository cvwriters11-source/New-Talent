"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RecruiterRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/recruiter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          company: data.get("company"),
          email: data.get("email"),
          password: data.get("password"),
          whatsapp: data.get("whatsapp") || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Registration failed");
      router.push("/recruiter/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-ink">
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          minLength={2}
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-semibold text-ink">
          WhatsApp <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      {error ? (
        <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full px-6 py-3.5 text-sm disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/recruiter/login" className="font-semibold text-teal underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
