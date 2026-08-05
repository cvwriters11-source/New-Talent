import Image from "next/image";

export function LogoWheelLoader({
  label = "Loading…",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center gap-4 px-5 py-10"
          : "flex min-h-[60svh] flex-col items-center justify-center gap-6 bg-cream px-5"
      }
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="logo-tyre" aria-hidden>
        <div className="logo-tyre-rim logo-tyre-spin">
          <Image
            src="/brand/logo-sm.png"
            alt=""
            width={200}
            height={200}
            unoptimized
            className="logo-tyre-face"
          />
        </div>
      </div>
      <p className="text-sm font-semibold tracking-[0.16em] uppercase text-teal-bright">
        {label}
      </p>
    </div>
  );
}
