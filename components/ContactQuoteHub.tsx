"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { InvoiceRequestModal } from "@/components/InvoiceRequestModal";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

type Tone = "red" | "navy";
type Side = "left" | "right" | "bottom";

type ContactAction = {
  id: string;
  label: string;
  href?: string;
  external?: boolean;
  onOpenInvoice?: boolean;
  tone: Tone;
  side: Side;
  style: { top?: string; left?: string; right?: string; bottom?: string };
  icon: ReactNode;
};

const phoneHref = `tel:+${site.whatsappNumber}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location)}`;

const actions: ContactAction[] = [
  {
    id: "packages",
    label: "Packages",
    href: "/packages",
    tone: "red",
    side: "left",
    style: { top: "10%", left: "0%" },
    icon: (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
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
    style: { top: "10%", right: "0%" },
    icon: (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" fill="currentColor">
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
    style: { top: "44%", left: "0%" },
    icon: (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5 fill-[#25D366]">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "invoice",
    label: "Ask for invoice",
    onOpenInvoice: true,
    tone: "red",
    side: "right",
    style: { top: "44%", right: "0%" },
    icon: (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M7 3.5h7.5L19 8v12.5H7V3.5Z" strokeLinejoin="round" />
        <path d="M14.5 3.5V8H19M9.5 12h5M9.5 15.5h5M9.5 19h3" strokeLinecap="round" />
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
    style: { bottom: "2%", left: "50%" },
    icon: (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" fill="currentColor">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
    ),
  },
];

function ActionPill({
  action,
  onInvoice,
}: {
  action: ContactAction;
  onInvoice: () => void;
}) {
  const pillBg = action.tone === "red" ? "bg-[var(--teal)]" : "bg-[var(--ink)]";
  const iconFirst = action.side === "right";

  const label = (
    <span
      className={`inline-flex h-9 min-w-[6.75rem] items-center justify-center px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:h-11 sm:min-w-[9rem] sm:px-4 sm:text-[11px] md:h-12 md:min-w-[10.5rem] md:text-xs ${pillBg}`}
    >
      {action.label}
    </span>
  );

  const icon = (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 md:h-12 md:w-12 ${
        action.id === "whatsapp"
          ? "bg-white text-[var(--ink)] ring-2 ring-[var(--ink)]"
          : "bg-[var(--ink)] text-white"
      }`}
      aria-hidden
    >
      {action.icon}
    </span>
  );

  const content = iconFirst ? (
    <>
      {icon}
      {label}
    </>
  ) : (
    <>
      {label}
      {icon}
    </>
  );

  const className =
    "inline-flex items-center overflow-hidden rounded-full shadow-[0_6px_18px_rgba(11,31,58,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(11,31,58,0.2)]";

  if (action.onOpenInvoice) {
    return (
      <button type="button" onClick={onInvoice} className={className}>
        {content}
      </button>
    );
  }

  if (action.external && action.href) {
    return (
      <a
        href={action.href}
        target={
          action.href.startsWith("tel:") || action.href.startsWith("mailto:")
            ? undefined
            : "_blank"
        }
        rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={action.href || "/"} className={className}>
      {content}
    </Link>
  );
}

export function ContactQuoteHub() {
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="!max-w-none [&_img]:mx-auto [&_img]:h-16 [&_img]:max-w-[7.5rem] sm:[&_img]:h-20 sm:[&_img]:max-w-[9rem] md:[&_img]:h-24 md:[&_img]:max-w-[11rem]" />
        <h1 className="mt-2 text-xl font-bold uppercase tracking-[0.16em] text-[var(--ink)] sm:mt-3 sm:text-2xl md:text-3xl md:tracking-[0.2em]">
          {site.name}
        </h1>
      </div>

      <div className="relative mx-auto mt-4 aspect-[1/1.05] w-full max-w-[42rem] sm:mt-6 sm:aspect-square md:mt-8">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            d="M18 22 H82 M50 22 V34"
            fill="none"
            stroke="#c5ccd6"
            strokeWidth="0.45"
          />
          <path d="M18 50 H34" fill="none" stroke="#c5ccd6" strokeWidth="0.45" />
          <path d="M66 50 H82" fill="none" stroke="#c5ccd6" strokeWidth="0.45" />
          <path d="M50 66 V82" fill="none" stroke="#c5ccd6" strokeWidth="0.45" />
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(11,31,58,0.1)]">
          <div
            className="absolute inset-0 rounded-full p-[3px] sm:p-[4px]"
            style={{
              background:
                "conic-gradient(from 200deg, var(--ink) 0deg 180deg, var(--teal) 180deg 360deg)",
            }}
          >
            <div className="h-full w-full rounded-full bg-white" />
          </div>
          <div className="absolute inset-[10%] rounded-full border border-dashed border-slate-300/80" />
          <div className="relative z-10 px-2 text-center sm:px-3">
            <p className="text-[clamp(0.85rem,3.4vw,1.65rem)] font-bold uppercase tracking-[0.1em] text-[var(--ink)]">
              How to
            </p>
            <p className="mt-0.5 text-[clamp(0.55rem,1.8vw,0.8rem)] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:mt-1">
              Request a quote
            </p>
          </div>
        </div>

        {actions.map((action) => (
          <div
            key={action.id}
            className={`absolute z-20 ${
              action.side === "bottom" ? "-translate-x-1/2" : ""
            }`}
            style={action.style}
          >
            <ActionPill
              action={action}
              onInvoice={() => setInvoiceOpen(true)}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted sm:mt-6 sm:text-sm">
        {site.email} · {site.location}
      </p>

      <InvoiceRequestModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
      />
    </div>
  );
}
