import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_PACKAGE_SETTINGS, type PackageSettings } from "@/lib/packages";

const KEY = "packages";

export async function getPackageSettings(): Promise<PackageSettings> {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const value = data?.value as Partial<PackageSettings> | undefined;
  if (!value || !Array.isArray(value.packages) || value.packages.length === 0) {
    return DEFAULT_PACKAGE_SETTINGS;
  }
  return {
    currency: value.currency ?? DEFAULT_PACKAGE_SETTINGS.currency,
    paymentInstructions: value.paymentInstructions ?? DEFAULT_PACKAGE_SETTINGS.paymentInstructions,
    packages: value.packages,
  };
}

export async function savePackageSettings(settings: PackageSettings) {
  const { error } = await supabaseAdmin.from("app_settings").upsert(
    {
      key: KEY,
      value: settings as unknown as import("@/integrations/supabase/types").Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}
const CHANNELS_KEY = "payment_channels";

export async function getPaymentChannels(): Promise<
  import("@/lib/payment-channels").PaymentChannelSettings
> {
  const { DEFAULT_PAYMENT_CHANNELS } = await import("@/lib/payment-channels");
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", CHANNELS_KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const value = (data?.value ?? {}) as Partial<import("@/lib/payment-channels").PaymentChannelSettings>;
  return { ...DEFAULT_PAYMENT_CHANNELS, ...value };
}

export async function savePaymentChannels(
  channels: import("@/lib/payment-channels").PaymentChannelSettings,
) {
  const { error } = await supabaseAdmin.from("app_settings").upsert(
    {
      key: CHANNELS_KEY,
      value: channels as unknown as import("@/integrations/supabase/types").Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}
