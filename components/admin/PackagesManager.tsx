"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CareerPackage, CvColorOption } from "@/lib/packages";
import { slugifyPackageName } from "@/lib/packages";
import { formatRand } from "@/lib/admin/format";
import { formatLocalizedAmount } from "@/lib/geo-pricing";

type FormState = {
  name: string;
  subtitle: string;
  tagline: string;
  summary: string;
  priceLabel: string;
  includesText: string;
  idealFor: string;
  timeline: string;
  region: string;
  quoteAmount: string;
  sampleImage: string;
  colorsText: string;
  slug: string;
  active: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  subtitle: "",
  tagline: "",
  summary: "",
  priceLabel: "R1,500",
  includesText: "",
  idealFor: "",
  timeline: "",
  region: "",
  quoteAmount: "1500",
  sampleImage: "",
  colorsText: "",
  slug: "",
  active: true,
});

function priceLabelFromAmount(amount: number) {
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

const GEO_PREVIEW = [
  { code: "ZAR", symbol: "R", rateFromZar: 1, locale: "en-ZA", label: "ZAR" },
  { code: "USD", symbol: "$", rateFromZar: 0.055, locale: "en-US", label: "USD" },
  { code: "CAD", symbol: "C$", rateFromZar: 0.075, locale: "en-CA", label: "CAD" },
  { code: "GBP", symbol: "£", rateFromZar: 0.043, locale: "en-GB", label: "GBP" },
  { code: "EUR", symbol: "€", rateFromZar: 0.051, locale: "en-IE", label: "EUR" },
] as const;

function colorsToText(colors?: CvColorOption[]) {
  if (!colors?.length) return "";
  return colors.map((c) => `${c.id}|${c.label}|${c.hex}`).join("\n");
}

function textToColors(text: string): CvColorOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, label, hex] = line.split("|").map((p) => p.trim());
      return {
        id: id || slugifyPackageName(label || "color"),
        label: label || id || "Colour",
        hex: hex || "#0d9488",
      };
    })
    .filter((c) => c.id && c.label);
}

function toForm(pkg: CareerPackage): FormState {
  return {
    name: pkg.name,
    subtitle: pkg.subtitle || "",
    tagline: pkg.tagline,
    summary: pkg.summary,
    priceLabel: pkg.priceLabel,
    includesText: pkg.includes.join("\n"),
    idealFor: pkg.idealFor,
    timeline: pkg.timeline,
    region: pkg.region || "",
    quoteAmount: String(pkg.quoteAmount ?? 1500),
    sampleImage: pkg.sampleImage || "",
    colorsText: colorsToText(pkg.colorOptions),
    slug: pkg.slug,
    active: pkg.active !== false,
  };
}

const fieldClass =
  "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-teal";

