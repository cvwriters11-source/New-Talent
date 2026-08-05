"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SitePopup } from "@/lib/admin/store";

const fieldClass =
  "w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-teal";

export function PopupEditor({ popup }: { popup: SitePopup }) {
  const router = useRouter();
  const [title, setTitle] = useState(popup.title);
  const [message, setMessage] = useState(popup.message);
  const [ctaLabel, setCtaLabel] = useState(popup.ctaLabel || "");
  const [ctaHref, setCtaHref] = useState(popup.ctaHref || "");
  const [active, setActive] = useState(popup.active);
  const [imageUrl, setImageUrl] = useState(popup.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [preview, setPreview] = useState(popup.imageUrl || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onPickImage(file: File | null) {
    setImageFile(file);
    setClearImage(false);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function onRemoveImage() {
    setImageFile(null);
    setClearImage(true);
    setImageUrl("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);

    const form = new FormData();
    form.set("title", title);
    form.set("message", message);
    form.set("ctaLabel", ctaLabel);
    form.set("ctaHref", ctaHref);
    form.set("active", active ? "true" : "false");
    form.set("clearImage", clearImage ? "true" : "false");
    if (!clearImage && !imageFile && imageUrl) {
      form.set("imageUrl", imageUrl);
    }
    if (imageFile) {
      form.set("image", imageFile);
    }

    try {
      const res = await fetch("/api/admin/popup", {
        method: "PUT",
        body: form,
      });
      const json = (await res.json()) as { error?: string; popup?: SitePopup };
      if (!res.ok) throw new Error(json.error || "Save failed");
      if (json.popup?.imageUrl) {
        setPreview(json.popup.imageUrl);
        setImageUrl(json.popup.imageUrl);
      } else if (json.popup && !json.popup.imageUrl) {
        setPreview("");
        setImageUrl("");
      }
      setImageFile(null);
      setClearImage(false);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Site popup</h1>
          <p className="mt-1 text-sm text-muted">
            Show a dismissible announcement on the public site. Turn it off any
            time.
          </p>
        </div>
        <span
          className={`px-3 py-1.5 text-xs font-semibold ${
            active
              ? "bg-teal/10 text-teal"
              : "bg-slate-100 text-muted"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-4 rounded-xl border border-line bg-paper p-5 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Show popup on the public website
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Title</span>
            <input
              required
              maxLength={120}
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Message</span>
            <textarea
              required
              maxLength={800}
              rows={4}
              className={fieldClass}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">
                Button label (optional)
              </span>
              <input
                className={fieldClass}
                placeholder="View packages"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">
                Button link (optional)
              </span>
              <input
                className={fieldClass}
                placeholder="/packages"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-ink">Small image (optional)</p>
              <p className="mt-1 text-xs text-muted">
                JPG, PNG, or WebP · max 2MB. Shown above the message.
              </p>
            </div>

            {preview ? (
              <div className="flex items-center gap-4 border border-line bg-paper-deep p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Popup preview"
                  className="h-16 w-16 shrink-0 object-cover border border-line bg-paper"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {imageFile?.name || "Current popup image"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Ready to save</p>
                </div>
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="shrink-0 border border-danger/30 bg-white px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/5"
                >
                  Remove
                </button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                className="sr-only"
                id="popup-image-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M12 16V7M8.5 10.5 12 7l3.5 3.5" />
                  <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
                </svg>
                {imageFile || preview ? "Change image" : "Upload image"}
              </button>
              {!preview && !imageFile ? (
                <span className="text-xs text-muted">No image selected</span>
              ) : null}
            </div>

          </div>

          {error ? (
            <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="border border-teal/30 bg-teal/5 px-3 py-2 text-sm text-teal">
              Popup saved.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save popup"}
          </button>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Preview
          </p>
          <div className="mt-4 border border-line bg-cream p-5 text-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="mx-auto h-16 w-16 object-cover border border-line"
              />
            ) : null}
            <h2 className="mt-3 text-lg font-bold text-ink">
              {title || "Popup title"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {message || "Popup message goes here."}
            </p>
            {ctaLabel ? (
              <span className="btn-primary mt-4 inline-flex px-4 py-2 text-xs">
                {ctaLabel}
              </span>
            ) : null}
          </div>
        </aside>
      </form>
    </div>
  );
}
