import { cn } from "@/lib/utils";
import { Urdu } from "@/components/brand";

export function Field({
  label,
  ur,
  required,
  error,
  children,
  className,
}: {
  label: string;
  ur?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {ur && <Urdu className="block text-xs text-muted-foreground">{ur}</Urdu>}
      <span className="mt-1 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

const control =
  "w-full min-h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(control, "min-h-20", props.className)} />;
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={cn(control, props.className)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

const tone: Record<string, string> = {
  New: "bg-accent text-accent-foreground",
  Assessment: "bg-accent text-accent-foreground",
  "Options Given": "bg-brand/10 text-brand-dark",
  Appointment: "bg-brand/15 text-brand-dark",
  "Consultation Done": "bg-brand/20 text-brand-dark",
  "Treatment Planned": "bg-brand/25 text-brand-dark",
  Completed: "bg-brand text-primary-foreground",
  "Follow-up": "bg-gold/20 text-foreground",
  Urgent: "bg-destructive/10 text-destructive",
  High: "bg-gold/25 text-foreground",
  Medium: "bg-accent text-accent-foreground",
  Normal: "bg-secondary text-muted-foreground",
  Paid: "bg-brand/15 text-brand-dark",
  Pending: "bg-secondary text-muted-foreground",
  "Partially Paid": "bg-gold/25 text-foreground",
  Refunded: "bg-accent text-accent-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
  Confirmed: "bg-brand/15 text-brand-dark",
  Requested: "bg-secondary text-muted-foreground",
  Rescheduled: "bg-gold/25 text-foreground",
};

export function Pill({ value, className }: { value: string; className?: string }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        tone[value] ?? "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {value}
    </span>
  );
}

export function EmptyState({ en, ur }: { en: string; ur: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">{en}</p>
      <Urdu className="mt-1 block text-sm text-muted-foreground">{ur}</Urdu>
    </div>
  );
}

export function Modal({
  title,
  ur,
  onClose,
  children,
  wide,
}: {
  title: string;
  ur?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border bg-background p-5 shadow-2xl sm:rounded-3xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-xl",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold text-brand-dark">{title}</h2>
            {ur && <Urdu className="block text-sm text-muted-foreground">{ur}</Urdu>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-full border px-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
