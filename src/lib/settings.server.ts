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