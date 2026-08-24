import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CheckCircle2, Loader2, MessageCircle, Smartphone, Upload } from "lucide-react";
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

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PaymentStep({ submissionId, clientName = "" }: { submissionId: string; clientName?: string }) {
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
  const [whatsapp, setWhatsapp] = useState("");
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
        setAmount(String((chans as PaymentChannelSettings).serviceFee));
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, [loadPackages, loadChannels]);

  const waLink = whatsappProofLink(channels, {
    name: payerName || clientName,
    submissionId,
    amount,
    method,
    transactionId: reference,
  });

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
          whatsapp,
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
        <div className="flex items-center gap-2 font-semibold text-brand-dark">
          <CheckCircle2 className="size-5" aria-hidden /> Payment proof received
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Status: <strong>Proof Submitted</strong>. Our team will verify your payment, then your plan is prepared
          and released.
        </p>
        <Urdu className="mt-1 block text-sm text-muted-foreground">
          آپ کی ادائیگی کی تصدیق کے بعد ہماری ٹیم آپ سے رابطہ کرے گی اور آپ کا پلان تیار کیا جائے گا۔
        </Urdu>
        {waLink && (
          <Button asChild variant="outline" className="mt-4">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Send payment proof on WhatsApp
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 text-left">
      {/* Payment information */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-brand-dark">Payment Information</h2>
        <Urdu className="mt-1 block text-sm text-muted-foreground">ادائیگی کی معلومات</Urdu>
        <div className="mt-3 rounded-xl bg-brand-soft/50 p-3">
          <p className="text-sm font-semibold text-brand-dark">
            Initial service fee: {channels.currency} {channels.serviceFee.toLocaleString("en-PK")}
          </p>
          <Urdu className="block text-sm text-muted-foreground">
            ابتدائی سروس فیس: {channels.currency} {channels.serviceFee.toLocaleString("en-PK")}
          </Urdu>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Building2 className="size-4 text-brand" aria-hidden /> {channels.bankName}
            </div>
            <div className="mt-2">
              <DetailRow label="Account title" value={channels.bankAccountTitle} />
              <DetailRow label="Account no." value={channels.bankAccountNumber} />
              <DetailRow label="IBAN" value={channels.bankIban} />
            </div>
            {!channels.bankAccountNumber && !channels.bankIban && (
              <p className="mt-2 text-xs text-muted-foreground">
                Bank details will be shared on WhatsApp. / بینک تفصیلات واٹس ایپ پر بھیجی جائیں گی۔
              </p>
            )}
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Smartphone className="size-4 text-brand" aria-hidden /> Easypaisa / JazzCash
            </div>
            <div className="mt-2">
              <DetailRow label="Easypaisa" value={channels.easypaisaNumber} />
              <DetailRow label="Title" value={channels.easypaisaNumber ? channels.easypaisaTitle : ""} />
              <DetailRow label="JazzCash" value={channels.jazzcashNumber} />
              <DetailRow label="Title" value={channels.jazzcashNumber ? channels.jazzcashTitle : ""} />
            </div>
            {!channels.easypaisaNumber && !channels.jazzcashNumber && (
              <p className="mt-2 text-xs text-muted-foreground">
                Mobile wallet numbers will be shared on WhatsApp. / موبائل والیٹ نمبر واٹس ایپ پر بھیجے جائیں گے۔
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{channels.noteEn}</p>
        <Urdu className="mt-1 block text-sm text-muted-foreground">{channels.noteUr}</Urdu>

        {waLink && (
          <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Send Payment Proof on WhatsApp
            </a>
          </Button>
        )}
      </section>

      {/* Proof form */}
      <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-brand-dark">Payment Proof</h2>
        <Urdu className="mt-1 block text-sm text-muted-foreground">ادائیگی کا ثبوت</Urdu>
        <p className="mt-2 text-sm text-muted-foreground">
          Please upload your payment screenshot after completing payment.
        </p>
        <Urdu className="block text-sm text-muted-foreground">
          ادائیگی مکمل کرنے کے بعد اپنی payment screenshot یہاں upload کریں۔
        </Urdu>

        <p className="mt-4 text-sm font-semibold">
          Choose your plan package <span className="font-normal text-muted-foreground">/ پیکج منتخب کریں</span>
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
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
            <label htmlFor="wa" className="mb-1.5 block text-sm font-semibold">
              WhatsApp number / واٹس ایپ نمبر
            </label>
            <Input
              id="wa"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              maxLength={40}
              placeholder="03xx xxxxxxx"
            />
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

        {waLink && (
          <Button asChild variant="outline" className="mt-2 w-full">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> Send Payment Proof on WhatsApp
            </a>
          </Button>
        )}
      </form>
    </div>
  );
}
