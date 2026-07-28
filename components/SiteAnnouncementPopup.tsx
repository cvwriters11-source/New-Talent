"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PopupPayload = {
  active: boolean;
  title?: string;
  message?: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  ctaHref?: string;
  updatedAt?: string;
};

const STORAGE_KEY = "tc_popup_dismissed_at";

export function SiteAnnouncementPopup() {
  const [popup, setPopup] = useState<PopupPayload | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/popup", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PopupPayload;
        if (cancelled || !data.active || !data.title || !data.message) return;

        const dismissed = sessionStorage.getItem(STORAGE_KEY);
        if (dismissed && data.updatedAt && dismissed === data.updatedAt) {
          return;
        }

        setPopup(data);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }

    const t = window.setTimeout(load, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  function dismiss() {
    if (popup?.updatedAt) {
      sessionStorage.setItem(STORAGE_KEY, popup.updatedAt);
    }
    setOpen(false);
  }

  if (!open || !popup) return null;

  const showCta = Boolean(popup.ctaLabel && popup.ctaHref);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-popup-title"
    >
      <div className="relative w-full max-w-md border border-line bg-paper p-6 shadow-xl sm:p-7">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 px-2 py-1 text-sm font-semibold text-muted hover:text-ink"
          aria-label="Close popup"
        >
          ×
        </button>

        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.imageUrl}
            alt=""
            className="mx-auto h-20 w-20 object-cover border border-line"
          />
        ) : null}

        <h2
          id="site-popup-title"
          className="mt-4 text-center text-xl font-bold text-ink"
        >
          {popup.title}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          {popup.message}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {showCta ? (
            <Link
              href={popup.ctaHref!}
              onClick={dismiss}
              className="btn-primary px-5 py-2.5 text-center text-sm"
            >
              {popup.ctaLabel}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="border border-line bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
