import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface StoredSubmission {
  recordId: string;
  submissionId: string;
  type: string;
  submittedAt: string;
  name: string;
  phone: string;
  city: string;
  age: string;
  bmi: string;
  packageKey: string;
  paymentStatus: string;
  paymentReference: string;
  paymentNote: string;
  paymentProofPath: string;
  paymentSubmittedAt: string;
  paymentReviewedAt: string;
  paymentReviewNote: string;
  data: Record<string, string | string[] | boolean>;
}

export interface NewSubmission {
  submissionId: string;
  formType: "child" | "female" | "male";
  submittedAt: string;
  name: string;
  phone: string;
  city: string;
  age: string;
  bmi: string;
  consent: boolean;
  payload: Record<string, string | string[] | boolean>;
}

export async function insertSubmission(input: NewSubmission) {
  const { error } = await supabaseAdmin.from("submissions").insert({
    submission_id: input.submissionId,
    form_type: input.formType,
    submitted_at: input.submittedAt,
    name: input.name,
    phone: input.phone,
    city: input.city,
    age: input.age,
    bmi: input.bmi,
    consent: input.consent,
    payload: input.payload,
  });
  if (error) throw new Error(error.message);
}

const TITLE: Record<string, string> = { child: "Child", female: "Female", male: "Male" };

export async function listSubmissions(): Promise<StoredSubmission[]> {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select(
      "id, submission_id, form_type, submitted_at, name, phone, city, age, bmi, payload, package_key, payment_status, payment_reference, payment_note, payment_proof_path, payment_submitted_at, payment_reviewed_at, payment_review_note",
    )
    .order("submitted_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    recordId: r.id,
    submissionId: r.submission_id,
    type: TITLE[r.form_type] ?? r.form_type,
    submittedAt: r.submitted_at,
    name: r.name ?? "",
    phone: r.phone ?? "",
    city: r.city ?? "",
    age: r.age ?? "",
    bmi: r.bmi ?? "",
    packageKey: r.package_key ?? "",
    paymentStatus: r.payment_status ?? "Pending",
    paymentReference: r.payment_reference ?? "",
    paymentNote: r.payment_note ?? "",
    paymentProofPath: r.payment_proof_path ?? "",
    paymentSubmittedAt: r.payment_submitted_at ?? "",
    paymentReviewedAt: r.payment_reviewed_at ?? "",
    paymentReviewNote: r.payment_review_note ?? "",
    data: (r.payload ?? {}) as Record<string, string | string[] | boolean>,
  }));
}
