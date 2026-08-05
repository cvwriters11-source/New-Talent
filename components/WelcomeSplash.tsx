"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Phase = "loading" | "welcome" | "done";

const STORAGE_KEY = "tc-welcome-seen";

export function WelcomeSplash() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("done");
        return;
      }
    } catch {
      /* ignore */
    }

    setVisible(true);
    const previousTitle = document.title;

    const welcomeTimer = window.setTimeout(() => {
      setPhase("welcome");
      document.title = "Welcome — Talent Crafters";
    }, 1500);

    const fadeTimer = window.setTimeout(() => setFading(true), 3000);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setPhase("done");
      document.title = previousTitle;
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 3600);

    return () => {
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      document.title = previousTitle;
    };
  }, []);

  if (!visible || phase === "done") return null;

  return (
    <div
      className={`welcome-splash fixed inset-0 z-[100] flex items-center justify-center bg-white px-6 ${
        fading ? "welcome-splash--hide" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label={phase === "welcome" ? "Welcome" : "Loading"}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="logo-wheel-track relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          <Image
            src="/brand/logo-sm.png"
            alt="Talent Crafters Recruitment"
            width={200}
            height={200}
            priority
            unoptimized
            className={`logo-wheel-roll h-28 w-auto max-w-[8rem] object-contain sm:h-32 sm:max-w-[9rem] ${
              phase === "welcome" ? "logo-wheel-roll--slow" : ""
            }`}
          />
        </div>

        <div className="min-h-[2.5rem]">
          {phase === "loading" ? (
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-teal">
              Loading…
            </p>
          ) : (
            <p className="welcome-splash-text text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Welcome
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
