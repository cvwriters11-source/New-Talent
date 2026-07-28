"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CanadaChatWidgetInner = dynamic(
  () =>
    import("@/components/CanadaChatWidget").then((m) => m.CanadaChatWidget),
  { ssr: false, loading: () => null },
);

/** Defer chat JS until the browser is idle so first paint stays snappy. */
export function DeferredCanadaChat() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    const w = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(enable, { timeout: 2500 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(id);
      };
    }

    const t = globalThis.setTimeout(enable, 1200);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(t);
    };
  }, []);

  if (!ready) return null;
  return <CanadaChatWidgetInner />;
}
