import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { emptyEyeCareData } from "@/lib/eyecare";

const token = z.string().min(1).max(500);
const txt = (max = 2000) => z.string().max(max).default("");
const dateish = z.string().max(20).default("");

async function guard(t: string) {
  const { verifyToken } = await import("@/lib/admin-auth.server");
  return verifyToken(t);
}

const nullDate = (v: string) => (v && v.trim() ? v : null);

export const eyecareLoad = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token }).parse(i))
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) {
      return { ok: false as const, error: "Session expired. Please sign in again.", data: emptyEyeCareData() };
    }
    try {
      const { loadEyeCareData } = await import("@/lib/eyecare.server");
      return { ok: true as const, error: "", data: await loadEyeCareData() };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not load Eye Care records.",
        data: emptyEyeCareData(),
      };
    }
  });

const patientSchema = z.object({
  id: z.string().max(60).nullable().default(null),
  name: z.string().trim().min(1, "Patient name is required").max(120),
  age: txt(10),
  gender: txt(20),
  whatsapp: txt(30),
  city: txt(80),
  attendantName: txt(120),
  relationship: txt(60),
  mainProblem: txt(500),
  caseCategory: txt(60),
  priority: txt(20),
  preferredCity: txt(80),
  budgetPreference: txt(80),
  servicePackage: txt(80),
  caseStatus: txt(40),
  registrationDate: dateish,
  notes: txt(3000),
});

export const eyecareSavePatient = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token, patient: patientSchema }).parse(i))
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired.", id: "" };
    const p = data.patient;
    try {
      const { savePatient } = await import("@/lib/eyecare.server");
      const id = await savePatient(p.id, {
        name: p.name,
        age: p.age,
        gender: p.gender,
        whatsapp: p.whatsapp,
        city: p.city,
        attendant_name: p.attendantName,
        relationship: p.relationship,
        main_problem: p.mainProblem,
        case_category: p.caseCategory,
        priority: p.priority || "Normal",
        preferred_city: p.preferredCity,
        budget_preference: p.budgetPreference,
        service_package: p.servicePackage,
        case_status: p.caseStatus || "New",
        ...(p.registrationDate ? { registration_date: p.registrationDate } : {}),
        notes: p.notes,
      });
      return { ok: true as const, error: "", id };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save patient.", id: "" };
    }
  });

export const eyecareArchivePatient = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token, id: z.string().min(1), archived: z.boolean() }).parse(i))
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    try {
      const { archivePatient } = await import("@/lib/eyecare.server");
      await archivePatient(data.id, data.archived);
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not update patient." };
    }
  });

export const eyecareSaveAssessment = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        assessment: z.object({
          symptoms: txt(3000),
          previousDiagnosis: txt(1000),
          previousDoctor: txt(200),
          previousTreatment: txt(1000),
          previousReports: txt(1000),
          reportsAvailable: txt(20),
          surgerySuggested: txt(20),
          secondOpinionRequired: txt(20),
          requiredSpecialist: txt(60),
          patientPriority: txt(20),
          travelPreference: txt(60),
          budget: txt(80),
          consultantNotes: txt(3000),
          assessmentDate: dateish,
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const a = data.assessment;
    try {
      const { saveAssessment } = await import("@/lib/eyecare.server");
      await saveAssessment(data.patientUid, {
        symptoms: a.symptoms,
        previous_diagnosis: a.previousDiagnosis,
        previous_doctor: a.previousDoctor,
        previous_treatment: a.previousTreatment,
        previous_reports: a.previousReports,
        reports_available: a.reportsAvailable || "No",
        surgery_suggested: a.surgerySuggested || "Not Confirmed",
        second_opinion_required: a.secondOpinionRequired || "No",
        required_specialist: a.requiredSpecialist || "General Ophthalmology",
        patient_priority: a.patientPriority || "Normal",
        travel_preference: a.travelPreference || "Local",
        budget: a.budget,
        consultant_notes: a.consultantNotes,
        ...(a.assessmentDate ? { assessment_date: a.assessmentDate } : {}),
      });
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save assessment." };
    }
  });

export const eyecareSaveDoctor = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        doctor: z.object({
          id: z.string().max(60).nullable().default(null),
          name: z.string().trim().min(1, "Doctor/Centre name is required").max(160),
          city: txt(80),
          specialty: txt(60),
          consultationFee: txt(40),
          estimatedCost: txt(60),
          services: txt(1000),
          location: txt(300),
          contact: txt(120),
          notes: txt(2000),
          active: z.boolean().default(true),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const d = data.doctor;
    try {
      const { saveDoctor } = await import("@/lib/eyecare.server");
      await saveDoctor(d.id, {
        name: d.name,
        city: d.city,
        specialty: d.specialty || "General Ophthalmology",
        consultation_fee: d.consultationFee,
        estimated_cost: d.estimatedCost,
        services: d.services,
        location: d.location,
        contact: d.contact,
        notes: d.notes,
        active: d.active,
      });
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save doctor/centre." };
    }
  });

