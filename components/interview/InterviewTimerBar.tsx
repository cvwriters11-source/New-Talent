"use client";

type InterviewTimerBarProps = {
  remainingLabel: string;
  interviewerName: string;
  statusLabel: string;
  isLowTime: boolean;
};

export function InterviewTimerBar({
  remainingLabel,
  interviewerName,
  statusLabel,
  isLowTime,
}: InterviewTimerBarProps) {
  return (
    <div
      className={`sticky top-0 z-40 border-b px-3 py-2.5 backdrop-blur-md ${
        isLowTime
          ? "border-danger/40 bg-danger/10"
          : "border-teal/30 bg-paper/95"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
            Time left
          </p>
          <p
            className={`interview-live-serif text-2xl leading-none ${
              isLowTime ? "text-danger" : "text-teal"
            }`}
          >
            {remainingLabel}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-semibold text-ink">
            {interviewerName}
          </p>
          <p className="truncate text-[10px] text-muted">{statusLabel}</p>
        </div>
      </div>
    </div>
  );
}
