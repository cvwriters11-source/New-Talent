import Link from "next/link";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { templates } from "@/lib/templates";

/** Only show templates that have a real sample image (no CSS mock previews). */
export function getDisplayTemplates() {
  return templates.filter((template) => Boolean(template.sampleImage));
}

export function TemplateGallery({
  limit,
  dark = false,
}: {
  limit?: number;
  dark?: boolean;
}) {
  const available = getDisplayTemplates();
  const items = limit ? available.slice(0, limit) : available;

  if (items.length === 0) return null;

  return (
    <section
      className={
        dark
          ? "bg-navy px-5 py-20 text-cream md:px-8"
          : "bg-cream px-5 py-20 md:px-8"
      }
    >
      <div className="mx-auto max-w-6xl">
        <p
          className={
            dark
              ? "text-xs font-bold uppercase tracking-[0.18em] text-teal-bright"
              : "section-label"
          }
        >
          Templates
        </p>
        <h2
          className={`mt-3 max-w-2xl text-3xl md:text-4xl ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          Industry-standard CV templates you can colour to fit your brand
        </h2>
        <p
          className={`mt-3 max-w-2xl ${dark ? "text-paper/70" : "text-muted"}`}
        >
          Preview our real package templates — then choose a colour and
          proceed to checkout.
        </p>

        <div
          className={`mt-12 grid gap-8 ${
            items.length > 1 ? "lg:grid-cols-2" : "max-w-xl"
          }`}
        >
          {items.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {limit && limit < available.length ? (
          <div className="mt-10">
            <Link
              href="/templates"
              className={
                dark
                  ? "border border-white/25 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-navy"
                  : "btn-secondary px-6 py-3.5 text-sm"
              }
            >
              View all templates
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
