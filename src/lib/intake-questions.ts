import type { SpecialtyKey, SpecialtyQuestion } from "@/lib/specialties";

const YN = ["Yes", "No", "Not Sure"] as const;
const DUR = ["Less than 1 week", "1–4 weeks", "1–6 months", "6–12 months", "More than 1 year"] as const;

/** Common medical assessment asked in every specialty (stored in assessment.extra). */
export const COMMON_QUESTIONS: SpecialtyQuestion[] = [
  { key: "duration", en: "How long has this problem been present?", ur: "یہ مسئلہ کب سے ہے؟", type: "select", options: DUR },
  { key: "currentMedicines", en: "Current medicines", ur: "موجودہ ادویات", type: "textarea" },
  { key: "allergies", en: "Allergies (medicines / food)", ur: "الرجی (دوا / خوراک)", type: "text" },
  { key: "surgeryHistory", en: "Previous surgery / procedure", ur: "پچھلا آپریشن / پروسیجر", type: "textarea" },
  { key: "medicalHistory", en: "Other medical conditions (BP, diabetes, etc.)", ur: "دیگر بیماریاں (بلڈ پریشر، شوگر وغیرہ)", type: "textarea" },
  { key: "familyHistory", en: "Family history (if relevant)", ur: "خاندانی تاریخ (اگر متعلقہ ہو)", type: "text" },
  { key: "alternateContact", en: "Alternate contact number", ur: "متبادل رابطہ نمبر", type: "text" },
  { key: "additionalInfo", en: "Additional information", ur: "اضافی معلومات", type: "textarea" },
];

const q = (key: string, en: string, ur: string, type: SpecialtyQuestion["type"] = "select", options: readonly string[] = YN): SpecialtyQuestion =>
  type === "select" || type === "multi" ? { key, en, ur, type, options } : { key, en, ur, type };

