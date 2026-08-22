import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { emptyDietPlan, type DietPlan, type DietPlanStatus } from "@/lib/diet-plans";

const COLUMNS =
  "submission_id, status, patient_name, plan_title, duration_label, breakfast, mid_morning, lunch, evening_snack, dinner, water_guidance, activity_guidance, foods_prefer, foods_limit, notes, consultant_name, consultant_note, released_at, updated_at, ai_draft, ai_generated_at, ai_generation_count, ai_review_required, ai_review_flags";

type Row = {
  submission_id: string;
  status: string;
  patient_name: string;
  plan_title: string;
  duration_label: string;
  breakfast: string;
  mid_morning: string;
  lunch: string;
  evening_snack: string;
  dinner: string;
  water_guidance: string;
  activity_guidance: string;
  foods_prefer: string;
  foods_limit: string;
  notes: string;
  consultant_name: string;
  consultant_note: string;
  released_at: string | null;
  updated_at: string;
  ai_draft?: Record<string, string> | null;
  ai_generated_at?: string | null;
  ai_generation_count?: number | null;
  ai_review_required?: boolean | null;
  ai_review_flags?: string | null;
};

function toPlan(r: Row): DietPlan {
  return {
    submissionRecordId: r.submission_id,
    status: (r.status || "Not Started") as DietPlanStatus,
    patientName: r.patient_name ?? "",
    planTitle: r.plan_title ?? "",
    durationLabel: r.duration_label ?? "",
    breakfast: r.breakfast ?? "",
    midMorning: r.mid_morning ?? "",
    lunch: r.lunch ?? "",
    eveningSnack: r.evening_snack ?? "",
    dinner: r.dinner ?? "",
    waterGuidance: r.water_guidance ?? "",
    activityGuidance: r.activity_guidance ?? "",
    foodsPrefer: r.foods_prefer ?? "",
    foodsLimit: r.foods_limit ?? "",
    notes: r.notes ?? "",
    consultantName: r.consultant_name ?? "",
    consultantNote: r.consultant_note ?? "",
    releasedAt: r.released_at ?? "",
    updatedAt: r.updated_at ?? "",
    aiGeneratedAt: r.ai_generated_at ?? "",
    aiGenerationCount: r.ai_generation_count ?? 0,
    aiReviewRequired: r.ai_review_required ?? false,
    aiReviewFlags: r.ai_review_flags ?? "",
  };
}

export async function listDietPlans(): Promise<DietPlan[]> {
  const { data, error } = await supabaseAdmin.from("diet_plans").select(COLUMNS).limit(2000);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toPlan);
}

export async function saveDietPlan(plan: DietPlan): Promise<DietPlan> {
  // Releasing requires a verified payment — enforced server-side.
  if (plan.status === "Released") {
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("submissions")
      .select("payment_status")
      .eq("id", plan.submissionRecordId)
      .maybeSingle();
    if (subErr) throw new Error(subErr.message);
    if (!sub) throw new Error("Submission not found.");
    if (sub.payment_status !== "Verified") {
      throw new Error("Payment must be verified before a plan can be released.");
    }
    const { data: existing } = await supabaseAdmin
      .from("diet_plans")
      .select("status")
      .eq("submission_id", plan.submissionRecordId)
      .maybeSingle();
    const approvedNow = existing?.status === "Consultant Approved" || existing?.status === "Released";
    if (!approvedNow) {
      throw new Error("Plan must be marked Consultant Approved before release.");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("diet_plans")
    .upsert(
      {
        submission_id: plan.submissionRecordId,
        status: plan.status,
        patient_name: plan.patientName,
        plan_title: plan.planTitle,
        duration_label: plan.durationLabel,
        breakfast: plan.breakfast,
        mid_morning: plan.midMorning,
        lunch: plan.lunch,
        evening_snack: plan.eveningSnack,
        dinner: plan.dinner,
        water_guidance: plan.waterGuidance,
        activity_guidance: plan.activityGuidance,
        foods_prefer: plan.foodsPrefer,
        foods_limit: plan.foodsLimit,
        notes: plan.notes,
        consultant_name: plan.consultantName,
        consultant_note: plan.consultantNote,
        released_at: plan.status === "Released" ? new Date().toISOString() : null,
      },
      { onConflict: "submission_id" },
    )
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toPlan(data as Row) : emptyDietPlan(plan.submissionRecordId);
}
