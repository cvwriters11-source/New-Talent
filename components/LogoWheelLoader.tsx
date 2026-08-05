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
      <div className="logo-wheel-track relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        <Image
          src="/brand/logo-sm.png"
          alt=""
          width={160}
          height={160}
          unoptimized
          className="logo-wheel-roll h-24 w-auto max-w-[6.5rem] object-contain sm:h-28 sm:max-w-[7.5rem]"
          aria-hidden
        />
      </div>
      <p className="text-sm font-semibold tracking-[0.16em] uppercase text-teal-bright">
        {label}
      </p>
    </div>
  );
}
