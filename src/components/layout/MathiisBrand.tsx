import { cn } from "@/lib/utils";

interface MathiisBrandProps {
  compact?: boolean;
  className?: string;
}

export function MathiisBrand({ compact = false, className }: MathiisBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 52 48"
        aria-hidden="true"
        className="h-10 w-11 shrink-0"
      >
        <defs>
          <linearGradient id="mathiis-blue" x1="4" y1="8" x2="28" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1597FF" />
            <stop offset="1" stopColor="#1554E8" />
          </linearGradient>
          <linearGradient id="mathiis-teal" x1="48" y1="8" x2="25" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14C7BD" />
            <stop offset="1" stopColor="#0695A6" />
          </linearGradient>
        </defs>
        <circle cx="26" cy="6" r="4.2" fill="#F7F9FF" />
        <path d="M24.5 16.5C19.5 10.8 12.1 7.4 4 7v27.7c7.6.6 14.6 4 20.5 10.2V16.5Z" fill="url(#mathiis-blue)" />
        <path d="M27.5 16.5C32.5 10.8 39.9 7.4 48 7v27.7c-7.6.6-14.6 4-20.5 10.2V16.5Z" fill="url(#mathiis-teal)" />
        <path d="M26 17.5c2.6-4.2 6.3-7.7 11-10.3" fill="none" stroke="#FFAA3A" strokeLinecap="round" strokeWidth="3" />
        <path d="M7.5 12.5c6.7 1.2 12.3 4.6 16.8 10.2" fill="none" stroke="#70D1FF" strokeLinecap="round" strokeWidth="2.2" opacity=".9" />
      </svg>
      {!compact && (
        <div className="min-w-0">
          <div className="text-[21px] font-extrabold leading-none tracking-[-0.03em] text-white">Mathiis</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Évaluations intelligentes</div>
        </div>
      )}
    </div>
  );
}
