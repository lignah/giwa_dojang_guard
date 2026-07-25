import { BADGE_NAME } from "@/lib/config";

interface BadgeProps {
  eligible: boolean;
  reason?: string;
  size?: "md" | "lg";
}

export function VerifiedBadge({ eligible, reason, size = "lg" }: BadgeProps) {
  if (!eligible) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={`relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${
            size === "lg" ? "h-36 w-36" : "h-24 w-24"
          }`}
        >
          <div className="text-center opacity-40">
            <div className="text-3xl">⊘</div>
            <div className="mt-1 text-[10px] font-medium tracking-wide uppercase">
              No Badge
            </div>
          </div>
        </div>
        {reason && (
          <p className="max-w-xs text-center text-xs text-zinc-500">{reason}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 via-emerald-400/30 to-amber-300/40 blur-xl" />
        <div
          className={`relative flex flex-col items-center justify-center rounded-full border-2 border-amber-300/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_0_40px_rgba(52,211,153,0.35)] ${
            size === "lg" ? "h-40 w-40 p-4" : "h-28 w-28 p-3"
          }`}
        >
          <div className="absolute inset-1 rounded-full border border-cyan-400/30" />
          <svg
            viewBox="0 0 24 24"
            className={`${size === "lg" ? "h-10 w-10" : "h-7 w-7"} text-emerald-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
          <div
            className={`mt-1 text-center font-semibold tracking-tight text-amber-200 ${
              size === "lg" ? "text-[11px] leading-tight" : "text-[9px]"
            }`}
          >
            {BADGE_NAME}
          </div>
          <div className="mt-0.5 text-[9px] font-medium tracking-[0.2em] text-cyan-300/80 uppercase">
            GIWA
          </div>
        </div>
      </div>
      {reason && (
        <p className="max-w-xs text-center text-xs text-emerald-400/80">
          {reason}
        </p>
      )}
    </div>
  );
}