export function PackagesManager({ packages }: { packages: CareerPackage[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => {
    if (mode === "create") return "Add package";
    if (mode === "edit") return "Edit package";
    return null;
  }, [mode]);

  function startCreate() {
    setMode("create");
    setEditingSlug(null);
    setForm(emptyForm());
    setError("");
  }

  function startEdit(pkg: CareerPackage) {
    setMode("edit");
    setEditingSlug(pkg.slug);
    setForm(toForm(pkg));
    setError("");
  }

  function cancel() {
    setMode("list");
    setEditingSlug(null);
    setForm(emptyForm());
    setError("");
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && mode === "create") {
        next.slug = slugifyPackageName(String(value));
      }
      if (key === "quoteAmount") {
        const amount = Number(value);
        if (Number.isFinite(amount) && amount >= 0) {
          next.priceLabel = priceLabelFromAmount(amount);
        }
      }
      return next;
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const includes = form.includesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const colorOptions = textToColors(form.colorsText);
    const payload = {
      previousSlug: editingSlug || undefined,
      slug: form.slug || slugifyPackageName(form.name),
      name: form.name,
      subtitle: form.subtitle || null,
      tagline: form.tagline,
      summary: form.summary,
      priceLabel: form.priceLabel,
      includes,
      idealFor: form.idealFor,
      timeline: form.timeline,
      region: form.region || null,
      quoteAmount: Number(form.quoteAmount),
      sampleImage: form.sampleImage || null,
      active: form.active,
      colorOptions,
    };

    try {
      const res = await fetch("/api/admin/packages", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      cancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(slug: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This removes it from the public site.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Delete failed");
      if (editingSlug === slug) cancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  if (mode !== "list") {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-muted">
              Changes appear on the public packages pages.
            </p>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="border border-line bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-xl border border-line bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Name</span>
              <input
                required
                className={fieldClass}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">URL slug</span>
              <input
                required
                className={fieldClass}
                value={form.slug}
                onChange={(e) =>
                  update("slug", slugifyPackageName(e.target.value) || e.target.value)
                }
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Subtitle</span>
              <input
                className={fieldClass}
                value={form.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Price label</span>
              <input
                required
                readOnly
                className={`${fieldClass} bg-[#f8fafc]`}
                value={form.priceLabel}
                title="Auto-updates from Quote amount"
              />
              <span className="mt-1 block text-xs text-muted">
                Auto-set from quote amount (shown on package pages).
              </span>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Tagline</span>
            <input
              required
              className={fieldClass}
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Summary</span>
            <textarea
              required
              rows={4}
              className={fieldClass}
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">
              Includes (one per line)
            </span>
            <textarea
              required
              rows={6}
              className={fieldClass}
              value={form.includesText}
              onChange={(e) => update("includesText", e.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">
                Quote amount (R) — live package price
              </span>
              <input
                required
                type="number"
                min={0}
                step={1}
                className={fieldClass}
                value={form.quoteAmount}
                onChange={(e) => update("quoteAmount", e.target.value)}
              />
              <span className="mt-1 block text-xs text-muted">
                Saves to this package on the public site. Geo visitors see a converted amount from this ZAR baseline.
              </span>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Timeline</span>
              <input
                required
                className={fieldClass}
                value={form.timeline}
                onChange={(e) => update("timeline", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Region</span>
              <input
                className={fieldClass}
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
              />
            </label>
          </div>

          <div className="rounded-lg border border-line bg-[#f8fafc] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Approximate visitor prices for this package
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GEO_PREVIEW.map((currency) => {
                const amount = Number(form.quoteAmount);
                if (!Number.isFinite(amount)) return null;
                const local = formatLocalizedAmount(amount, currency);
                return (
                  <span
                    key={currency.code}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-line"
                  >
                    {local.display}
                  </span>
                );
              })}
            </div>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Ideal for</span>
            <textarea
              required
              rows={2}
              className={fieldClass}
              value={form.idealFor}
              onChange={(e) => update("idealFor", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">
              Colour options (one per line: id|label|#hex)
            </span>
            <textarea
              rows={4}
              className={fieldClass}
              placeholder={"teal|Teal|#0d9488\nnavy|Navy|#0a2540"}
              value={form.colorsText}
              onChange={(e) => update("colorsText", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">
              Sample image path (optional)
            </span>
            <input
              className={fieldClass}
              placeholder="/packages/graduate-template.jpg"
              value={form.sampleImage}
              onChange={(e) => update("sampleImage", e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            Show on public site
          </label>

          {error ? (
            <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {busy ? "Saving…" : mode === "create" ? "Create package" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="border border-line bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="mt-1 text-sm text-muted">
            Edit Career Development packages shown on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          Add package
        </button>
      </div>

      {error ? (
        <p className="mt-4 border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {packages.map((pkg) => (
          <article
            key={pkg.slug}
            className="rounded-xl border border-line bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{pkg.name}</h2>
                {pkg.subtitle ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal">
                    {pkg.subtitle}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  pkg.active === false
                    ? "bg-slate-100 text-muted"
                    : "bg-teal/10 text-teal"
                }`}
              >
                {pkg.active === false ? "Hidden" : "Live"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{pkg.tagline}</p>
            <p className="mt-3 text-sm font-semibold">
              Quote baseline: {formatRand(pkg.quoteAmount)} · {pkg.timeline}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink">
              {pkg.includes.slice(0, 5).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => startEdit(pkg)}
                className="border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-teal"
              >
                Edit
              </button>
              <Link
                href={`/packages/${pkg.slug}`}
                className="border border-line bg-white px-3 py-2 text-sm font-semibold text-teal"
              >
                View public page
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete(pkg.slug, pkg.name)}
                className="border border-danger/30 bg-white px-3 py-2 text-sm font-semibold text-danger"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