export const eyecareSaveRecommendation = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        rec: z.object({
          id: z.string().max(60).nullable().default(null),
          optionNumber: z.number().int().min(1).max(3),
          doctorUid: z.string().max(60).default(""),
          doctorName: txt(160),
          specialty: txt(60),
          city: txt(80),
          estimatedCost: txt(60),
          whySuitable: txt(2000),
          appointmentStatus: txt(30),
          consultantNotes: txt(2000),
          shareable: z.boolean().default(false),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const r = data.rec;
    try {
      const { saveRecommendation } = await import("@/lib/eyecare.server");
      await saveRecommendation(r.id, data.patientUid, r.optionNumber, {
        doctor_uid: r.doctorUid || null,
        doctor_name: r.doctorName,
        specialty: r.specialty,
        city: r.city,
        estimated_cost: r.estimatedCost,
        why_suitable: r.whySuitable,
        appointment_status: r.appointmentStatus || "Requested",
        consultant_notes: r.consultantNotes,
        shareable: r.shareable,
      });
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save recommendation." };
    }
  });

export const eyecareSaveAppointment = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        appointment: z.object({
          id: z.string().max(60).nullable().default(null),
          doctorName: txt(160),
          appointmentDate: dateish,
          appointmentTime: txt(20),
          appointmentType: txt(40),
          status: txt(30),
          notes: txt(2000),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const a = data.appointment;
    try {
      const { saveChild } = await import("@/lib/eyecare.server");
      await saveChild(
        "eyecare_appointments",
        a.id,
        data.patientUid,
        {
          doctor_name: a.doctorName,
          appointment_date: nullDate(a.appointmentDate),
          appointment_time: a.appointmentTime,
          appointment_type: a.appointmentType || "Consultation",
          status: a.status || "Requested",
          notes: a.notes,
        },
        "Appointment",
      );
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save appointment." };
    }
  });

export const eyecareSaveFollowup = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        followup: z.object({
          id: z.string().max(60).nullable().default(null),
          followupDate: dateish,
          consultationStatus: txt(30),
          doctorAdvice: txt(2000),
          surgeryPlanned: txt(20),
          surgeryDate: dateish,
          nextFollowup: dateish,
          patientFeedback: txt(2000),
          caseStatus: txt(40),
          notes: txt(2000),
          completed: z.boolean().default(false),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const f = data.followup;
    try {
      const { saveChild } = await import("@/lib/eyecare.server");
      await saveChild(
        "eyecare_followups",
        f.id,
        data.patientUid,
        {
          followup_date: nullDate(f.followupDate),
          consultation_status: f.consultationStatus || "Pending",
          doctor_advice: f.doctorAdvice,
          surgery_planned: f.surgeryPlanned || "No",
          surgery_date: nullDate(f.surgeryDate),
          next_followup: nullDate(f.nextFollowup),
          patient_feedback: f.patientFeedback,
          case_status: f.caseStatus || "Follow-up",
          notes: f.notes,
          completed: f.completed,
        },
        "Follow-up",
      );
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save follow-up." };
    }
  });

export const eyecareSaveService = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        service: z.object({
          id: z.string().max(60).nullable().default(null),
          servicePackage: txt(80),
          serviceType: txt(120),
          fee: z.number().min(0).max(100_000_000).default(0),
          paymentStatus: txt(30),
          paymentMethod: txt(30),
          paymentDate: dateish,
          notes: txt(2000),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const sv = data.service;
    try {
      const { saveChild } = await import("@/lib/eyecare.server");
      await saveChild(
        "eyecare_services",
        sv.id,
        data.patientUid,
        {
          service_package: sv.servicePackage || "Basic Eye Guidance",
          service_type: sv.serviceType,
          fee: sv.fee,
          payment_status: sv.paymentStatus || "Pending",
          payment_method: sv.paymentMethod,
          payment_date: nullDate(sv.paymentDate),
          notes: sv.notes,
        },
        "Service / payment",
      );
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save service." };
    }
  });

export const eyecareSaveDocument = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        patientUid: z.string().min(1),
        document: z.object({
          id: z.string().max(60).nullable().default(null),
          title: z.string().trim().min(1, "Document title is required").max(160),
          category: txt(60),
          storagePath: txt(300),
          externalLink: txt(500),
          patientShareable: z.boolean().default(false),
          notes: txt(1000),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    const d = data.document;
    try {
      const { saveChild } = await import("@/lib/eyecare.server");
      await saveChild(
        "eyecare_documents",
        d.id,
        data.patientUid,
        {
          title: d.title,
          category: d.category || "Medical Report",
          storage_path: d.storagePath,
          external_link: d.externalLink,
          patient_shareable: d.patientShareable,
          notes: d.notes,
        },
        "Document",
      );
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save document." };
    }
  });

const DELETABLE = [
  "eyecare_recommendations",
  "eyecare_appointments",
  "eyecare_followups",
  "eyecare_services",
  "eyecare_documents",
  "eyecare_doctors",
] as const;

export const eyecareDelete = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token, table: z.enum(DELETABLE), id: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    if (!(await guard(data.token))) return { ok: false as const, error: "Session expired." };
    try {
      const { deleteRow } = await import("@/lib/eyecare.server");
      await deleteRow(data.table, data.id);
      return { ok: true as const, error: "" };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not delete record." };
    }
  });
