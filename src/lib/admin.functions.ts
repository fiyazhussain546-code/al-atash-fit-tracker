import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passwordRule = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(200);

export const adminAuthStatus = createServerFn({ method: "POST" }).handler(async () => {
  const { isConfigured } = await import("@/lib/admin-auth.server");
  try {
    return { ok: true as const, configured: await isConfigured(), error: "" };
  } catch (err) {
    return {
      ok: false as const,
      configured: false,
      error: err instanceof Error ? err.message : "Could not check admin setup.",
    };
  }
});

export const adminSetupPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: passwordRule }).parse(input))
  .handler(async ({ data }) => {
    const { setupPassword, issueToken } = await import("@/lib/admin-auth.server");
    const res = await setupPassword(data.password);
    if (!res.ok) return { ok: false as const, error: res.error, token: "" };
    return { ok: true as const, error: "", token: await issueToken() };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { isConfigured, checkPassword, issueToken } = await import("@/lib/admin-auth.server");
    if (!(await isConfigured())) {
      return { ok: false as const, error: "No admin password is set yet. Use first-time setup.", token: "" };
    }
    if (!(await checkPassword(data.password))) {
      return { ok: false as const, error: "Incorrect password.", token: "" };
    }
    return { ok: true as const, error: "", token: await issueToken() };
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1).max(500), current: z.string().min(1).max(200), next: passwordRule }).parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyToken, changePassword, issueToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) return { ok: false as const, error: "Session expired.", token: "" };
    const res = await changePassword(data.current, data.next);
    if (!res.ok) return { ok: false as const, error: res.error, token: "" };
    return { ok: true as const, error: "", token: await issueToken() };
  });

export const adminListSubmissions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) {
      return { ok: false as const, error: "Session expired. Please sign in again.", submissions: [] };
    }
    const { listSubmissions } = await import("@/lib/submissions.server");
    try {
      return { ok: true as const, error: "", submissions: await listSubmissions() };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not load submissions.",
        submissions: [],
      };
    }
  });

const tokenRule = z.string().min(1).max(500);

export const adminGetPackages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: tokenRule }).parse(input))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    const { DEFAULT_PACKAGE_SETTINGS } = await import("@/lib/packages");
    if (!(await verifyToken(data.token))) {
      return { ok: false as const, error: "Session expired.", settings: DEFAULT_PACKAGE_SETTINGS };
    }
    const { getPackageSettings } = await import("@/lib/settings.server");
    try {
      return { ok: true as const, error: "", settings: await getPackageSettings() };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not load packages.",
        settings: DEFAULT_PACKAGE_SETTINGS,
      };
    }
  });

const packageSchema = z.object({
  key: z.string().min(1).max(40),
  name: z.string().min(1).max(60),
  nameUr: z.string().max(60).default(""),
  price: z.number().min(0).max(10_000_000),
  priceMax: z.number().min(0).max(10_000_000).nullable(),
  durationDays: z.number().int().min(1).max(3650),
  durationLabel: z.string().min(1).max(60),
  active: z.boolean(),
});

export const adminSavePackages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: tokenRule,
        settings: z.object({
          currency: z.string().min(1).max(10),
          paymentInstructions: z.string().max(1000),
          packages: z.array(packageSchema).min(1).max(20),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) return { ok: false as const, error: "Session expired." };
    const { savePackageSettings } = await import("@/lib/settings.server");
    try {
      await savePackageSettings(data.settings);
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save packages." };
    }
  });

export const adminReviewPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: tokenRule,
        recordId: z.string().uuid(),
        decision: z.enum(["Verified", "Rejected"]),
        note: z.string().max(600).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) return { ok: false as const, error: "Session expired." };
    const { reviewPayment } = await import("@/lib/payments.server");
    try {
      await reviewPayment(data.recordId, data.decision, data.note);
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not update payment." };
    }
  });

