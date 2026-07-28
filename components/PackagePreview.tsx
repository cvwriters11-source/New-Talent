import Link from "next/link";
import type { CareerPackage } from "@/lib/packages";

export function PackagePreview({
  pkg,
  index = 0,
}: {
  pkg: CareerPackage;
  index?: number;
}) {
  return (
    <article className="flex flex-col border border-line bg-paper p-7">
      <span className="text-3xl font-bold text-teal/30">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-3 text-2xl text-ink">
        <Link href={`/packages/${pkg.slug}`} className="hover:text-teal">
          {pkg.name}
        </Link>
      </h3>
      {pkg.subtitle ? (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
          {pkg.subtitle}
        </p>
      ) : null}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {pkg.tagline}
      </p>
      <p className="mt-4 text-xs font-semibold text-ink">
        {pkg.timeline}
        {pkg.region ? ` · ${pkg.region}` : ""}
      </p>
      <Link
        href={`/packages/${pkg.slug}`}
        className="mt-6 inline-flex text-sm font-semibold text-teal hover:text-teal-bright"
      >
        View package →
      </Link>
    </article>
  );
}
