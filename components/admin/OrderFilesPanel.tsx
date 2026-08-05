"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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

export function OrderFilesPanel({
  orderId,
  cvUrl,
  pictureUrl,
  customerName,
}: {
  orderId: string;
  cvUrl?: string | null;
  pictureUrl?: string | null;
  customerName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/files`, {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const cvKind = cvUrl ? fileKind(cvUrl) : null;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">Submitted CV</h2>
        {cvUrl ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted">
              Client file:{" "}
              <span className="font-semibold text-ink">{fileLabel(cvUrl)}</span>
            </p>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex w-full justify-center px-4 py-2.5 text-sm sm:w-auto"
              >
                Open / view CV
              </a>
              <a
                href={cvUrl}
                download
                className="btn-secondary inline-flex w-full justify-center px-4 py-2.5 text-sm sm:w-auto"
              >
                Download CV
              </a>
            </div>
            {cvKind === "pdf" ? (
              <iframe
                title="CV preview"
                src={cvUrl}
                className="h-56 w-full border border-line bg-paper sm:h-80 md:h-[28rem]"
              />
            ) : cvKind === "image" ? (
              <div className="relative aspect-[3/4] overflow-hidden border border-line bg-paper">
                <Image
                  src={cvUrl}
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
            No CV file is linked to this order yet. If the client just ordered,
            ask them to resubmit, or attach the file below.
          </p>
        )}

        <form onSubmit={onUpload} className="mt-4 space-y-3 border-t border-line pt-4">
          <label className="block text-sm font-semibold text-ink" htmlFor="admin-cv">
            {cvUrl ? "Replace CV file" : "Attach CV file"}
          </label>
          <input
            id="admin-cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="block w-full text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {busy ? "Uploading…" : "Upload CV"}
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>
      </section>

      <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">Picture</h2>
        {pictureUrl ? (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <a
                href={pictureUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-semibold text-teal underline"
              >
                Open full picture
              </a>
              <a
                href={pictureUrl}
                download
                className="inline-flex text-sm font-semibold text-ink underline"
              >
                Download picture
              </a>
            </div>
            <div className="relative aspect-square overflow-hidden border border-line bg-paper">
              <Image
                src={pictureUrl}
                alt={customerName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No picture is linked to this order yet.
          </p>
        )}

        <form onSubmit={onUpload} className="mt-4 space-y-3 border-t border-line pt-4">
          <label
            className="block text-sm font-semibold text-ink"
            htmlFor="admin-picture"
          >
            {pictureUrl ? "Replace picture" : "Attach picture"}
          </label>
          <input
            id="admin-picture"
            name="picture"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="block w-full text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {busy ? "Uploading…" : "Upload picture"}
          </button>
        </form>
      </section>
    </div>
  );
}
