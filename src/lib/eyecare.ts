/**
 * Eye Care Consultancy — shared, client-safe types, options and bilingual labels.
 * This module is fully isolated from the Weight Assessment feature.
 */

export const MEDICAL_SPECIALITIES = [
  { key: "eye-care", en: "Eye Care Consultancy", ur: "آئی کیئر کنسلٹینسی", active: true },
  { key: "general", en: "General Medical Consultancy", ur: "جنرل میڈیکل کنسلٹینسی", active: false },
  { key: "skin", en: "Skin / Dermatology", ur: "جِلد کے امراض", active: false },
  { key: "diabetes", en: "Diabetes Care", ur: "ذیابیطس", active: false },
  { key: "cardiology", en: "Cardiology", ur: "امراضِ قلب", active: false },
  { key: "orthopedic", en: "Orthopedic", ur: "ہڈیوں کے امراض", active: false },
  { key: "gynecology", en: "Gynecology", ur: "امراضِ نسواں", active: false },
  { key: "ent", en: "ENT", ur: "کان ناک گلا", active: false },
  { key: "dental", en: "Dental", ur: "دانتوں کا علاج", active: false },
] as const;

export const DISCLAIMER_EN =
  "Eye Care Consultancy is a patient guidance and coordination service. It does not replace examination, diagnosis, prescription, surgery planning, or treatment by a qualified ophthalmologist.";
export const DISCLAIMER_UR =
  "آئی کیئر کنسلٹینسی مریض کی رہنمائی اور کوآرڈینیشن کی سہولت ہے۔ یہ مستند ماہرِ امراضِ چشم کے معائنے، تشخیص، نسخے، سرجری کی منصوبہ بندی یا علاج کا متبادل نہیں ہے۔";

export const CASE_STATUSES = [
  "New",
  "Assessment",
  "Options Given",
  "Appointment",
  "Consultation Done",
  "Treatment Planned",
  "Completed",
  "Follow-up",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_UR: Record<string, string> = {
  New: "نیا کیس",
  Assessment: "جائزہ",
  "Options Given": "آپشنز دیے گئے",
  Appointment: "اپائنٹمنٹ",
  "Consultation Done": "مشاورت مکمل",
  "Treatment Planned": "علاج کی منصوبہ بندی",
  Completed: "مکمل",
  "Follow-up": "فالو اپ",
};

export const PRIORITIES = ["Normal", "Medium", "High", "Urgent"] as const;
export const PRIORITY_UR: Record<string, string> = {
  Normal: "عام",
  Medium: "درمیانی",
  High: "زیادہ",
  Urgent: "فوری",
};

export const GENDERS = ["Male", "Female", "Other"] as const;
export const GENDER_UR: Record<string, string> = { Male: "مرد", Female: "خاتون", Other: "دیگر" };

export const CASE_CATEGORIES = [
  "Vision Problem",
  "Cataract",
  "Retina",
  "Glaucoma",
  "Injury",
  "Child Eye Care",
  "Routine Check-up",
  "Other",
] as const;

export const SPECIALISTS = [
  "Cataract",
  "Retina",
  "Glaucoma",
  "Cornea",
  "Oculoplasty",
  "Pediatric Ophthalmology",
  "Neuro-Ophthalmology",
  "General Ophthalmology",
  "Other",
] as const;

export const TRAVEL_PREFERENCES = [
  "Local",
  "Same City",
  "Nearby City",
  "Anywhere in South Punjab",
  "Other",
] as const;

export const YES_NO = ["Yes", "No"] as const;
export const YES_NO_UNCONFIRMED = ["Yes", "No", "Not Confirmed"] as const;
export const YES_NO_RECOMMENDED = ["Yes", "No", "Recommended"] as const;

export const SERVICE_PACKAGES = [
  { key: "Basic Eye Guidance", ur: "بنیادی آئی گائیڈنس" },
  { key: "Standard Eye Guidance & Coordination", ur: "اسٹینڈرڈ گائیڈنس اور کوآرڈینیشن" },
  { key: "VIP Treatment Coordination", ur: "وی آئی پی ٹریٹمنٹ کوآرڈینیشن" },
  { key: "Second Opinion Coordination", ur: "سیکنڈ اوپینین کوآرڈینیشن" },
] as const;

export const PAYMENT_STATUSES = ["Pending", "Paid", "Partially Paid", "Refunded", "Cancelled"] as const;
export const PAYMENT_STATUS_UR: Record<string, string> = {
  Pending: "زیرِ التوا",
  Paid: "ادا شدہ",
  "Partially Paid": "جزوی ادائیگی",
  Refunded: "رقم واپس",
  Cancelled: "منسوخ",
};
export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "EasyPaisa", "JazzCash", "Other"] as const;

