import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { allFields, type AssessmentType } from "@/lib/assessment-schema";

const inputSchema = z.object({
  type: z.enum(["child", "female", "male"]),
  values: z.record(z.union([z.string(), z.array(z.string()), z.boolean()])),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const type = data.type as AssessmentType;
    const values = data.values;

    const missing = allFields(type)
      .filter((f) => f.required)
      .filter((f) => {
        const v = values[f.id];
        if (f.type === "consent") return v !== true && v !== "true";
        return v === undefined || v === null || String(v).trim() === "";
      })
      .map((f) => f.id);
    if (missing.length > 0) {
      return { ok: false as const, error: "Missing required fields", missing };
    }

    const prefix = type === "child" ? "CHD" : type === "female" ? "FEM" : "MAL";
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(3)))
      .map((b) => b.toString(36).toUpperCase().padStart(2, "0"))
      .join("")
      .slice(0, 5);
    const submissionId = `ALF-${prefix}-${stamp}-${rand}`;

    const { insertSubmission } = await import("@/lib/submissions.server");
    const consentField = allFields(type).find((f) => f.type === "consent");
    const consentValue = consentField ? values[consentField.id] : undefined;

    try {
      await insertSubmission({
        submissionId,
        formType: type,
        submittedAt: now.toISOString(),
        name: String(values["full_name"] ?? ""),
        phone: String(values["phone"] ?? ""),
        city: String(values["city"] ?? ""),
        age: String(values["age"] ?? ""),
        bmi: String(values["bmi"] ?? ""),
        consent: consentValue === true || consentValue === "true",
        payload: values,
      });
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save submission." };
    }

    return { ok: true as const, submissionId, submittedAt: now.toISOString() };
  });