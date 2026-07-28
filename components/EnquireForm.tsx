"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getPackage, packages } from "@/lib/packages";
import { packageWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

const packageOptions = [
  ...packages.map((pkg) => ({ value: pkg.slug, label: pkg.name })),
  { value: "not-sure", label: "Not sure yet" },
];

const fieldClass =
  "w-full border border-line bg-white px-3.5 py-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-teal";

export function EnquireForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPackage = searchParams.get("package") || "not-sure";
  const initialColor = searchParams.get("color") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(
    packageOptions.some((o) => o.value === initialPackage)
      ? initialPackage
      : "not-sure",
  );
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const selectedPkg = useMemo(
    () => getPackage(selectedPackage),
    [selectedPackage],
  );

  const selectedLabel = useMemo(
    () =>
      packageOptions.find((o) => o.value === selectedPackage)?.label ||
      "Career Development",
    [selectedPackage],
  );

  const colorLabel =
    selectedPkg?.colorOptions?.find((c) => c.id === selectedColor)?.label ||
    selectedColor;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          packageSlug: data.get("package"),
          cvColor: selectedPkg?.colorOptions ? selectedColor || null : null,
          preferredContact: data.get("preferredContact"),
          message: data.get("message"),
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Please try again.");
      }

      router.push("/enquire/thanks");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send enquiry.");
    }
  }

  const whatsappText = selectedPkg?.colorOptions?.length
    ? `Hi Talent Crafters — I'd like to enquire about the ${selectedLabel}${
        colorLabel ? ` (CV colour: ${colorLabel})` : ""
      }.`
    : packageWhatsappMessage(selectedLabel);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@email.com"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            required
            autoComplete="tel"
            className={fieldClass}
            placeholder="+27…"
          />
        </Field>
        <Field label="Package interest" htmlFor="package">
          <select
            id="package"
            name="package"
            className={fieldClass}
            value={selectedPackage}
            onChange={(e) => {
              setSelectedPackage(e.target.value);
              setSelectedColor("");
            }}
          >
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {selectedPkg?.colorOptions && selectedPkg.colorOptions.length > 0 ? (
        <fieldset>
          <legend className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            CV colour
          </legend>
          <div className="flex flex-wrap gap-3">
            {selectedPkg.colorOptions.map((color) => {
              const active = selectedColor === color.id;
              return (
                <label
                  key={color.id}
                  className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition ${
                    active
                      ? "border-teal bg-teal-muted"
                      : "border-line bg-white hover:border-ink/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="cvColor"
                    value={color.id}
                    checked={active}
                    onChange={() => setSelectedColor(color.id)}
                    required
                    className="sr-only"
                  />
                  <span
                    className="h-8 w-8 border border-line"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-ink">
                    {color.label}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Required for the Graduate Package — Teal, Dark green, or Blue.
          </p>
        </fieldset>
      ) : null}

      <Field label="Preferred contact" htmlFor="preferredContact">
        <select
          id="preferredContact"
          name="preferredContact"
          className={fieldClass}
          defaultValue="whatsapp"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="either">Either</option>
        </select>
      </Field>

      <Field label="Goals / message" htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${fieldClass} resize-y`}
          placeholder="Tell us about your role targets, timeline, or questions."
        />
      </Field>

      {status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send enquiry"}
        </button>
        <a
          href={whatsappLink(whatsappText)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-5 py-3 text-sm"
        >
          Or WhatsApp us
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
