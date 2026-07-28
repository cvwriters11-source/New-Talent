"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ExecutiveTemplatePreview,
  GraduateTemplatePreview,
  InternationalTemplatePreview,
  ProfessionalTemplatePreview,
} from "@/components/templates/CvTemplatePreviews";
import type { CvTemplate } from "@/lib/templates";
import { hexToRgb } from "@/lib/recolorImage";

const previewMap = {
  graduate: GraduateTemplatePreview,
  professional: ProfessionalTemplatePreview,
  executive: ExecutiveTemplatePreview,
  international: InternationalTemplatePreview,
} as const;

function closestColorId(template: CvTemplate) {
  const sample = template.sampleAccent;
  if (!sample || template.colors.length === 0) {
    return template.colors[0]?.id || "teal";
  }
  const target = hexToRgb(sample);
  let best = template.colors[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const option of template.colors) {
    const c = hexToRgb(option.hex);
    const dist =
      (c.r - target.r) ** 2 + (c.g - target.g) ** 2 + (c.b - target.b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = option;
    }
  }
  return best.id;
}

export function TemplateCard({ template }: { template: CvTemplate }) {
  const defaultColorId = useMemo(() => closestColorId(template), [template]);
  const [colorId, setColorId] = useState(defaultColorId);
  const color =
    template.colors.find((c) => c.id === colorId) || template.colors[0];
  const Preview = previewMap[template.id];

  return (
    <article className="flex flex-col border border-line bg-paper p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Choose a colour
        </p>
        <p className="mt-1 text-xs text-muted">
          Pick a colour to preview how this CV will look for you.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {template.colors.map((option) => {
            const active = option.id === colorId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setColorId(option.id)}
                className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-teal bg-teal-muted text-ink"
                    : "border-line bg-white text-muted hover:border-ink/30"
                }`}
                aria-pressed={active}
              >
                <span
                  className="h-3.5 w-3.5 border border-black/10"
                  style={{ backgroundColor: option.hex }}
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <Preview
        accent={
          colorId === defaultColorId
            ? template.sampleAccent || color?.hex
            : color?.hex
        }
        sourceAccent={template.sampleAccent}
      />

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl text-ink">{template.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {template.layout}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {template.description}
        </p>
        <p className="mt-3 text-xs font-semibold text-ink">{template.bestFor}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/packages/${template.packageSlug}?color=${colorId}`}
            className="btn-primary px-4 py-2.5 text-sm"
          >
            View package
          </Link>
          <Link
            href={`/packages/${template.packageSlug}/checkout?color=${colorId}`}
            className="btn-secondary px-4 py-2.5 text-sm"
          >
            Checkout with this colour
          </Link>
        </div>
      </div>
    </article>
  );
}
