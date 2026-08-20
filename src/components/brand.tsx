import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden
        className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-primary-foreground shadow-md shadow-brand/25"
      >
        <span className="font-display text-xl font-extrabold leading-none">A</span>
        <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background bg-gold" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold tracking-tight text-brand-dark">
          AL-ATASH <span className="text-gold">FIT</span>
        </span>
        {!compact && (
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Weight Assessment Clinic
          </span>
        )}
      </span>
    </div>
  );
}

export function Urdu({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="rtl" lang="ur" className={cn("font-urdu leading-loose", className)}>
      {children}
    </span>
  );
}