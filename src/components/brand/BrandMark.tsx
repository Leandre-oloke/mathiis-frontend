import { cn } from "@/lib/utils";

/** The Mathiis logo mark, drawn as a mask filled with the current text colour (ink by default). */
export function BrandMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("brand-mark h-8 w-8 shrink-0", className)} />;
}

/** Logo mark + wordmark, used in headers and the sidebar. */
export function Brand({ subtitle, className }: { subtitle?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <BrandMark />
      <span className="leading-none">
        <span className="block font-display text-lg font-bold tracking-tight">Mathiis</span>
        {subtitle && <span className="mt-1 block text-xs font-normal text-muted">{subtitle}</span>}
      </span>
    </span>
  );
}
