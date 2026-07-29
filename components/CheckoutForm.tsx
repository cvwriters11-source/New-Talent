"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { CareerPackage } from "@/lib/packages";

const fieldClass =
  "w-full min-h-12 border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-colors focus:border-teal sm:text-[0.95rem]";

const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

export function CheckoutForm({ pkg }: { pkg: CareerPackage }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialColor = searchParams.get("color") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    pkg.colorOptions?.some((c) => c.id === initialColor)
      ? initialColor
      : pkg.colorOptions?.[0]?.id || "",
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [cvName, setCvName] = useState("");
  const [pictureName, setPictureName] = useState("");

  const colorLabel = useMemo(
    () =>
      pkg.colorOptions?.find((c) => c.id === selectedColor)?.label ||
      selectedColor,
    [pkg.colorOptions, selectedColor],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("packageSlug", pkg.slug);
    if (pkg.colorOptions?.length) {
      data.set("cvColor", selectedColor);
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      router.push(`/checkout/thanks?package=${encodeURIComponent(pkg.slug)}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to submit order.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="h-fit border border-line bg-paper lg:sticky lg:top-24">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left lg:cursor-default"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              Package summary
            </p>
            <p className="mt-1 text-lg font-bold text-ink">{pkg.name}</p>
            <p className="mt-1 text-sm font-semibold text-teal">
              {pkg.priceLabel} · {pkg.timeline}
              {pkg.region ? ` · ${pkg.region}` : ""}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted">
              Quote baseline updates with admin package pricing.
            </p>
          </div>
          <span className="text-sm font-semibold text-muted lg:hidden">
            {summaryOpen ? "Hide" : "Show"}
          </span>
        </button>
        <div
          className={`border-t border-line px-5 pb-5 ${
            summaryOpen ? "block" : "hidden lg:block"
          }`}
        >
          <ul className="mt-4 space-y-2.5">
            {pkg.includes.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-relaxed text-ink"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {colorLabel ? (
            <p className="mt-4 text-xs text-muted">
              Preferred colour:{" "}
              <span className="font-semibold text-ink">{colorLabel}</span>
            </p>
          ) : null}
        </div>
      </aside>

      <form onSubmit={onSubmit} className="space-y-5 border border-line bg-paper p-5 sm:p-7">
        <div>
          <h2 className="text-2xl text-ink">Your details</h2>
          <p className="mt-2 text-sm text-muted">
            Submit your information and documents. We’ll confirm your quote and
            payment steps by WhatsApp or email.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              required
              autoComplete="given-name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="surname" className={labelClass}>
              Surname
            </label>
            <input
              id="surname"
              name="surname"
              required
              autoComplete="family-name"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              WhatsApp number
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+27 …"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className={labelClass}>
              Location (city)
            </label>
            <input
              id="location"
              name="location"
              required
              autoComplete="address-level2"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="country" className={labelClass}>
              Country
            </label>
            <input
              id="country"
              name="country"
              required
              autoComplete="country-name"
              className={fieldClass}
            />
          </div>
        </div>

        {pkg.colorOptions?.length ? (
          <div>
            <p className={labelClass}>Preferred CV colour</p>
            <div className="flex flex-wrap gap-2">
              {pkg.colorOptions.map((option) => {
                const active = option.id === selectedColor;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedColor(option.id)}
                    className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-teal bg-teal-muted text-ink"
                        : "border-line bg-white text-muted"
                    }`}
                    aria-pressed={active}
                  >
                    <span
                      className="h-3.5 w-3.5 border border-black/10"
                      style={{ backgroundColor: option.hex }}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="cv" className={labelClass}>
            Upload your CV <span className="text-danger">*</span>
          </label>
          <p className="mb-2 text-xs text-muted">PDF, DOC, or DOCX · max 8MB</p>
          <input
            id="cv"
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:border-0 file:bg-ink file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setCvName(e.target.files?.[0]?.name || "")}
          />
          {cvName ? (
            <p className="mt-2 text-xs font-semibold text-ink">{cvName}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="picture" className={labelClass}>
            Upload your picture{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <p className="mb-2 text-xs text-muted">JPG or PNG · max 5MB</p>
          <input
            id="picture"
            name="picture"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:border-0 file:bg-ink file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setPictureName(e.target.files?.[0]?.name || "")}
          />
          {pictureName ? (
            <p className="mt-2 text-xs font-semibold text-ink">{pictureName}</p>
          ) : null}
        </div>

        <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            value="yes"
            className="mt-1 h-4 w-4 accent-[var(--teal)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-teal underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-teal underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {status === "error" ? (
          <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full px-6 py-3.5 text-sm disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit order"}
        </button>
        <p className="text-center text-xs text-muted">
          No online card payment on this step — we’ll send payment instructions
          after reviewing your order.
        </p>
      </form>
    </div>
  );
}
