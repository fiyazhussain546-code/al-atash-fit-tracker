import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "payment-proofs";
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 4 * 1024 * 1024;

function decodeBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export interface ProofInput {
  submissionId: string;
  packageKey: string;
  reference: string;
  note: string;
  file?: { base64: string; contentType: string } | undefined;
}

export async function attachPaymentProof(input: ProofInput) {
  const { data: row, error: findErr } = await supabaseAdmin
    .from("submissions")
    .select("id, submission_id, payment_status")
    .eq("submission_id", input.submissionId)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);
  if (!row) return { ok: false as const, error: "Submission not found." };
  if (row.payment_status === "Verified") {
    return { ok: false as const, error: "This payment is already verified." };
  }

  let path = "";
  if (input.file) {
    if (!ALLOWED.includes(input.file.contentType)) {
      return { ok: false as const, error: "Upload a PNG, JPG, WEBP image or PDF." };
    }
    const bytes = decodeBase64(input.file.base64);
    if (bytes.byteLength > MAX_BYTES) {
      return { ok: false as const, error: "File is too large. Maximum size is 4 MB." };
    }
    const ext = input.file.contentType === "application/pdf" ? "pdf" : input.file.contentType.split("/")[1];
    path = `${row.submission_id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: input.file.contentType, upsert: false });
    if (upErr) return { ok: false as const, error: upErr.message };
  }

  const { error: updErr } = await supabaseAdmin
    .from("submissions")
    .update({
      package_key: input.packageKey,
      payment_reference: input.reference,
      payment_note: input.note,
      ...(path ? { payment_proof_path: path } : {}),
      payment_status: "Proof Submitted",
      payment_submitted_at: new Date().toISOString(),
      payment_review_note: "",
      payment_reviewed_at: null,
    })
    .eq("id", row.id);
  if (updErr) throw new Error(updErr.message);
  return { ok: true as const, error: "" };
}

export async function reviewPayment(recordId: string, decision: "Verified" | "Rejected", note: string) {
  const { error } = await supabaseAdmin
    .from("submissions")
    .update({
      payment_status: decision,
      payment_review_note: note,
      payment_reviewed_at: new Date().toISOString(),
    })
    .eq("id", recordId);
  if (error) throw new Error(error.message);
}

export async function signedProofUrl(path: string) {
  if (!path) return "";
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}