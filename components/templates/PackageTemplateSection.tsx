"use client";

import { TemplateCard } from "@/components/templates/TemplateCard";
import { getTemplateByPackage } from "@/lib/templates";

export function PackageTemplateSection({
  packageSlug,
}: {
  packageSlug: string;
}) {
  const template = getTemplateByPackage(packageSlug);
  if (!template?.sampleImage) return null;

  return (
    <section className="border-t border-line bg-cream px-5 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="section-label">Template</p>
        <h2 className="mt-3 text-3xl text-ink md:text-4xl">
          Preview the template for this package
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Switch colours to see how your CV can look. Checkout with your chosen
          colour and we’ll deliver in this industry-standard layout.
        </p>
        <div className="mt-10 max-w-xl">
          <TemplateCard template={template} />
        </div>
      </div>
    </section>
  );
}
