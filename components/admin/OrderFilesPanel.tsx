"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function fileKind(url: string): "pdf" | "image" | "doc" | "other" {
  if (/\.pdf($|\?)/i.test(url) || url.toLowerCase().includes("application/pdf")) {
    return "pdf";
  }
  if (/\.(png|jpe?g|webp|gif)($|\?)/i.test(url)) return "image";
  if (/\.(docx?|DOCX?)($|\?)/.test(url)) return "doc";
  return "other";
}

function fileLabel(url: string) {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.split("?")[0] || "Submitted file";
  } catch {
    return "Submitted file";
  }
}

function FileActions({
  openHref,
  downloadHref,
  openLabel,
  downloadLabel,
}: {
  openHref: string;
  downloadHref: string;
  openLabel: string;
  downloadLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      <a
        href={openHref}
        target="_blank"
        rel="noreferrer"
        className="btn-primary inline-flex w-full justify-center px-4 py-2.5 text-sm sm:w-auto"
      >
        {openLabel}
      </a>
      <a
        href={downloadHref}
        className="btn-secondary inline-flex w-full justify-center px-4 py-2.5 text-sm sm:w-auto"
      >
        {downloadLabel}
      </a>
    </div>
  );
}

function CvPdfPreview({ fileHref }: { fileHref: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError("");
    setBlobUrl(null);

    (async () => {
      try {
        const res = await fetch(fileHref, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            json?.error || "Could not load this CV file for preview.",
          );
        }
        const type = res.headers.get("content-type") || "";
        if (!type.includes("pdf")) {
          throw new Error("Stored file is not a PDF.");
        }
        const blob = await res.blob();
        if (blob.size < 200) {
          throw new Error(
            "This CV file is incomplete or not a valid PDF. Ask the client to upload again.",
          );
        }
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setBlobUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load this CV file for preview.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileHref]);

  if (loading) {
    return (
      <p className="rounded-md border border-line bg-cream px-3 py-2 text-sm text-muted">
        Loading CV preview…
      </p>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-3 text-sm text-ink">
        <p className="font-semibold text-danger">Could not preview this CV</p>
        <p className="mt-1 text-muted">
          {error ||
            "The stored file is missing or invalid. Ask the client to resubmit a real PDF."}
        </p>
      </div>
    );
  }

  return (
    <iframe
      title="CV preview"
      src={blobUrl}
      className="h-56 w-full border border-line bg-paper sm:h-80 md:h-[28rem]"
    />
  );
}

export function OrderFilesPanel({
  orderId,
  orderNumber,
  cvUrl,
  pictureUrl,
  customerName,
}: {
  orderId: string;
  orderNumber?: string;
  cvUrl?: string | null;
  pictureUrl?: string | null;
  customerName: string;
}) {
  const cvKind = cvUrl ? fileKind(cvUrl) : null;
  const fileBase = `/api/admin/orders/${encodeURIComponent(orderId)}/file`;
  const cvOpen = `${fileBase}?kind=cv`;
  const cvDownload = `${fileBase}?kind=cv&download=1`;
  const pictureOpen = `${fileBase}?kind=picture`;
  const pictureDownload = `${fileBase}?kind=picture&download=1`;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-ink">Submitted CV</h2>
          {orderNumber ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {orderNumber}
            </p>
          ) : null}
        </div>
        {cvUrl ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted">
              Client file:{" "}
              <span className="font-semibold text-ink">{fileLabel(cvUrl)}</span>
            </p>
            <FileActions
              openHref={cvOpen}
              downloadHref={cvDownload}
              openLabel="Open / view CV"
              downloadLabel="Download CV"
            />
            {cvKind === "pdf" ? (
              <CvPdfPreview fileHref={cvOpen} />
            ) : cvKind === "image" ? (
              <div className="relative aspect-[3/4] overflow-hidden border border-line bg-paper">
                <Image
                  src={cvOpen}
                  alt="Submitted CV"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <p className="rounded-md border border-line bg-cream px-3 py-2 text-sm text-muted">
                {cvKind === "doc"
                  ? "Word documents open in a new tab or via Download — in-page preview isn’t available."
                  : "Preview isn’t available for this file type. Use Open / Download."}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No CV was uploaded with this order. Ask the client to resubmit if a
            file is needed.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-ink">Picture</h2>
          {orderNumber ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {orderNumber}
            </p>
          ) : null}
        </div>
        {pictureUrl ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted">
              Client file:{" "}
              <span className="font-semibold text-ink">
                {fileLabel(pictureUrl)}
              </span>
            </p>
            <FileActions
              openHref={pictureOpen}
              downloadHref={pictureDownload}
              openLabel="Open full picture"
              downloadLabel="Download picture"
            />
            <div className="relative aspect-square w-full max-w-[220px] overflow-hidden border border-line bg-paper">
              <Image
                src={pictureOpen}
                alt={customerName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No picture was uploaded with this order.
          </p>
        )}
      </section>
    </div>
  );
}