export const SPECIALTY_QUESTIONS: Record<SpecialtyKey, SpecialtyQuestion[]> = {
  "eye-care": [
    q("eyeAffected", "Which eye?", "کون سی آنکھ؟", "select", ["Right", "Left", "Both"]),
    q("eyeSymptoms", "Symptoms", "علامات", "multi", ["Blurred vision", "Eye pain", "Redness", "Watering", "Discharge", "Itching", "Headache with vision"]),
    q("glasses", "Glasses / contact lens use", "عینک / لینز", "select", ["None", "Glasses", "Contact lens", "Both"]),
    q("eyeHistory", "Eye history", "آنکھوں کی سابقہ بیماری", "multi", ["Cataract", "Glaucoma", "Retina / macular problem", "Diabetes-related eye problem", "Previous eye surgery", "Previous laser", "Previous eye injections"]),
    q("eyeDrops", "Current eye drops", "موجودہ آئی ڈراپس", "text"),
    q("surgeryAdvised", "Has any surgery been advised?", "کیا آپریشن تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  cardiology: [
    q("cardioSymptoms", "Symptoms", "علامات", "multi", ["Chest discomfort", "Breathlessness", "Palpitations", "Dizziness", "Fainting"]),
    q("riskFactors", "Known conditions", "معلوم بیماریاں", "multi", ["High blood pressure", "Diabetes", "High cholesterol", "Previous heart disease", "Previous heart attack"]),
    q("cardiacProcedures", "Previous procedures", "پچھلے پروسیجر", "multi", ["Angiography", "Angioplasty / stent", "Bypass surgery"]),
    q("cardiacTests", "Tests done", "کیے گئے ٹیسٹ", "multi", ["ECG", "Echo", "Stress test"]),
    q("bloodPressure", "Latest blood pressure", "تازہ بلڈ پریشر", "text"),
    q("cardiacMeds", "Current cardiac medicines", "دل کی موجودہ ادویات", "textarea"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  orthopedic: [
    q("bodyLocation", "Body location", "جسم کا حصہ", "multi", ["Knee", "Shoulder", "Hip", "Back", "Neck", "Hand / wrist", "Foot / ankle", "Other"]),
    q("injury", "Injury / trauma?", "چوٹ / حادثہ؟"),
    q("fractureHistory", "Fracture history", "فریکچر کی تاریخ"),
    q("physio", "Previous physiotherapy", "پچھلی فزیوتھراپی"),
    q("imaging", "Imaging done", "کیے گئے ٹیسٹ", "multi", ["X-ray", "MRI", "CT scan"]),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  gynecology: [
    q("cycle", "Cycle regularity", "ماہواری کی باقاعدگی", "select", ["Regular", "Irregular", "Stopped / menopause", "Not applicable"]),
    q("gynaeSymptoms", "Concerns", "مسائل", "multi", ["Excessive bleeding", "Pain", "Infertility concerns", "PCOS history"]),
    q("pregnancy", "Currently pregnant?", "کیا اس وقت حمل ہے؟"),
    q("pregnancyHistory", "Pregnancy history (number of pregnancies / deliveries)", "حمل کی تاریخ", "text"),
    q("gynaeSurgery", "Previous gynaecological surgery", "پچھلا زنانہ آپریشن", "text"),
    q("ultrasound", "Previous ultrasound / reports", "پچھلا الٹراساؤنڈ / رپورٹس"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  pediatrics: [
    q("childWeight", "Child's weight (kg)", "بچے کا وزن (کلو)", "text"),
    q("childHeight", "Child's height (cm)", "بچے کا قد (سینٹی میٹر)", "text"),
    q("childSymptoms", "Symptoms", "علامات", "multi", ["Fever", "Cough", "Breathing issue", "Feeding issue", "Vomiting / diarrhoea", "Growth concern", "Development concern"]),
    q("vaccination", "Vaccinations up to date?", "حفاظتی ٹیکے مکمل؟"),
    q("guardian", "Parent / guardian name & contact", "والدین / سرپرست کا نام اور رابطہ", "text"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  dermatology: [
    q("skinConcern", "Skin concern", "جلد کا مسئلہ", "multi", ["Acne", "Rash", "Itching", "Allergy", "Pigmentation", "Hair loss", "Scalp problem", "Infection"]),
    q("skinLocation", "Body location", "جسم کا حصہ", "text"),
    q("creams", "Current creams / medicines", "موجودہ کریمیں / ادویات", "textarea"),
    q("spreading", "Is it spreading?", "کیا یہ پھیل رہا ہے؟"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  ent: [
    q("entArea", "Problem area", "مسئلے کی جگہ", "multi", ["Ear", "Hearing", "Ear pain / discharge", "Nose blockage", "Sinus", "Allergy", "Throat", "Tonsils", "Voice", "Snoring / sleep"]),
    q("entSide", "Side", "طرف", "select", ["Right", "Left", "Both", "Not applicable"]),
    q("entSurgery", "Previous ENT surgery", "پچھلا ای این ٹی آپریشن", "text"),
    q("entTests", "Tests done", "کیے گئے ٹیسٹ", "multi", ["Audiometry", "CT scan", "X-ray"]),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  dental: [
    q("dentalProblem", "Dental problem", "دانتوں کا مسئلہ", "multi", ["Tooth pain", "Gum problem", "Bleeding gums", "Swelling", "Sensitivity", "Missing teeth", "Wisdom tooth"]),
    q("dentalHistory", "Dental history", "دانتوں کی سابقہ تاریخ", "multi", ["Root canal", "Extraction", "Dental surgery"]),
    q("dentalXray", "Dental X-ray available?", "ڈینٹل ایکسرے موجود؟"),
    q("dentalTreatment", "Current treatment", "موجودہ علاج", "text"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  diabetes: [
    q("diabetesType", "Diabetes type (if known)", "ذیابیطس کی قسم", "select", ["Type 1", "Type 2", "Gestational", "Not sure"]),
    q("hba1c", "HbA1c (if available)", "HbA1c", "text"),
    q("fasting", "Fasting glucose", "نہار منہ شوگر", "text"),
    q("random", "Random glucose", "رینڈم شوگر", "text"),
    q("insulin", "Using insulin?", "انسولین استعمال کرتے ہیں؟"),
    q("bloodPressure", "Blood pressure", "بلڈ پریشر", "text"),
    q("weight", "Weight (kg)", "وزن (کلو)", "text"),
    q("diagnosedComplications", "Already diagnosed complications", "تشخیص شدہ پیچیدگیاں", "multi", ["Kidney", "Eye", "Nerve / feet", "Heart", "High cholesterol"]),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
  general: [
    q("existingConditions", "Existing conditions", "موجودہ بیماریاں", "multi", ["Blood pressure", "Diabetes", "Heart", "Asthma", "Thyroid", "Kidney", "Liver"]),
    q("fever", "Fever?", "بخار؟"),
    q("healthConcerns", "General health concerns", "عمومی صحت کے خدشات", "textarea"),
    q("preferredSpecialty", "Preferred specialty (if known)", "پسندیدہ اسپیشلٹی", "text"),
    q("surgeryAdvised", "Has any surgery / procedure been advised?", "کیا آپریشن / پروسیجر تجویز ہوا ہے؟"),
    q("secondOpinion", "Second opinion required?", "سیکنڈ اوپینین درکار؟"),
  ],
};

export const intakeQuestionsFor = (k: SpecialtyKey) => [...COMMON_QUESTIONS, ...SPECIALTY_QUESTIONS[k]];