export const adminProofUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: tokenRule, path: z.string().min(1).max(400) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) return { ok: false as const, error: "Session expired.", url: "" };
    const { signedProofUrl } = await import("@/lib/payments.server");
    try {
      return { ok: true as const, error: "", url: await signedProofUrl(data.path) };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not open proof.", url: "" };
    }
  });

export const adminListDietPlans = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: tokenRule }).parse(input))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    if (!(await verifyToken(data.token))) {
      return { ok: false as const, error: "Session expired.", plans: [] };
    }
    const { listDietPlans } = await import("@/lib/diet-plans.server");
    try {
      return { ok: true as const, error: "", plans: await listDietPlans() };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not load diet plans.",
        plans: [],
      };
    }
  });

const dietPlanSchema = z.object({
  submissionRecordId: z.string().uuid(),
  status: z.enum([
    "Not Started",
    "Draft",
    "Ready for Review",
    "Consultant Approved",
    "Released",
    "Rejected/Needs Changes",
  ]),
  patientName: z.string().max(120).default(""),
  planTitle: z.string().max(160).default(""),
  durationLabel: z.string().max(80).default(""),
  breakfast: z.string().max(2000).default(""),
  midMorning: z.string().max(2000).default(""),
  lunch: z.string().max(2000).default(""),
  eveningSnack: z.string().max(2000).default(""),
  dinner: z.string().max(2000).default(""),
  waterGuidance: z.string().max(1000).default(""),
  activityGuidance: z.string().max(1000).default(""),
  foodsPrefer: z.string().max(2000).default(""),
  foodsLimit: z.string().max(2000).default(""),
  notes: z.string().max(2000).default(""),
  consultantName: z.string().max(120).default(""),
  consultantNote: z.string().max(1000).default(""),
  releasedAt: z.string().max(60).default(""),
  updatedAt: z.string().max(60).default(""),
  aiGeneratedAt: z.string().max(60).default(""),
  aiGenerationCount: z.number().int().min(0).max(10000).default(0),
  aiReviewRequired: z.boolean().default(false),
  aiReviewFlags: z.string().max(2000).default(""),
});

export const adminSaveDietPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: tokenRule, plan: dietPlanSchema }).parse(input))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    const { emptyDietPlan } = await import("@/lib/diet-plans");
    if (!(await verifyToken(data.token))) {
      return { ok: false as const, error: "Session expired.", plan: emptyDietPlan(data.plan.submissionRecordId) };
    }
    const { saveDietPlan } = await import("@/lib/diet-plans.server");
    try {
      return { ok: true as const, error: "", plan: await saveDietPlan(data.plan) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not save diet plan.",
        plan: emptyDietPlan(data.plan.submissionRecordId),
      };
    }
  });


const aiFieldsSchema = z.object({
  planTitle: z.string().max(160).default(""),
  durationLabel: z.string().max(80).default(""),
  breakfast: z.string().max(2000).default(""),
  midMorning: z.string().max(2000).default(""),
  lunch: z.string().max(2000).default(""),
  eveningSnack: z.string().max(2000).default(""),
  dinner: z.string().max(2000).default(""),
  waterGuidance: z.string().max(1000).default(""),
  activityGuidance: z.string().max(1000).default(""),
  foodsPrefer: z.string().max(2000).default(""),
  foodsLimit: z.string().max(2000).default(""),
  notes: z.string().max(2000).default(""),
});

export const adminGenerateDietDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: tokenRule,
        recordId: z.string().uuid(),
        mode: z.enum(["generate", "improve"]),
        current: aiFieldsSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/admin-auth.server");
    const { emptyDietPlan } = await import("@/lib/diet-plans");
    if (!(await verifyToken(data.token))) {
      return { ok: false as const, error: "Session expired.", plan: emptyDietPlan(data.recordId) };
    }
    const { generateAiDraft } = await import("@/lib/diet-plan-ai.server");
    try {
      return { ok: true as const, error: "", plan: await generateAiDraft(data.recordId, data.mode, data.current) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not generate the AI draft.",
        plan: emptyDietPlan(data.recordId),
      };
    }
  });
