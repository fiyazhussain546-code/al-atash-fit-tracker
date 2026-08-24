export type PaymentMethodKey = "meezan" | "easypaisa" | "jazzcash" | "whatsapp";

export interface PaymentChannelSettings {
  /** Initial service fee shown to clients, e.g. 500 */
  serviceFee: number;
  currency: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  easypaisaTitle: string;
  easypaisaNumber: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  /** International format without +, e.g. 923001234567 */
  whatsappNumber: string;
  noteEn: string;
  noteUr: string;
}

export const DEFAULT_PAYMENT_CHANNELS: PaymentChannelSettings = {
  serviceFee: 500,
  currency: "PKR",
  bankName: "Meezan Bank",
  bankAccountTitle: "AL-ATASH FIT",
  bankAccountNumber: "",
  bankIban: "",
  easypaisaTitle: "AL-ATASH FIT",
  easypaisaNumber: "",
  jazzcashTitle: "AL-ATASH FIT",
  jazzcashNumber: "",
  whatsappNumber: "",
  noteEn: "Please upload your payment screenshot after completing payment. Our team verifies payments within 24 hours.",
  noteUr: "ادائیگی مکمل کرنے کے بعد اپنی payment screenshot یہاں upload کریں۔ ہماری ٹیم 24 گھنٹوں میں تصدیق کرے گی۔",
};

export const PAYMENT_METHODS: { key: PaymentMethodKey; en: string; ur: string }[] = [
  { key: "meezan", en: "Meezan Bank transfer", ur: "میزان بینک ٹرانسفر" },
  { key: "easypaisa", en: "Easypaisa", ur: "ایزی پیسہ" },
  { key: "jazzcash", en: "JazzCash", ur: "جاز کیش" },
  { key: "whatsapp", en: "Other / sent on WhatsApp", ur: "دیگر / واٹس ایپ پر بھیجا" },
];

export function methodLabel(key: string) {
  return PAYMENT_METHODS.find((m) => m.key === key)?.en ?? (key || "—");
}

export function whatsappProofLink(
  channels: PaymentChannelSettings,
  info: { name: string; submissionId: string; amount: string; method: string; transactionId: string },
) {
  const digits = channels.whatsappNumber.replace(/\D/g, "");
  const lines = [
    "AL-ATASH FIT — Payment Proof / ادائیگی کا ثبوت",
    `Name: ${info.name || "-"}`,
    `Assessment ID: ${info.submissionId}`,
    `Amount: ${channels.currency} ${info.amount || channels.serviceFee}`,
    `Payment method: ${methodLabel(info.method)}`,
    `Transaction ID: ${info.transactionId || "-"}`,
    "",
    "I am attaching my payment screenshot. Please verify.",
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return digits ? `https://wa.me/${digits}?text=${text}` : "";
}
