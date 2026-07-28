import type { Metadata } from "next";
import { PackagePricingGrid } from "@/components/PackagePricingGrid";
import { listPackages } from "@/lib/admin/store";
import { getGeoPricing } from "@/lib/geo-pricing";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Graduate, Professional, Executive, and International Resume packages from Talent Crafters Career Development.",
};

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const [packages, pricing] = await Promise.all([
    listPackages(),
    getGeoPricing(),
  ]);

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <PackagePricingGrid
          packages={packages}
          pricing={pricing}
          eyebrow="Packages"
          title="Support built for each stage of your career journey."
          description="Every package is delivered by Talent Crafters with clear scope, practical guidance, and direct communication."
        />
      </section>
    </div>
  );
}
