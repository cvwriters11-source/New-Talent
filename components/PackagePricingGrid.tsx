import Link from "next/link";
import {
  formatLocalizedAmount,
  type GeoPricing,
} from "@/lib/geo-pricing";
import type { CareerPackage } from "@/lib/packages";

const FEATURED_SLUG = "professional-package";

const PLAN_THEMES: Record<
  string,
  { accent: string; header: string; short: string }
> = {
  "graduate-package": {
    accent: "#00d4ff",
    header: "#0052cc",
    short: "Fresh Graduate — Package",
  },
  "professional-package": {
    accent: "#00a3ff",
    header: "#0066cc",
    short: "Professional Package",
  },
  "executive-package": {
    accent: "#3399ff",
    header: "#003d99",
    short: "Executive Package",
  },
  "international-resume": {
    accent: "#5b8def",
    header: "#1a3a6e",
    short: "International Resume",
  },
};

function themeFor(slug: string) {
  return (
    PLAN_THEMES[slug] ?? {
      accent: "#00a3ff",
      header: "#0a192f",
      short: "PLAN",
    }
  );
}

function shortLabel(pkg: CareerPackage) {
  return (
    PLAN_THEMES[pkg.slug]?.short ??
    pkg.name
      .replace(/ package| resume| résumé/gi, "")
      .trim()
      .toUpperCase()
      .slice(0, 12)
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function PackagePricingGrid({
  packages,
  pricing,
  eyebrow = "Career Development packages",
  title = "Clear packages. Clear turnaround. Clear next steps.",
  description = "Pick the package that matches your stage — then proceed to checkout with your CV and details.",
}: {
  packages: CareerPackage[];
  pricing: GeoPricing;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">{eyebrow}</p>
        <h2 className="mt-3 text-2xl text-ink sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
          {description}
        </p>
        <p className="mt-3 text-xs text-muted">
          Prices shown in{" "}
          <span className="font-semibold text-ink">{pricing.currency.code}</span>
          {pricing.isConverted
            ? ` for visitors in ${pricing.country} (approx. from ZAR quote baseline). Final quote confirmed before payment.`
            : " (quote baseline). Final quote confirmed before payment."}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:items-end xl:gap-5">
        {packages.map((pkg) => {
          const theme = themeFor(pkg.slug);
          const featured = pkg.slug === FEATURED_SLUG;
          const local = formatLocalizedAmount(
            pkg.quoteAmount,
            pricing.currency,
          );

          return (
            <article
              key={pkg.slug}
              className={`relative flex flex-col rounded-2xl border border-line bg-paper shadow-[0_10px_40px_rgba(0,163,255,0.12)] transition duration-300 ${
                featured
                  ? "ring-2 ring-teal/60 sm:scale-[1.02] xl:-translate-y-3 xl:scale-105"
                  : "ring-1 ring-white/5"
              }`}
              style={
                featured
                  ? { boxShadow: `0 16px 48px ${theme.accent}33` }
                  : undefined
              }
            >
              {/* Header + price badge (badge sits outside overflow clip) */}
              <div className="relative">
                <div className="overflow-hidden rounded-t-2xl">
                  <div
                    className="relative h-[7.75rem] shrink-0 sm:h-[8.5rem]"
                    style={{
                      backgroundColor: theme.header,
                      clipPath: featured
                        ? "polygon(0 0, 100% 0, 100% 72%, 0 100%)"
                        : "polygon(0 0, 100% 0, 100% 100%, 0 72%)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 px-5 pt-5 pr-24 sm:px-6 sm:pt-6 sm:pr-28">
                      <div>
                        {featured ? (
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/85">
                            Most chosen
                          </p>
                        ) : null}
                        <p className="max-w-[11rem] text-[15px] font-bold leading-tight tracking-tight text-white sm:max-w-[12rem] sm:text-base">
                          {shortLabel(pkg)}
                        </p>
                        <p className="mt-1 max-w-[9rem] text-[11px] leading-snug text-white/80 sm:max-w-[10rem]">
                          {pkg.timeline}
                          {pkg.region ? ` · ${pkg.region}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fully visible — not clipped by header overflow */}
                <div
                  className="pointer-events-none absolute right-3 z-30 flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full bg-paper-deep sm:right-4 sm:h-[6.25rem] sm:w-[6.25rem]"
                  style={{
                    top: featured ? "3.4rem" : "4.55rem",
                    boxShadow: `0 10px 28px ${theme.accent}40`,
                    outline: `3px solid ${theme.accent}`,
                  }}
                  aria-label={`Price ${local.code} ${local.formatted}`}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide sm:text-xs"
                    style={{ color: theme.accent }}
                  >
                    {local.code}
                  </span>
                  <span
                    className="text-lg font-bold leading-none tracking-tight sm:text-xl"
                    style={{ color: theme.accent }}
                  >
                    {local.formatted}
                  </span>
                  <span
                    className="mt-1 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]"
                    style={{ color: theme.accent }}
                  >
                    Quote
                  </span>
                </div>
              </div>

              <div
                className={`flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6 ${
                  featured ? "pt-10 sm:pt-11" : "pt-12 sm:pt-14"
                }`}
              >
                <p
                  className="mb-4 inline-flex w-fit items-center justify-center rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white sm:text-[11px]"
                  style={{ backgroundColor: theme.accent }}
                >
                  What you will get
                </p>
                <ul className="space-y-2.5 text-[13px] leading-snug text-ink sm:text-sm">
                  {pkg.includes
                    .filter(
                      (item) =>
                        !/^turn\s*around\s*time/i.test(item.trim()),
                    )
                    .map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckIcon color={theme.accent} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-2 pt-6">
                  <Link
                    href={`/packages/${pkg.slug}/checkout`}
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${theme.header}, ${theme.accent})`,
                    }}
                  >
                    Order now
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
