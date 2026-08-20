import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Urdu } from "@/components/brand";
import { cn } from "@/lib/utils";
import { getPublicPackages, submitPaymentProof } from "@/lib/payment.functions";
import { DEFAULT_PACKAGE_SETTINGS, formatPrice, type PackageSettings } from "@/lib/packages";

export function PaymentStep({ submissionId }: { submissionId: string }) {
  const loadPackages = useServerFn(getPublicPackages);
  const submitProof = useServerFn(submitPaymentProof);
  const [settings, setSettings] = useState<PackageSettings>(DEFAULT_PACKAGE_SETTINGS);
  const [selected, setSelected] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await loadPackages({});
        if (active) setSettings(res as PackageSettings);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, [loadPackages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Please choose a package.");
    if (!file && !reference.trim()) {
      return setError("Upload a payment screenshot or enter a transaction reference.");
    }
    setBusy(true);
    try {
      let payload: { base64: string; contentType: string } | undefined;
      if (file) {
        if (file.size > 4 * 1024 * 1024) throw new Error("File is too large. Maximum size is 4 MB.");
        const buf = new Uint8Array(await file.arrayBuffer());
        let bin = "";
        for (const b of buf) bin += String.fromCharCode(b);
        payload = { base64: btoa(bin), contentType: file.type || "image/jpeg" };
      }
      const res = await submitProof({
        data: { submissionId, packageKey: selected, reference, note, ...(payload ? { file: payload } : {}) },
      });
      if (res.ok) setDone(true);
      else setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment proof.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-soft/40 p-6 text-left">
        <div className="flex items-center gap-2 font-semibold text-brand-dark">
          <CheckCircle2 className="size-5" aria-hidden /> Payment proof received
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Status: <strong>Proof Submitted</strong>. Our team will verify your payment and contact you.
        </p>
        <Urdu className="mt-1 block text-sm text-muted-foreground">
          آپ کی ادائیگی کی تصدیق کے بعد ہماری ٹیم آپ سے رابطہ کرے گی۔
        </Urdu>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border bg-card p-5 text-left sm:p-6">
      <h2 className="font-display text-lg font-extrabold text-brand-dark">Choose your diet plan package</h2>
      <Urdu className="mt-1 block text-sm text-muted-foreground">اپنا ڈائٹ پلان پیکج منتخب کریں</Urdu>
      <p className="mt-2 text-xs text-muted-foreground">Optional — you can also complete payment later.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {settings.packages.map((p) => (
          <button
            type="button"
            key={p.key}
            onClick={() => setSelected(p.key)}
            aria-pressed={selected === p.key}
            className={cn(
              "rounded-2xl border p-4 text-left transition-colors",
              selected === p.key ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30" : "hover:bg-secondary",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{p.name}</span>
              <Urdu className="text-xs text-muted-foreground">{p.nameUr}</Urdu>
            </div>
            <div className="mt-1 text-lg font-extrabold text-brand-dark">{formatPrice(p, settings.currency)}</div>
            <div className="text-sm text-muted-foreground">{p.durationLabel}</div>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
        {settings.paymentInstructions}
      </p>

      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="proof" className="mb-1.5 block text-sm font-semibold">
            Payment screenshot (PNG, JPG, WEBP or PDF, max 4 MB)
          </label>
          <Input
            id="proof"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <label htmlFor="ref" className="mb-1.5 block text-sm font-semibold">
            Transaction / reference number (optional)
          </label>
          <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />
        </div>
        <div>
          <label htmlFor="pnote" className="mb-1.5 block text-sm font-semibold">
            Note for our team (optional)
          </label>
          <Textarea id="pnote" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" className="mt-4 w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Submit payment proof
      </Button>
    </form>
  );
}