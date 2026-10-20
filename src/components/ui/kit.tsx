import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page title block shared by every dashboard page. */
export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-foreground text-background border-foreground",
  generating: "border-dashed border-foreground animate-pulse",
  pending: "border-foreground/30 text-muted",
  failed: "border-red-600 text-red-700",
};

/** Exam status pill in ink: filled when done, dashed while generating, red only on failure. */
export function StatusBadge({ status, children }: { status: string; children: ReactNode }) {
  return <span className={cn("shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[status] ?? STATUS_STYLE.pending)}>{children}</span>;
}
