import dynamic from "next/dynamic";
import { ButtonLink } from "@/components/ButtonLink";

const HeroSlideshow = dynamic(
  () => import("@/components/HeroSlideshow").then((m) => m.HeroSlideshow),
  {
    loading: () => (
      <section className="min-h-[70svh] bg-ink sm:min-h-[78svh]" aria-hidden />
    ),
  },
);

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />

      <section className="bg-cream px-5 py-14 sm:py-20 md:px-8">
        <div className="mx-auto max-w-6xl border border-line bg-white px-5 py-10 shadow-sm sm:px-8 sm:py-14 md:px-14">
          <p className="section-label">Ready when you are</p>
          <h2 className="mt-3 max-w-xl text-2xl text-ink sm:text-3xl md:text-4xl">
            Put your best application forward
          </h2>
          <p className="mt-4 max-w-lg text-sm text-muted sm:text-base">
            Choose a template and package — we’ll come back with a clear quote
            and next steps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="/packages"
              className="w-full px-6 py-3.5 sm:w-auto"
            >
              View packages
            </ButtonLink>
            <ButtonLink
              href="/templates"
              variant="secondary"
              className="w-full px-6 py-3.5 sm:w-auto"
            >
              View templates
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
