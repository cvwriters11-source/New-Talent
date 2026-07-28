import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getPackageBySlug, listPackages } from "@/lib/admin/store";
import { defaultPackages } from "@/lib/packages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const packages = await listPackages({ includeInactive: true });
    return packages.map((pkg) => ({ slug: pkg.slug }));
  } catch {
    return defaultPackages.map((pkg) => ({ slug: pkg.slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Checkout" };
  return {
    title: `Checkout — ${pkg.name}`,
    description: `Complete your order for the ${pkg.name}.`,
  };
}

export default async function PackageCheckoutPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <p className="section-label">Checkout</p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">
          Proceed to payment details
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
          Enter your details and upload your CV. Picture is optional. After you
          submit, we’ll confirm your quote and share payment steps.
        </p>
        <div className="maple-divider mt-5" />

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="border border-line bg-paper p-8 text-sm text-muted">
                Loading checkout…
              </div>
            }
          >
            <CheckoutForm pkg={pkg} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
