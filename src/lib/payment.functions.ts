import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublicPackages = createServerFn({ method: "POST" }).handler(async () => {
  const { getPackageSettings } = await import("@/lib/settings.server");
  const { DEFAULT_PACKAGE_SETTINGS } = await import("@/lib/packages");
  try {
    const settings = await getPackageSettings();
    return { ...settings, packages: settings.packages.filter((p) => p.active) };
  } catch {
    return DEFAULT_PACKAGE_SETTINGS;
  }
});

export const getPaymentInfo = createServerFn({ method: "POST" }).handler(async () => {
  const { getPaymentChannels } = await import("@/lib/settings.server");
  const { DEFAULT_PAYMENT_CHANNELS } = await import("@/lib/payment-channels");
  try {
    return await getPaymentChannels();
  } catch {
    return DEFAULT_PAYMENT_CHANNELS;
  }
});

const proofSchema = z.object({
  submissionId: z.string().min(6).max(64),
  packageKey: z.string().min(1).max(40),
  reference: z.string().max(120).default(""),
  note: z.string().max(600).default(""),
  method: z.string().max(40).default(""),
  amount: z.string().max(30).default(""),
  paymentDate: z.string().max(30).default(""),
  clientName: z.string().max(120).default(""),
  whatsapp: z.string().max(40).default(""),
  file: z
    .object({ base64: z.string().min(1).max(7_000_000), contentType: z.string().min(3).max(80) })
    .optional(),
});

export const submitPaymentProof = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => proofSchema.parse(input))
  .handler(async ({ data }) => {
    const { attachPaymentProof } = await import("@/lib/payments.server");
    try {
      return await attachPaymentProof(data);
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save payment proof." };
    }
  });