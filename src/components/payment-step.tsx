import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Check, CheckCircle2, Copy, Loader2, MessageCircle, Smartphone, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Urdu } from "@/components/brand";
import { cn } from "@/lib/utils";
import { getPaymentInfo, getPublicPackages, submitPaymentProof } from "@/lib/payment.functions";
import { DEFAULT_PACKAGE_SETTINGS, formatPrice, type PackageSettings } from "@/lib/packages";
import {
  DEFAULT_PAYMENT_CHANNELS,
  PAYMENT_METHODS,
  whatsappProofLink,
  type PaymentChannelSettings,
} from "@/lib/payment-channels";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground break-all">{value}</span>
        <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={copy}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span className="text-xs">{copied ? "Copied ✓ / کاپی ہو گیا ✓" : "Copy"}</span>
        </Button>
      </span>
    </div>
  );
}

function TextRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PaymentStep({
  submissionId,
  clientName = "",
  clientPhone = "",
}: {
  submissionId: string;
  clientName?: string;
  clientPhone?: string;
}) {
  const loadPackages = useServerFn(getPublicPackages);
  const loadChannels = useServerFn(getPaymentInfo);
  const submitProof = useServerFn(submitPaymentProof);
  const [settings, setSettings] = useState<PackageSettings>(DEFAULT_PACKAGE_SETTINGS);
  const [channels, setChannels] = useState<PaymentChannelSettings>(DEFAULT_PAYMENT_CHANNELS);
  const [selected, setSelected] = useState("");
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payerName, setPayerName] = useState(clientName);
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
        const [pkgs, chans] = await Promise.all([loadPackages({}), loadChannels({})]);
        if (!active) return;
        setSettings(pkgs as PackageSettings);
        setChannels(chans as PaymentChannelSettings);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, [loadPackages, loadChannels]);

  const selectedPkg = settings.packages.find((p) => p.key === selected);

  useEffect(() => {
    if (selectedPkg) setAmount(String(selectedPkg.price));
  }, [selectedPkg]);

  const waDigits = (channels.whatsappNumber || DEFAULT_PAYMENT_CHANNELS.whatsappNumber).replace(/\D/g, "");
  const helpMessage = encodeURIComponent(
    [
      "Assalam-o-Alaikum,",
      `I have completed my AL-ATASH FIT assessment and selected the ${selectedPkg?.name ?? "-"} plan.`,
      `Submission ID: ${submissionId}`,
      "I need help regarding payment.",
      "Please guide me.",
    ].join("\n"),
  );
  const waHelpLink = waDigits ? `https://wa.me/${waDigits}?text=${helpMessage}` : "";

  const waProofLink = whatsappProofLink(
    { ...channels, whatsappNumber: waDigits },
    {
      name: payerName || clientName,
      submissionId,
      amount,
      method,
      transactionId: reference,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Please choose a package.");
    if (!method) return setError("Please choose the payment method you used.");
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
        data: {
          submissionId,
          packageKey: selected,
          reference,
          note,
          method,
          amount,
          paymentDate: payDate,
          clientName: payerName,
          whatsapp: clientPhone,
          ...(payload ? { file: payload } : {}),
        },
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
        <div className="flex items-center gap-2 font-display text-lg font-extrabold text-brand-dark">
          <CheckCircle2 className="size-5" aria-hidden /> Payment Proof Submitted Successfully
        </div>
        <Urdu className="mt-1 block font-semibold text-brand-dark">ادائیگی کا ثبوت کامیابی سے جمع ہو گیا ہے</Urdu>
        <p className="mt-3 text-sm text-muted-foreground">
          Your payment proof has been submitted for verification.
        </p>
        <Urdu className="block text-sm text-muted-foreground">
          آپ کی ادائیگی کا ثبوت تصدیق کے لیے جمع کر دیا گیا ہے۔
        </Urdu>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will verify your payment and update your plan status.
        </p>
        {waProofLink && (
          <Button asChild variant="outline" className="mt-4">
            <a href={waProofLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Contact on WhatsApp / واٹس ایپ پر رابطہ کریں
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 text-left">
      {/* Package selection */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-brand-dark">Choose your plan package</h2>
        <Urdu className="mt-1 block text-sm text-muted-foreground">اپنا پیکج منتخب کریں</Urdu>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

        {/* Payment details appear directly under the selected package */}
        {selectedPkg && (
          <div className="mt-5 rounded-2xl border border-brand/30 bg-brand-soft/30 p-4 sm:p-5">
            <h3 className="font-display text-base font-extrabold text-brand-dark">
              Payment Details <span className="font-normal">/</span> <Urdu>ادائیگی کی تفصیلات</Urdu>
            </h3>
            <p className="mt-1 text-sm font-semibold text-brand-dark">
              {selectedPkg.name} — {formatPrice(selectedPkg, settings.currency)} · {selectedPkg.durationLabel}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Smartphone className="size-4 text-brand" aria-hidden /> Easypaisa
                </div>
                <div className="mt-2">
                  <TextRow label="Account title" value={channels.easypaisaTitle} />
                  <CopyRow label="Account number" value={channels.easypaisaNumber} />
                  <CopyRow label="IBAN" value={channels.easypaisaIban ?? ""} />
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Building2 className="size-4 text-brand" aria-hidden /> {channels.bankName}
                </div>
                <div className="mt-2">
                  <TextRow label="Account title" value={channels.bankAccountTitle} />
                  <CopyRow label="Account number" value={channels.bankAccountNumber} />
                  <CopyRow label="IBAN" value={channels.bankIban} />
                </div>
              </div>
            </div>

            {waHelpLink && (
              <Button asChild className="mt-4 w-full sm:w-auto">
                <a href={waHelpLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" /> Contact on WhatsApp / واٹس ایپ پر رابطہ کریں
                </a>
              </Button>
            )}

            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>Please complete payment using the selected payment method, then upload your payment screenshot below.</p>
              <Urdu className="block">
                ادائیگی منتخب کردہ طریقے سے مکمل کریں، پھر نیچے ادائیگی کا اسکرین شاٹ اپلوڈ کریں۔
              </Urdu>
              <p className="pt-1">If you need help, contact us on WhatsApp.</p>
              <Urdu className="block">اگر ادائیگی کے بارے میں کوئی مدد چاہیے تو واٹس ایپ پر رابطہ کریں۔</Urdu>
            </div>
          </div>
        )}
      </section>

      {/* Proof form */}
      <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-brand-dark">Payment Proof</h2>
        <Urdu className="mt-1 block text-sm text-muted-foreground">ادائیگی کا ثبوت</Urdu>

        <p className="mt-4 text-sm font-semibold">
          Payment method <span className="font-normal text-muted-foreground">/ ادائیگی کا طریقہ</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              type="button"
              key={m.key}
              onClick={() => setMethod(m.key)}
              aria-pressed={method === m.key}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                method === m.key ? "border-brand bg-brand text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {m.en} <span className="opacity-80">/ {m.ur}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="payername" className="mb-1.5 block text-sm font-semibold">
              Client name / نام
            </label>
            <Input id="payername" value={payerName} onChange={(e) => setPayerName(e.target.value)} maxLength={120} />
          </div>
          <div>
            <label htmlFor="amt" className="mb-1.5 block text-sm font-semibold">
              Amount paid / ادا شدہ رقم
            </label>
            <Input id="amt" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} maxLength={30} />
          </div>
          <div>
            <label htmlFor="pdate" className="mb-1.5 block text-sm font-semibold">
              Payment date / ادائیگی کی تاریخ
            </label>
            <Input id="pdate" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="ref" className="mb-1.5 block text-sm font-semibold">
              Transaction ID / reference — ٹرانزیکشن نمبر
            </label>
            <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />
          </div>
          <div>
            <label htmlFor="sid" className="mb-1.5 block text-sm font-semibold">
              Assessment Submission ID
            </label>
            <Input id="sid" value={submissionId} readOnly className="font-mono" />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="proof" className="mb-1.5 block text-sm font-semibold">
            Payment screenshot (PNG, JPG, WEBP or PDF, max 4 MB) / ادائیگی کی تصویر
          </label>
          <Input
            id="proof"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf,image/*"
            capture={undefined}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && <p className="mt-1 text-xs text-muted-foreground">Selected: {file.name}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="pnote" className="mb-1.5 block text-sm font-semibold">
            Note for our team (optional) / نوٹ
          </label>
          <Textarea id="pnote" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
        </div>

        {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="mt-4 w-full" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Submit payment proof
        </Button>

        {waProofLink && (
          <Button asChild variant="outline" className="mt-2 w-full">
            <a href={waProofLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Send Payment Proof on WhatsApp
            </a>
          </Button>
        )}
      </form>
    </div>
  );
}
