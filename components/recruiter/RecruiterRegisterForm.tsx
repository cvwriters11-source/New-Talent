"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RecruiterRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoName, setLogoName] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!(data.get("logo") instanceof File) || !(data.get("logo") as File).size) {
      setError("Company logo is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/recruiter/register", {
        method: "POST",
        body: data,
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
    <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
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
          Company name
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          minLength={2}
          autoComplete="organization"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label
          htmlFor="registrationNumber"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          Registration number
        </label>
        <input
          id="registrationNumber"
          name="registrationNumber"
          type="text"
          required
          minLength={2}
          placeholder="e.g. 2020/123456/07"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="website" className="mb-1.5 block text-sm font-semibold text-ink">
          Website address
        </label>
        <input
          id="website"
          name="website"
          type="text"
          required
          placeholder="www.example.com"
          autoComplete="url"
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="logo" className="mb-1.5 block text-sm font-semibold text-ink">
          Company logo
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          required
          onChange={(e) => setLogoName(e.target.files?.[0]?.name || "")}
          className="w-full border border-line bg-white px-3.5 py-3 text-sm file:mr-3 file:border-0 file:bg-teal file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy"
        />
        <p className="mt-1 text-xs text-muted">
          Required. JPG, PNG, or WebP under 2MB. Shown on your job posts.
          {logoName ? ` Selected: ${logoName}` : ""}
        </p>
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
      <p className="border border-line bg-[#f8fafc] px-3 py-2 text-xs text-muted">
        After you register, Talent Crafters must verify your account before you can post jobs.
      </p>
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
