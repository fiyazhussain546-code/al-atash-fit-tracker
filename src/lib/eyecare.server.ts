import { supabaseAdmin as db } from "@/integrations/supabase/client.server";
import type {
  EyeAppointment,
  EyeAssessment,
  EyeCareData,
  EyeDoctor,
  EyeDocument,
  EyeFollowup,
  EyePatient,
  EyeRecommendation,
  EyeService,
  EyeTimelineEvent,
} from "@/lib/eyecare";

const s = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

/* ---------------------------------- read ---------------------------------- */

function mapPatient(r: Record<string, unknown>): EyePatient {
  return {
    id: s(r["id"]),
    patientId: s(r["patient_id"]),
    name: s(r["name"]),
    age: s(r["age"]),
    gender: s(r["gender"]),
    whatsapp: s(r["whatsapp"]),
    city: s(r["city"]),
    attendantName: s(r["attendant_name"]),
    relationship: s(r["relationship"]),
    mainProblem: s(r["main_problem"]),
    caseCategory: s(r["case_category"]),
    priority: s(r["priority"]),
    preferredCity: s(r["preferred_city"]),
    budgetPreference: s(r["budget_preference"]),
    servicePackage: s(r["service_package"]),
    caseStatus: s(r["case_status"]),
    registrationDate: s(r["registration_date"]),
    notes: s(r["notes"]),
    archived: Boolean(r["archived"]),
  };
}

function mapAssessment(r: Record<string, unknown>): EyeAssessment {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    symptoms: s(r["symptoms"]),
    previousDiagnosis: s(r["previous_diagnosis"]),
    previousDoctor: s(r["previous_doctor"]),
    previousTreatment: s(r["previous_treatment"]),
    previousReports: s(r["previous_reports"]),
    reportsAvailable: s(r["reports_available"]),
    surgerySuggested: s(r["surgery_suggested"]),
    secondOpinionRequired: s(r["second_opinion_required"]),
    requiredSpecialist: s(r["required_specialist"]),
    patientPriority: s(r["patient_priority"]),
    travelPreference: s(r["travel_preference"]),
    budget: s(r["budget"]),
    consultantNotes: s(r["consultant_notes"]),
    assessmentDate: s(r["assessment_date"]),
  };
}

function mapDoctor(r: Record<string, unknown>): EyeDoctor {
  return {
    id: s(r["id"]),
    name: s(r["name"]),
    city: s(r["city"]),
    specialty: s(r["specialty"]),
    consultationFee: s(r["consultation_fee"]),
    estimatedCost: s(r["estimated_cost"]),
    services: s(r["services"]),
    location: s(r["location"]),
    contact: s(r["contact"]),
    notes: s(r["notes"]),
    active: Boolean(r["active"]),
  };
}

function mapRecommendation(r: Record<string, unknown>): EyeRecommendation {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    optionNumber: Number(r["option_number"] ?? 1),
    doctorUid: s(r["doctor_uid"]),
    doctorName: s(r["doctor_name"]),
    specialty: s(r["specialty"]),
    city: s(r["city"]),
    estimatedCost: s(r["estimated_cost"]),
    whySuitable: s(r["why_suitable"]),
    appointmentStatus: s(r["appointment_status"]),
    consultantNotes: s(r["consultant_notes"]),
    shareable: Boolean(r["shareable"]),
  };
}

function mapAppointment(r: Record<string, unknown>): EyeAppointment {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    doctorName: s(r["doctor_name"]),
    appointmentDate: s(r["appointment_date"]),
    appointmentTime: s(r["appointment_time"]),
    appointmentType: s(r["appointment_type"]),
    status: s(r["status"]),
    notes: s(r["notes"]),
  };
}

function mapFollowup(r: Record<string, unknown>): EyeFollowup {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    followupDate: s(r["followup_date"]),
    consultationStatus: s(r["consultation_status"]),
    doctorAdvice: s(r["doctor_advice"]),
    surgeryPlanned: s(r["surgery_planned"]),
    surgeryDate: s(r["surgery_date"]),
    nextFollowup: s(r["next_followup"]),
    patientFeedback: s(r["patient_feedback"]),
    caseStatus: s(r["case_status"]),
    notes: s(r["notes"]),
    completed: Boolean(r["completed"]),
  };
}

function mapService(r: Record<string, unknown>): EyeService {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    servicePackage: s(r["service_package"]),
    serviceType: s(r["service_type"]),
    fee: Number(r["fee"] ?? 0),
    paymentStatus: s(r["payment_status"]),
    paymentMethod: s(r["payment_method"]),
    paymentDate: s(r["payment_date"]),
    notes: s(r["notes"]),
  };
}

function mapDocument(r: Record<string, unknown>): EyeDocument {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    title: s(r["title"]),
    category: s(r["category"]),
    storagePath: s(r["storage_path"]),
    externalLink: s(r["external_link"]),
    patientShareable: Boolean(r["patient_shareable"]),
    notes: s(r["notes"]),
    createdAt: s(r["created_at"]),
  };
}

function mapTimeline(r: Record<string, unknown>): EyeTimelineEvent {
  return {
    id: s(r["id"]),
    patientUid: s(r["patient_uid"]),
    event: s(r["event"]),
    detail: s(r["detail"]),
    occurredAt: s(r["occurred_at"]),
  };
}

type Row = Record<string, unknown>;

