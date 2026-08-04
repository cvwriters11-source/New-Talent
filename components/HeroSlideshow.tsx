"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";

const slides = [
  {
    src: "/brand/hero-graduates.webp",
    alt: "Black graduates celebrating their achievement",
    label: "Graduate success",
    position: "object-[center_25%]",
    eyebrow: "Graduate Package",
    headline: "Celebrate the start. Prepare for what comes next.",
    message:
      "Fresh graduate CVs that open doors across Africa — ATS-friendly writing, LinkedIn optimisation, and application email templates.",
  },
  {
    src: "/brand/hero-interview.webp",
    alt: "HR interviewing a candidate",
    label: "Interview ready",
    position: "object-center",
    eyebrow: "Interview confidence",
    headline: "Walk into interviews prepared, calm, and convincing.",
    message:
      "We help you present your story clearly — so recruiters see your value and you leave a lasting impression.",
  },
  {
    src: "/brand/hero-cv-review.webp",
    alt: "CV writers reviewing documents with a client",
    label: "CV craft",
    position: "object-center",
    eyebrow: "Professional writing",
    headline: "Your CV should work as hard as you do.",
    message:
      "Expert CV reviews and rewrites that highlight achievements, pass ATS screening, and speak the language of hiring managers.",
  },
  {
    src: "/brand/hero-relocation-family.webp",
    alt: "Black family relocating for new opportunities abroad",
    label: "Global moves",
    position: "object-[center_30%]",
    eyebrow: "International Resume",
    headline: "Ready for a new country. Ready for a new chapter.",
    message:
      "Relocation-ready resumes and applications for Australia, New Zealand, Canada, Ireland, Germany, and beyond.",
  },
] as const;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const active = slides[index];
  const nextIndex = (index + 1) % slides.length;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  // Only keep active + next slide in the DOM to cut downloads and paint cost.
  const visibleIndexes = Array.from(new Set([index, nextIndex]));

  return (
    <section className="relative isolate min-h-[70svh] overflow-hidden sm:min-h-[78svh]">
      {visibleIndexes.map((i) => {
        const slide = slides[i];
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "z-[1] opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              quality={75}
              className={`object-cover ${slide.position}`}
              sizes="100vw"
            />
          </div>
        );
      })}

      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-ink/75 via-ink/55 to-ink/45 sm:bg-gradient-to-r sm:from-ink/80 sm:via-ink/45 sm:to-ink/15"
        aria-hidden
      />

      <div className="relative z-[3] mx-auto flex min-h-[70svh] max-w-6xl items-end px-5 py-14 sm:min-h-[78svh] sm:items-center sm:py-20 md:px-8 md:py-24">
        <div className="max-w-2xl text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-bright sm:text-xs">
            TALENT CRAFTERS · Career Development
          </p>

          <div key={active.src} className="animate-fade-up">
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              {active.eyebrow}
            </p>
            <h1 className="mt-3 text-[1.85rem] leading-[1.15] sm:mt-4 sm:text-4xl md:text-5xl">
              {active.headline}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
              {active.message}
            </p>
          </div>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="/templates"
              className="w-full px-6 py-3.5 sm:w-auto"
            >
              View templates
            </ButtonLink>
            <ButtonLink
              href="/packages"
              variant="on-dark"
              className="w-full px-6 py-3.5 sm:w-auto"
            >
              View packages
            </ButtonLink>
            <ButtonLink
              href="https://chat.whatsapp.com/LUZJfmkCYLvEhJdURor1YX?s=sw&p=a&mlu=0&ilr=0&amv=3"
              variant="on-dark"
              external
              className="w-full px-6 py-3.5 sm:w-auto"
            >
              Join our WhatsApp group
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex gap-2" role="tablist" aria-label="Hero slides">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${slide.label}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-7 bg-teal-bright"
                      : "w-2.5 bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
              {active.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
