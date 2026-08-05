export function CanadianFlagLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-[60svh] flex-col items-center justify-center gap-6 bg-cream px-5"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="canada-flag-loader relative aspect-[2/1] w-[min(18rem,72vw)] overflow-hidden shadow-[0_12px_40px_rgba(200,16,46,0.18)]">
        <div className="absolute inset-y-0 left-0 w-[25%] bg-[#c8102e]" />
        <div className="absolute inset-y-0 right-0 w-[25%] bg-[#c8102e]" />
        <div className="absolute inset-y-0 left-[25%] right-[25%] flex items-center justify-center bg-white">
          <svg
            className="canada-maple-pulse h-[58%] w-auto text-[#c8102e]"
            viewBox="0 0 100 100"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M50 8 L54 28 L68 18 L62 34 L82 32 L66 44 L88 52 L64 52 L70 72 L56 60 L58 88 L50 72 L42 88 L44 60 L30 72 L36 52 L12 52 L34 44 L18 32 L38 34 L32 18 L46 28 Z M48 88 L52 88 L52 96 L48 96 Z"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[#c8102e]">
        {label}
      </p>
    </div>
  );
}
