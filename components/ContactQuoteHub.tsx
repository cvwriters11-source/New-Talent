import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

type ContactAction = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  tone: "red" | "navy";
  side: "left" | "right" | "bottom";
  desktop: string;
  icon: ReactNode;
};

function IconCircle({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "red" | "navy";
}) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-2 sm:h-12 sm:w-12 ${
        tone === "red" ? "ring-[var(--teal)] text-[var(--ink)]" : "ring-[var(--ink)] text-[var(--ink)]"
      }`}
      aria-hidden
    >
      {children}
    </span>
  );
}

const phoneHref = `tel:+${site.whatsappNumber}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location)}`;

const actions: ContactAction[] = [
  {
    id: "packages",
    label: "Packages",
    href: "/packages",
    tone: "red",
    side: "left",
    desktop: "left-[2%] top-[8%] sm:left-[4%] sm:top-[10%] md:left-[6%] md:top-[12%]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" strokeLinejoin="round" />
        <path d="M12 12v8M12 12 4 8.5M12 12l8-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "telephone",
    label: "Telephone",
    href: phoneHref,
    external: true,
    tone: "navy",
    side: "right",
    desktop: "right-[2%] top-[8%] sm:right-[4%] sm:top-[10%] md:right-[6%] md:top-[12%]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.2 1.1L6.6 10.8Z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: whatsappLink(
      "Hi Talent Crafters — I'd like to request a quote for Career Development packages.",
    ),
    external: true,
    tone: "navy",
    side: "left",
    desktop: "left-[0%] top-[42%] sm:left-[2%] md:left-[2%]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Quote request — Talent Crafters")}`,
    external: true,
    tone: "red",
    side: "right",
    desktop: "right-[0%] top-[42%] sm:right-[2%] md:right-[2%]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "visit",
    label: "Visit us",
    href: mapsHref,
    external: true,
    tone: "red",
    side: "bottom",
    desktop: "bottom-[2%] left-1/2 -translate-x-1/2",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
    ),
  },
];

function ActionPill({ action }: { action: ContactAction }) {
  const isLeft = action.side === "left";
  const isBottom = action.side === "bottom";
  const pillBg = action.tone === "red" ? "bg-[var(--teal)]" : "bg-[var(--ink)]";

  const content = (
    <>
      {(isLeft || isBottom) && (
        <span
          className={`inline-flex min-h-11 min-w-[8.5rem] items-center justify-center px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:min-h-12 sm:min-w-[9.5rem] sm:text-xs ${pillBg}`}
        >
          {action.label}
        </span>
      )}
      <IconCircle tone={action.tone}>{action.icon}</IconCircle>
      {!isLeft && !isBottom && (
        <span
          className={`inline-flex min-h-11 min-w-[8.5rem] items-center justify-center px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:min-h-12 sm:min-w-[9.5rem] sm:text-xs ${pillBg}`}
        >
          {action.label}
        </span>
      )}
    </>
  );

  const className =
    "group inline-flex items-center overflow-hidden rounded-full shadow-[0_8px_24px_rgba(11,31,58,0.12)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,31,58,0.18)]";

  if (action.external) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("tel:") || action.href.startsWith("mailto:") ? undefined : "_blank"}
        rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}

export function ContactQuoteHub() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="!max-w-none [&_img]:mx-auto [&_img]:h-20 [&_img]:max-w-[9rem] sm:[&_img]:h-24 sm:[&_img]:max-w-[11rem]" />
        <h1 className="mt-3 text-2xl font-bold uppercase tracking-[0.18em] text-[var(--ink)] sm:text-3xl md:tracking-[0.22em]">
          {site.name}
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {site.product}
        </p>
      </div>

      {/* Mobile / tablet stack */}
      <div className="mt-10 flex flex-col items-center gap-5 lg:hidden">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(11,31,58,0.1)] ring-[3px] ring-[var(--ink)] sm:h-52 sm:w-52">
          <div className="absolute inset-[6px] rounded-full ring-2 ring-[var(--teal)]" />
          <div className="relative z-10 px-4 text-center">
            <p className="text-lg font-bold uppercase tracking-[0.12em] text-[var(--ink)] sm:text-xl">
              How to
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
              Request a quote
            </p>
          </div>
        </div>
        <div className="flex w-full max-w-sm flex-col items-stretch gap-3">
          {actions.map((action) => (
            <div key={action.id} className="flex justify-center">
              <ActionPill action={{ ...action, side: "left" }} />
            </div>
          ))}
        </div>
        <p className="max-w-sm text-center text-sm text-muted">{site.location}</p>
      </div>

      {/* Desktop radial hub */}
      <div className="relative mt-8 hidden min-h-[34rem] lg:block">
        {/* Connector lines */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-[22%] h-px w-[56%] -translate-x-1/2 bg-slate-300/90" />
          <div className="absolute left-1/2 top-[22%] h-[18%] w-px -translate-x-1/2 bg-slate-300/90" />
          <div className="absolute left-[18%] top-[48%] h-px w-[18%] bg-slate-300/90" />
          <div className="absolute right-[18%] top-[48%] h-px w-[18%] bg-slate-300/90" />
          <div className="absolute bottom-[18%] left-1/2 h-[14%] w-px -translate-x-1/2 bg-slate-300/90" />
        </div>

        <div className="absolute left-1/2 top-[38%] z-10 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_16px_48px_rgba(11,31,58,0.12)] ring-[3px] ring-[var(--ink)] xl:h-64 xl:w-64">
          <div className="absolute inset-[8px] rounded-full ring-2 ring-[var(--teal)]" />
          <div className="relative z-10 px-6 text-center">
            <p className="text-2xl font-bold uppercase tracking-[0.14em] text-[var(--ink)] xl:text-[1.75rem]">
              How to
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 xl:text-sm">
              Request a quote
            </p>
          </div>
        </div>

        {actions.map((action) => (
          <div
            key={action.id}
            className={`absolute z-20 ${action.desktop}`}
          >
            <ActionPill action={action} />
          </div>
        ))}
      </div>

      <p className="mt-8 hidden text-center text-sm text-muted lg:block">
        {site.email} · {site.location}
      </p>
    </div>
  );
}
