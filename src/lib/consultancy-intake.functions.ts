import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const txt = (max = 2000) => z.string().trim().max(max).default("");
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const schema = z.object({
  specialty: z.enum(["eye-care", "cardiology", "orthopedic", "gynecology", "pediatrics", "dermatology", "ent", "dental", "diabetes", "general"]),
  name: z.string().trim().min(2, "Full name is required").max(120),
  age: z.string().trim().min(1, "Age is required").max(10),
  gender: z.string().trim().min(1).max(20),
  whatsapp: z.string().trim().regex(/^(\+?92|0)?3\d{9}$/, "Enter a valid Pakistani WhatsApp number"),
  city: z.string().trim().min(2, "City is required").max(80),
  preferredCity: txt(80),
  attendantName: txt(120),
  relationship: txt(60),
  mainProblem: z.string().trim().min(3, "Please describe the main problem").max(1000),
  symptoms: txt(3000),
  previousDiagnosis: txt(1000),
  previousDoctor: txt(200),
  previousTreatment: txt(1000),
  previousReports: txt(1000),
  priority: z.enum(["Normal", "Urgent", "Emergency"]).default("Normal"),
  servicePackage: txt(80),
  budget: txt(80),
  extra: z.record(z.string().max(60), z.string().max(2000)).default({}),
  consent: z.literal(true, { message: "Consent is required" }),
  files: z
    .array(
      z.object({
        name: z.string().max(160),
        category: z.string().max(60),
        contentType: z.string().max(80),
        base64: z.string().min(1).max(7_000_000),
      }),
    )
    .max(5)
    .default([]),
});

export type IntakeInput = z.input<typeof schema>;

export const submitConsultancyIntake = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => schema.parse(i))
  .handler(async ({ data }) => {
    try {
      for (const f of data.files) {
        if (!ALLOWED.includes(f.contentType)) return { ok: false as const, error: "Only PDF, JPG, PNG or WEBP files are allowed.", patientId: "" };
      }
      const { savePatient, saveAssessment, saveChild } = await import("@/lib/eyecare.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const uid = await savePatient(
        null,
        {
          name: data.name,
          age: data.age,
          gender: data.gender,
          whatsapp: data.whatsapp,
          city: data.city,
          attendant_name: data.attendantName,
          relationship: data.relationship,
          main_problem: data.mainProblem,
          priority: data.priority,
          preferred_city: data.preferredCity,
          budget_preference: data.budget,
          service_package: data.servicePackage,
          case_status: "New",
          notes: "Submitted online by patient (consent given).",
        },
        data.specialty,
        "MC",
      );
      await saveAssessment(uid, {
        symptoms: data.symptoms,
        previous_diagnosis: data.previousDiagnosis,
        previous_doctor: data.previousDoctor,
        previous_treatment: data.previousTreatment,
        previous_reports: data.previousReports,
        reports_available: data.files.length ? "Yes" : "No",
        patient_priority: data.priority,
        budget: data.budget,
        extra: data.extra,
      });
      for (const [i, f] of data.files.entries()) {
        const bin = atob(f.base64);
        const bytes = new Uint8Array(bin.length);
        for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
        if (bytes.byteLength > 5 * 1024 * 1024) continue;
        const ext = f.contentType === "application/pdf" ? "pdf" : f.contentType.split("/")[1];
        const path = `${uid}/${Date.now()}-${i}.${ext}`;
        const { error } = await supabaseAdmin.storage.from("consultancy-documents").upload(path, bytes, { contentType: f.contentType });
        if (error) continue;
        await saveChild(
          "eyecare_documents",
          null,
          uid,
          { title: f.name || `Report ${i + 1}`, category: f.category || "Medical Report", storage_path: path, notes: "Uploaded by patient" },
          "Document",
        );
      }
      const { data: row } = await supabaseAdmin.from("eyecare_patients").select("patient_id").eq("id", uid).single();
      return { ok: true as const, error: "", patientId: String(row?.patient_id ?? "") };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not submit. Please try again.", patientId: "" };
    }
  });