async function all(table: string, order: string, asc = false): Promise<Row[]> {
  const { data, error } = await (db as any)
    .from(table)
    .select("*")
    .order(order, { ascending: asc })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []) as Row[];
}

export async function loadEyeCareData(): Promise<EyeCareData> {
  const [patients, assessments, doctors, recommendations, appointments, followups, services, documents, timeline] =
    await Promise.all([
      all("eyecare_patients", "created_at"),
      all("eyecare_assessments", "created_at"),
      all("eyecare_doctors", "created_at"),
      all("eyecare_recommendations", "option_number", true),
      all("eyecare_appointments", "created_at"),
      all("eyecare_followups", "created_at"),
      all("eyecare_services", "created_at"),
      all("eyecare_documents", "created_at"),
      all("eyecare_timeline", "occurred_at"),
    ]);
  return {
    patients: patients.map(mapPatient),
    assessments: assessments.map(mapAssessment),
    doctors: doctors.map(mapDoctor),
    recommendations: recommendations.map(mapRecommendation),
    appointments: appointments.map(mapAppointment),
    followups: followups.map(mapFollowup),
    services: services.map(mapService),
    documents: documents.map(mapDocument),
    timeline: timeline.map(mapTimeline),
  };
}

/* --------------------------------- writes --------------------------------- */

export async function addTimeline(patientUid: string, event: string, detail = "") {
  await (db as any).from("eyecare_timeline").insert({ patient_uid: patientUid, event, detail });
}

export async function nextPatientId(): Promise<string> {
  const { data, error } = await (db as any).rpc("next_eyecare_patient_id");
  if (error || !data) {
    // Defensive fallback — still unique thanks to the DB unique constraint.
    return `EC-${new Date().getUTCFullYear()}-${String(Date.now()).slice(-4)}`;
  }
  return String(data);
}

export async function savePatient(id: string | null, fields: Record<string, unknown>) {
  if (id) {
    const { error } = await (db as any).from("eyecare_patients").update(fields).eq("id", id);
    if (error) throw new Error(error.message);
    await addTimeline(id, "Patient record updated");
    return id;
  }
  const patientId = await nextPatientId();
  const { data, error } = await (db as any)
    .from("eyecare_patients")
    .insert({ ...fields, patient_id: patientId })
    .select("id, patient_id")
    .single();
  if (error) throw new Error(error.message);
  await addTimeline(data.id, "Registration", `Patient ID ${data.patient_id}`);
  return String(data.id);
}

export async function archivePatient(id: string, archived: boolean) {
  const { error } = await (db as any).from("eyecare_patients").update({ archived }).eq("id", id);
  if (error) throw new Error(error.message);
  await addTimeline(id, archived ? "Case archived" : "Case restored");
}

export async function saveAssessment(patientUid: string, fields: Record<string, unknown>) {
  const { data: existing } = await (db as any)
    .from("eyecare_assessments")
    .select("id")
    .eq("patient_uid", patientUid)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await (db as any).from("eyecare_assessments").update(fields).eq("id", existing.id);
    if (error) throw new Error(error.message);
    await addTimeline(patientUid, "Assessment updated");
    return;
  }
  const { error } = await (db as any)
    .from("eyecare_assessments")
    .insert({ ...fields, patient_uid: patientUid });
  if (error) throw new Error(error.message);
  await addTimeline(patientUid, "Assessment completed");
}

export async function saveDoctor(id: string | null, fields: Record<string, unknown>) {
  if (id) {
    const { error } = await (db as any).from("eyecare_doctors").update(fields).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await (db as any).from("eyecare_doctors").insert(fields);
  if (error) throw new Error(error.message);
}

export async function saveRecommendation(
  id: string | null,
  patientUid: string,
  optionNumber: number,
  fields: Record<string, unknown>,
) {
  if (!id) {
    const { count, error: cErr } = await (db as any)
      .from("eyecare_recommendations")
      .select("id", { count: "exact", head: true })
      .eq("patient_uid", patientUid);
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) >= 3) {
      throw new Error("A patient can have a maximum of 3 recommended options. Edit or replace an existing option.");
    }
  }
  const payload = { ...fields, patient_uid: patientUid, option_number: optionNumber };
  if (id) {
    const { error } = await (db as any).from("eyecare_recommendations").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await addTimeline(patientUid, "Recommendation updated", `Option ${optionNumber}`);
    return;
  }
  const { error } = await (db as any).from("eyecare_recommendations").insert(payload);
  if (error) throw new Error(error.message);
  await addTimeline(patientUid, "Recommendation added", `Option ${optionNumber}`);
}

export async function saveChild(
  table: "eyecare_appointments" | "eyecare_followups" | "eyecare_services" | "eyecare_documents",
  id: string | null,
  patientUid: string,
  fields: Record<string, unknown>,
  timelineEvent: string,
) {
  if (id) {
    const { error } = await (db as any).from(table).update(fields).eq("id", id);
    if (error) throw new Error(error.message);
    await addTimeline(patientUid, `${timelineEvent} updated`);
    return;
  }
  const { error } = await (db as any).from(table).insert({ ...fields, patient_uid: patientUid });
  if (error) throw new Error(error.message);
  await addTimeline(patientUid, `${timelineEvent} added`);
}

export async function deleteRow(table: string, id: string) {
  const { error } = await (db as any).from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
