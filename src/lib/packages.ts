export type PaymentStatus = "Pending" | "Proof Submitted" | "Verified" | "Rejected";

export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Proof Submitted", "Verified", "Rejected"];

export interface DietPackage {
  key: string;
  name: string;
  nameUr: string;
  price: number;
  priceMax: number | null;
  durationDays: number;
  durationLabel: string;
  active: boolean;
}

export interface PackageSettings {
  packages: DietPackage[];
  currency: string;
  paymentInstructions: string;
}

export const DEFAULT_PACKAGE_SETTINGS: PackageSettings = {
  currency: "Rs.",
  paymentInstructions:
    "Transfer the package amount to the AL-ATASH FIT account shared with you on WhatsApp, then upload the payment screenshot below. Our team verifies payments within 24 hours.",
  packages: [
    { key: "basic", name: "Basic", nameUr: "بیسک", price: 500, priceMax: null, durationDays: 7, durationLabel: "7-day plan", active: true },
    { key: "standard", name: "Standard", nameUr: "اسٹینڈرڈ", price: 1500, priceMax: null, durationDays: 15, durationLabel: "15-day plan", active: true },
    { key: "premium", name: "Premium", nameUr: "پریمیم", price: 2500, priceMax: 3000, durationDays: 30, durationLabel: "30-day plan", active: true },
    { key: "diamond", name: "Diamond", nameUr: "ڈائمنڈ", price: 5000, priceMax: null, durationDays: 90, durationLabel: "3-month plan", active: true },
  ],
};

export function formatPrice(pkg: DietPackage, currency: string) {
  const fmt = (n: number) => n.toLocaleString("en-PK");
  return pkg.priceMax && pkg.priceMax > pkg.price
    ? `${currency} ${fmt(pkg.price)}–${fmt(pkg.priceMax)}`
    : `${currency} ${fmt(pkg.price)}`;
}

export function packageLabel(settings: PackageSettings, key: string) {
  const pkg = settings.packages.find((p) => p.key === key);
  return pkg ? `${pkg.name} — ${formatPrice(pkg, settings.currency)} · ${pkg.durationLabel}` : "";
}