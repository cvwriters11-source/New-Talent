"use client";

import { FormEvent, useEffect, useId, useState } from "react";

const fieldClass =
  "w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors focus:border-teal";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

const DIAL_CODES = [
  { code: "+27", label: "ZA +27" },
  { code: "+266", label: "LS +266" },
  { code: "+267", label: "BW +267" },
  { code: "+264", label: "NA +264" },
  { code: "+263", label: "ZW +263" },
  { code: "+258", label: "MZ +258" },
  { code: "+260", label: "ZM +260" },
  { code: "+265", label: "MW +265" },
  { code: "+254", label: "KE +254" },
  { code: "+256", label: "UG +256" },
  { code: "+255", label: "TZ +255" },
  { code: "+234", label: "NG +234" },
  { code: "+233", label: "GH +233" },
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+353", label: "IE +353" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function InvoiceRequestModal({ open, onClose }: Props) {
  const titleId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [cvName, setCvName] = useState("");
  const [pictureName, setPictureName] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/invoice-request", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as {
        error?: string;
        orderNumber?: string;
      };
      if (!res.ok) throw new Error(json.error || "Could not submit request.");
      setOrderNumber(json.orderNumber || "");
      setStatus("success");
      form.reset();
      setCvName("");
      setPictureName("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto border border-line bg-white shadow-2xl sm:rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              Invoice request
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-ink">
              Ask for invoice
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-5">
          {status === "success" ? (
            <div className="space-y-4">
              {orderNumber ? (
                <p className="text-base font-bold tracking-wide text-teal">
                  Order number: {orderNumber}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-ink">
                Thanks — your invoice request was sent. We’ll follow up on WhatsApp
                shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setOrderNumber("");
                  onClose();
                }}
                className="btn-primary px-5 py-3 text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="inv-firstName" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="inv-firstName"
                    name="firstName"
                    required
                    minLength={1}
                    autoComplete="given-name"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="inv-surname" className={labelClass}>
                    Surname
                  </label>
                  <input
                    id="inv-surname"
                    name="surname"
                    required
                    minLength={1}
                    autoComplete="family-name"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inv-whatsapp" className={labelClass}>
                  WhatsApp number
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    required
                    defaultValue="+27"
                    className="min-h-12 w-[8.5rem] shrink-0 border border-line bg-white px-2 text-sm outline-none focus:border-teal"
                    aria-label="Country code"
                  >
                    {DIAL_CODES.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="inv-whatsapp"
                    name="whatsapp"
                    type="tel"
                    required
                    inputMode="tel"
                    placeholder="82 123 4567"
                    minLength={6}
                    maxLength={20}
                    className={fieldClass}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  Include your local number — country code is selected separately.
                </p>
              </div>

              <div>
                <label htmlFor="inv-cv" className={labelClass}>
                  Upload CV <span className="font-normal text-muted">(required)</span>
                </label>
                <input
                  id="inv-cv"
                  name="cv"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setCvName(e.target.files?.[0]?.name || "")}
                  className="w-full border border-line bg-white px-3.5 py-3 text-sm file:mr-3 file:border-0 file:bg-teal file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                {cvName ? (
                  <p className="mt-1 text-xs text-muted">Selected: {cvName}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="inv-picture" className={labelClass}>
                  Picture <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="inv-picture"
                  name="picture"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={(e) => setPictureName(e.target.files?.[0]?.name || "")}
                  className="w-full border border-line bg-white px-3.5 py-3 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                {pictureName ? (
                  <p className="mt-1 text-xs text-muted">Selected: {pictureName}</p>
                ) : null}
              </div>

              {error ? (
                <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full px-6 py-3.5 text-sm disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Submit invoice request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
