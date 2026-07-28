"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  hexesNearlyEqual,
  recolorAccentPixels,
} from "@/lib/recolorImage";

type Props = {
  src: string;
  alt: string;
  sourceAccent: string;
  accent?: string;
  hueTolerance?: number;
  className?: string;
};

function Frame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[210/297] w-full overflow-hidden border border-line bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Shows a real CV sample. Uses a cheap next/image until the client picks a
 * different colour, then runs a smaller canvas recolour pass.
 */
export function RecolorableSamplePreview({
  src,
  alt,
  sourceAccent,
  accent,
  hueTolerance = 28,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef<ImageData | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const target = accent || sourceAccent;
  const needsRecolor = !hexesNearlyEqual(sourceAccent, target, 14);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !needsRecolor) {
      setReady(false);
      originalRef.current = null;
      return;
    }

    let cancelled = false;
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;

      const maxW = 480;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));

      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      originalRef.current = ctx.getImageData(0, 0, w, h);
      setReady(true);
    };

    img.onerror = () => {
      if (!cancelled) setReady(false);
    };

    return () => {
      cancelled = true;
    };
  }, [src, inView, needsRecolor]);

  useEffect(() => {
    if (!needsRecolor || !ready) return;
    const canvas = canvasRef.current;
    const original = originalRef.current;
    if (!canvas || !original) return;

    canvas.width = original.width;
    canvas.height = original.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const run = () => {
      const recoloured = recolorAccentPixels(
        original,
        sourceAccent,
        target,
        hueTolerance,
      );
      ctx.putImageData(recoloured, 0, 0);
    };

    const id = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(id);
  }, [ready, sourceAccent, target, hueTolerance, needsRecolor]);

  return (
    <div ref={frameRef}>
      <Frame className={className}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className={`object-contain object-top bg-white transition-opacity ${
            needsRecolor && ready ? "opacity-0" : "opacity-100"
          }`}
          quality={75}
        />
        {needsRecolor ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={alt}
            className={`absolute inset-0 h-full w-full bg-white object-contain object-top ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}
      </Frame>
    </div>
  );
}
