/** Colour helpers for live CV sample recolouring. */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }
  return { h: (h / 6) * 360, s, l };
}

function hue2rgb(p: number, q: number, t: number) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const hh = (((h % 360) + 360) % 360) / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

export function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function hexesNearlyEqual(a: string, b: string, tolerance = 18) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return (
    Math.abs(A.r - B.r) <= tolerance &&
    Math.abs(A.g - B.g) <= tolerance &&
    Math.abs(A.b - B.b) <= tolerance
  );
}

/**
 * Recolour brand/accent pixels near `sourceAccent` toward `targetAccent`,
 * preserving structure so photos and body text stay readable.
 */
export function recolorAccentPixels(
  imageData: ImageData,
  sourceAccent: string,
  targetAccent: string,
  hueTolerance = 28,
): ImageData {
  if (hexesNearlyEqual(sourceAccent, targetAccent, 12)) {
    return imageData;
  }

  const srcRgb = hexToRgb(sourceAccent);
  const tgtRgb = hexToRgb(targetAccent);
  const src = rgbToHsl(srcRgb.r, srcRgb.g, srcRgb.b);
  const tgt = rgbToHsl(tgtRgb.r, tgtRgb.g, tgtRgb.b);

  const out = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );
  const data = out.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 8) continue;

    const hsl = rgbToHsl(r, g, b);

    // Skip neutrals, near-black text, near-white paper.
    if (hsl.s < 0.14) continue;
    if (hsl.l < 0.08 || hsl.l > 0.92) continue;
    if (hueDistance(hsl.h, src.h) > hueTolerance) continue;

    // Avoid warm skin / hair tones.
    if (
      hsl.h >= 10 &&
      hsl.h <= 50 &&
      hsl.s < 0.55 &&
      hsl.l > 0.25 &&
      hsl.l < 0.85
    ) {
      continue;
    }

    const satScale = src.s > 0.05 ? tgt.s / src.s : 1;
    const nextS = Math.min(1, Math.max(0, hsl.s * satScale));

    const lightBlend = Math.min(1, hsl.s * 1.35);
    const lightRatio = src.l > 0.05 ? tgt.l / src.l : 1;
    const shiftedL = Math.min(0.92, Math.max(0.05, hsl.l * lightRatio));
    const nextL =
      hsl.l * (1 - lightBlend * 0.55) + shiftedL * (lightBlend * 0.55);

    const rgb = hslToRgb(tgt.h, nextS, nextL);
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }

  return out;
}
