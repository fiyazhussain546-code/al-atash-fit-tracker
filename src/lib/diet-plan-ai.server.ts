import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { emptyDietPlan, type DietPlan } from "@/lib/diet-plans";
import { listDietPlans } from "@/lib/diet-plans.server";

/** Editable plan-content fields the AI may produce. */
export interface AiDraftFields {
  planTitle: string;
  durationLabel: string;
  breakfast: string;
  midMorning: string;
  lunch: string;
  eveningSnack: string;
  dinner: string;
  waterGuidance: string;
  activityGuidance: string;
  foodsPrefer: string;
  foodsLimit: string;
  notes: string;
}

const FIELD_KEYS: (keyof AiDraftFields)[] = [
  "planTitle",
  "durationLabel",
  "breakfast",
  "midMorning",
  "lunch",
  "eveningSnack",
  "dinner",
  "waterGuidance",
  "activityGuidance",
  "foodsPrefer",
  "foodsLimit",
  "notes",
];

const strSchema = { type: "string" } as const;

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [...FIELD_KEYS, "reviewRequired", "reviewFlags"],
  properties: {
    planTitle: strSchema,
    durationLabel: strSchema,
    breakfast: strSchema,
    midMorning: strSchema,
    lunch: strSchema,
    eveningSnack: strSchema,
    dinner: strSchema,
    waterGuidance: strSchema,
    activityGuidance: strSchema,
    foodsPrefer: strSchema,
    foodsLimit: strSchema,
    notes: strSchema,
    reviewRequired: { type: "boolean" },
    reviewFlags: strSchema,
  },
} as const;

const SYSTEM = `You are a Pakistani clinical nutrition assistant drafting a FIRST DRAFT diet plan for AL-ATASH FIT.
Rules:
- You are NOT a doctor. Never diagnose a condition, never prescribe or mention medicines or supplements as treatment.
- Use ONLY the assessment facts provided. Never invent measurements, conditions or preferences that are not given.
- Food suggestions must be everyday Pakistani foods (roti, daal, sabzi, chicken/beef curry, dahi, lassi without sugar, anda, chana, fruit in season) with simple portion guidance.
- Write clear professional English. Short lines separated by newlines, no markdown symbols.
- Set reviewRequired = true and explain in reviewFlags whenever the assessment mentions pregnancy or breastfeeding, diabetes, kidney/liver/heart/thyroid disease, high blood pressure, an eating disorder, severe obesity or very rapid weight-loss goals, a child under 12, significant allergies, or anything else needing professional judgement. Otherwise reviewRequired = false and reviewFlags = "".
- Every plan is reviewed and edited by a human consultant before release; this is a draft only.`;

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

async function loadSubmission(recordId: string) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("id, submission_id, form_type, name, phone, city, age, bmi, payload, package_key, payment_status")
    .eq("id", recordId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Submission not found.");
  return data;
}

function assessmentBlock(sub: Awaited<ReturnType<typeof loadSubmission>>): string {
  const payload = (sub.payload ?? {}) as Record<string, unknown>;
  const lines: string[] = [
    `Patient name: ${sub.name}`,
    `Assessment type: ${sub.form_type}`,
    `City: ${sub.city}`,
    `Age: ${sub.age}`,
    `BMI: ${sub.bmi}`,
  ].filter((l) => !l.endsWith(": "));
  for (const [k, v] of Object.entries(payload)) {
    const value = fmt(v);
    if (!value) continue;
    lines.push(`${k.replace(/_/g, " ")}: ${value}`);
  }
  return lines.join("\n");
}

/**
 * Calls the Lovable AI Gateway (Responses API, streamed) and returns the parsed draft.
 * Requires the LOVABLE_API_KEY secret, which Lovable Cloud provisions automatically.
 */
async function callGateway(input: string): Promise<AiDraftFields & { reviewRequired: boolean; reviewFlags: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project (missing AI key).");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      stream: true,
      instructions: SYSTEM,
      input,
      text: { format: { type: "json_schema", name: "diet_plan_draft", strict: true, schema: outputSchema } },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI is busy right now (rate limit). Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to continue generating drafts.");
    if (res.status === 403) throw new Error("AI access is blocked for this workspace.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const evt = JSON.parse(raw) as { type?: string; delta?: string };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
      } catch {
        /* ignore keep-alive / partial frames */
      }
    }
  }

  if (!text.trim()) throw new Error("The AI returned an empty draft. Please try again.");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("The AI returned an unreadable draft. Please try again.");
  }

  const out = {} as AiDraftFields & { reviewRequired: boolean; reviewFlags: string };
  for (const key of FIELD_KEYS) out[key] = fmt(parsed[key]).slice(0, 2000);
  out.reviewRequired = Boolean(parsed["reviewRequired"]);
  out.reviewFlags = fmt(parsed["reviewFlags"]).slice(0, 2000);
  return out;
}

/**
 * Generates (or improves) an AI first draft for a submission and persists it.
 * Never approves or releases: status only moves up to "Draft".
 */
export async function generateAiDraft(
  recordId: string,
  mode: "generate" | "improve",
  current: Partial<AiDraftFields> | undefined,
): Promise<DietPlan> {
  const sub = await loadSubmission(recordId);
  if ((sub.payment_status ?? "Pending") !== "Verified") {
    throw new Error("Payment must be verified before an AI draft can be generated.");
  }

  const plans = await listDietPlans();
  const existing = plans.find((p) => p.submissionRecordId === recordId) ?? emptyDietPlan(recordId);
  if (existing.status === "Released") throw new Error("This plan is already released and cannot be regenerated.");

  const currentBlock =
    mode === "improve" && current
      ? `\n\nCURRENT DRAFT (written/edited by the consultant — preserve their wording and intent wherever it is sound; improve clarity, structure, portion detail and completeness only):\n${FIELD_KEYS.map(
          (k) => `${k}: ${fmt(current[k])}`,
        ).join("\n")}`
      : "";

  const task =
    mode === "improve"
      ? "Improve the current draft below while preserving the consultant's manual edits where possible."
      : "Write a complete first draft diet plan for this patient.";

  const draft = await callGateway(
    `${task}\n\nPATIENT ASSESSMENT:\n${assessmentBlock(sub)}${currentBlock}\n\nReturn JSON matching the required schema.`,
  );

  const now = new Date().toISOString();
  const nextStatus = existing.status && existing.status !== "Not Started" ? existing.status : "Draft";

  const { data, error } = await supabaseAdmin
    .from("diet_plans")
    .upsert(
      {
        submission_id: recordId,
        status: nextStatus,
        patient_name: existing.patientName || sub.name || "",
        plan_title: draft.planTitle,
        duration_label: draft.durationLabel,
        breakfast: draft.breakfast,
        mid_morning: draft.midMorning,
        lunch: draft.lunch,
        evening_snack: draft.eveningSnack,
        dinner: draft.dinner,
        water_guidance: draft.waterGuidance,
        activity_guidance: draft.activityGuidance,
        foods_prefer: draft.foodsPrefer,
        foods_limit: draft.foodsLimit,
        notes: draft.notes,
        ai_draft: { ...draft } as unknown as Record<string, string | boolean>,
        ai_generated_at: now,
        ai_generation_count: (existing.aiGenerationCount ?? 0) + 1,
        ai_review_required: draft.reviewRequired,
        ai_review_flags: draft.reviewFlags,
      },
      { onConflict: "submission_id" },
    )
    .select("submission_id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Could not save the AI draft.");

  const refreshed = (await listDietPlans()).find((p) => p.submissionRecordId === recordId);
  return refreshed ?? emptyDietPlan(recordId);
}
