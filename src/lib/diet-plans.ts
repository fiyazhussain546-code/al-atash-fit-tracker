export type DietPlanStatus =
  | "Not Started"
  | "Draft"
  | "Ready for Review"
  | "Consultant Approved"
  | "Released"
  | "Rejected/Needs Changes";

export const DIET_PLAN_STATUSES: DietPlanStatus[] = [
  "Not Started",
  "Draft",
  "Ready for Review",
  "Consultant Approved",
  "Released",
  "Rejected/Needs Changes",
];

export const DIET_PLAN_STATUS_UR: Record<DietPlanStatus, string> = {
  "Not Started": "شروع نہیں ہوا",
  Draft: "مسودہ",
  "Ready for Review": "جائزے کے لیے تیار",
  "Consultant Approved": "کنسلٹنٹ سے منظور",
  Released: "جاری کر دیا گیا",
  "Rejected/Needs Changes": "تبدیلی درکار",
};

export interface DietPlan {
  submissionRecordId: string;
  status: DietPlanStatus;
  patientName: string;
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
  consultantName: string;
  consultantNote: string;
  releasedAt: string;
  updatedAt: string;
}

export function emptyDietPlan(submissionRecordId: string): DietPlan {
  return {
    submissionRecordId,
    status: "Not Started",
    patientName: "",
    planTitle: "",
    durationLabel: "",
    breakfast: "",
    midMorning: "",
    lunch: "",
    eveningSnack: "",
    dinner: "",
    waterGuidance: "",
    activityGuidance: "",
    foodsPrefer: "",
    foodsLimit: "",
    notes: "",
    consultantName: "",
    consultantNote: "",
    releasedAt: "",
    updatedAt: "",
  };
}