export const APPOINTMENT_STATUSES = [
  "Requested",
  "Pending",
  "Confirmed",
  "Rescheduled",
  "Completed",
  "Cancelled",
] as const;
export const APPOINTMENT_STATUS_UR: Record<string, string> = {
  Requested: "درخواست شدہ",
  Pending: "زیرِ التوا",
  Confirmed: "تصدیق شدہ",
  Rescheduled: "تاریخ تبدیل",
  Completed: "مکمل",
  Cancelled: "منسوخ",
};
export const APPOINTMENT_TYPES = [
  "Consultation",
  "Second Opinion",
  "Follow-up",
  "Procedure Discussion",
  "Other",
] as const;

export const CONSULTATION_STATUSES = ["Pending", "Done", "Missed", "Rescheduled"] as const;

export const DOCUMENT_CATEGORIES = [
  "Medical Report",
  "Prescription",
  "Investigation Report",
  "Consultation Document",
  "Payment Proof",
  "Other",
] as const;

export interface EyePatient {
  id: string;
  patientId: string;
  name: string;
  age: string;
  gender: string;
  whatsapp: string;
  city: string;
  attendantName: string;
  relationship: string;
  mainProblem: string;
  caseCategory: string;
  priority: string;
  preferredCity: string;
  budgetPreference: string;
  servicePackage: string;
  caseStatus: string;
  registrationDate: string;
  notes: string;
  archived: boolean;
}

export interface EyeAssessment {
  id: string;
  patientUid: string;
  symptoms: string;
  previousDiagnosis: string;
  previousDoctor: string;
  previousTreatment: string;
  previousReports: string;
  reportsAvailable: string;
  surgerySuggested: string;
  secondOpinionRequired: string;
  requiredSpecialist: string;
  patientPriority: string;
  travelPreference: string;
  budget: string;
  consultantNotes: string;
  assessmentDate: string;
}

export interface EyeDoctor {
  id: string;
  name: string;
  city: string;
  specialty: string;
  consultationFee: string;
  estimatedCost: string;
  services: string;
  location: string;
  contact: string;
  notes: string;
  active: boolean;
}

export interface EyeRecommendation {
  id: string;
  patientUid: string;
  optionNumber: number;
  doctorUid: string;
  doctorName: string;
  specialty: string;
  city: string;
  estimatedCost: string;
  whySuitable: string;
  appointmentStatus: string;
  consultantNotes: string;
  shareable: boolean;
}

export interface EyeAppointment {
  id: string;
  patientUid: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: string;
  notes: string;
}

export interface EyeFollowup {
  id: string;
  patientUid: string;
  followupDate: string;
  consultationStatus: string;
  doctorAdvice: string;
  surgeryPlanned: string;
  surgeryDate: string;
  nextFollowup: string;
  patientFeedback: string;
  caseStatus: string;
  notes: string;
  completed: boolean;
}

export interface EyeService {
  id: string;
  patientUid: string;
  servicePackage: string;
  serviceType: string;
  fee: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  notes: string;
}

export interface EyeDocument {
  id: string;
  patientUid: string;
  title: string;
  category: string;
  storagePath: string;
  externalLink: string;
  patientShareable: boolean;
  notes: string;
  createdAt: string;
}

export interface EyeTimelineEvent {
  id: string;
  patientUid: string;
  event: string;
  detail: string;
  occurredAt: string;
}

export interface EyeCareData {
  patients: EyePatient[];
  assessments: EyeAssessment[];
  doctors: EyeDoctor[];
  recommendations: EyeRecommendation[];
  appointments: EyeAppointment[];
  followups: EyeFollowup[];
  services: EyeService[];
  documents: EyeDocument[];
  timeline: EyeTimelineEvent[];
}

export const emptyEyeCareData = (): EyeCareData => ({
  patients: [],
  assessments: [],
  doctors: [],
  recommendations: [],
  appointments: [],
  followups: [],
  services: [],
  documents: [],
  timeline: [],
});

/** Digits-only WhatsApp link (never sends automatically — opens WhatsApp with a draft). */
export function waLink(number: string, message: string) {
  const digits = (number || "").replace(/\D/g, "").replace(/^0+/, "");
  const withCc = digits.startsWith("92") ? digits : `92${digits}`;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(message)}`;
}

export function isValidWhatsapp(value: string) {
  const digits = (value || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
