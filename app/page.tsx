import nextDynamic from "next/dynamic";
import Link from "next/link";
import { CanadianFlagLoader } from "@/components/CanadianFlagLoader";
import { PackagePricingGrid } from "@/components/PackagePricingGrid";
import { listPackages } from "@/lib/admin/store";
import { getGeoPricing } from "@/lib/geo-pricing";

const HeroSlideshow = nextDynamic(
  () => import("@/components/HeroSlideshow").then((m) => m.HeroSlideshow),
  {
    loading: () => (
      <section className="min-h-[70svh] sm:min-h-[78svh]" aria-hidden>
        <CanadianFlagLoader label="Loading Talent Crafters…" />
      </section>
    ),
  },
);

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [packages, pricing] = await Promise.all([
    listPackages(),
    getGeoPricing(),
  ]);

  return (
    <>
      <HeroSlideshow />

      <section className="bg-cream px-5 py-14 sm:py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <PackagePricingGrid packages={packages} pricing={pricing} />
          <p className="mt-10 text-center text-sm text-muted">
            Prefer to browse layouts first?{" "}
            <Link
              href="/templates"
              className="font-semibold text-teal underline underline-offset-2"
            >
              View CV templates
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
