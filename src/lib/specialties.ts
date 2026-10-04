/**
 * Medical Consultancy specialty modules. Each specialty reuses the same private
 * case-management system (patients, doctors, recommendations, appointments,
 * follow-ups, services, documents) with its own options and assessment questions.
 */

export type SpecialtyKey = "eye-care" | "cardiology" | "orthopedic" | "gynecology" | "pediatrics" | "dermatology" | "ent" | "dental" | "diabetes";

export interface SpecialtyQuestion {
  key: string;
  en: string;
  ur: string;
  type: "text" | "textarea" | "select";
  options?: readonly string[];
}

export interface SpecialtyConfig {
  key: SpecialtyKey;
  en: string;
  ur: string;
  short: string;
  prefix: string;
  doctorWord: string;
  tagline: string;
  taglineUr: string;
  caseCategories: readonly string[];
  specialists: readonly string[];
  packages: readonly { key: string; ur: string }[];
  questions: readonly SpecialtyQuestion[];
  disclaimerEn: string;
  disclaimerUr: string;
}

const disclaimer = (service: string, serviceUr: string, doctor: string, doctorUr: string) => ({
  disclaimerEn: `${service} is a patient guidance and coordination service. It does not replace examination, diagnosis, prescription, procedure planning, or treatment by a qualified ${doctor}.`,
  disclaimerUr: `${serviceUr} مریض کی رہنمائی اور کوآرڈینیشن کی سہولت ہے۔ یہ مستند ${doctorUr} کے معائنے، تشخیص، نسخے یا علاج کا متبادل نہیں ہے۔`,
});

const packages = (label: string, labelUr: string) =>
  [
    { key: `Basic ${label} Guidance`, ur: `بنیادی ${labelUr} گائیڈنس` },
    { key: `Standard ${label} Guidance & Coordination`, ur: "اسٹینڈرڈ گائیڈنس اور کوآرڈینیشن" },
    { key: "VIP Treatment Coordination", ur: "وی آئی پی ٹریٹمنٹ کوآرڈینیشن" },
    { key: "Second Opinion Coordination", ur: "سیکنڈ اوپینین کوآرڈینیشن" },
  ] as const;

const YN = ["Yes", "No", "Not Sure"] as const;

export const SPECIALTIES: Record<SpecialtyKey, SpecialtyConfig> = {
  "eye-care": {
    key: "eye-care",
    en: "Eye Care Consultancy",
    ur: "آئی کیئر کنسلٹینسی",
    short: "Eye Care",
    prefix: "EC",
    doctorWord: "ophthalmologist",
    tagline: "Guidance and coordination for eye problems, cataract, retina and more.",
    taglineUr: "آنکھوں کے مسائل کے لیے رہنمائی اور کوآرڈینیشن۔",
    caseCategories: ["Vision Problem", "Cataract", "Retina", "Glaucoma", "Injury", "Child Eye Care", "Routine Check-up", "Other"],
    specialists: ["Cataract", "Retina", "Glaucoma", "Cornea", "Oculoplasty", "Pediatric Ophthalmology", "Neuro-Ophthalmology", "General Ophthalmology", "Other"],
    packages: [
      { key: "Basic Eye Guidance", ur: "بنیادی آئی گائیڈنس" },
      { key: "Standard Eye Guidance & Coordination", ur: "اسٹینڈرڈ گائیڈنس اور کوآرڈینیشن" },
      { key: "VIP Treatment Coordination", ur: "وی آئی پی ٹریٹمنٹ کوآرڈینیشن" },
      { key: "Second Opinion Coordination", ur: "سیکنڈ اوپینین کوآرڈینیشن" },
    ],
    questions: [],
    ...disclaimer("Eye Care Consultancy", "آئی کیئر کنسلٹینسی", "ophthalmologist", "ماہرِ امراضِ چشم"),
  },
  cardiology: {
    key: "cardiology",
    en: "Cardiology Consultancy",
    ur: "امراضِ قلب کنسلٹینسی",
    short: "Heart Care",
    prefix: "CA",
    doctorWord: "cardiologist",
    tagline: "Guidance for chest pain, blood pressure, heart tests and cardiac procedures.",
    taglineUr: "سینے کے درد، بلڈ پریشر اور دل کے ٹیسٹ کے لیے رہنمائی۔",
    caseCategories: ["Chest Pain", "High Blood Pressure", "Heart Attack History", "Palpitations", "Heart Failure", "Valve Disease", "Angiography / Stent", "Bypass Surgery", "Routine Check-up", "Other"],
    specialists: ["Interventional Cardiology", "Cardiac Surgery", "Electrophysiology", "Heart Failure", "Pediatric Cardiology", "General Cardiology", "Other"],
    packages: packages("Heart", "دل"),
    questions: [
      { key: "chestPain", en: "Chest pain / discomfort", ur: "سینے میں درد", type: "select", options: ["No", "On exertion", "At rest", "Recent / severe"] },
      { key: "breathlessness", en: "Shortness of breath", ur: "سانس پھولنا", type: "select", options: YN },
      { key: "bloodPressure", en: "Latest blood pressure", ur: "تازہ بلڈ پریشر", type: "text" },
      { key: "diabetes", en: "Diabetes", ur: "ذیابیطس", type: "select", options: YN },
      { key: "smoking", en: "Smoking", ur: "سگریٹ نوشی", type: "select", options: ["Never", "Former", "Current"] },
      { key: "previousCardiac", en: "Previous heart attack / stent / bypass", ur: "پچھلا ہارٹ اٹیک / اسٹنٹ / بائی پاس", type: "text" },
      { key: "tests", en: "ECG / Echo / Angiography done", ur: "ای سی جی / ایکو / انجیوگرافی", type: "textarea" },
      { key: "medications", en: "Current heart medicines", ur: "موجودہ ادویات", type: "textarea" },
    ],
    ...disclaimer("Cardiology Consultancy", "امراضِ قلب کنسلٹینسی", "cardiologist", "ماہرِ امراضِ قلب"),
  },
  orthopedic: {
    key: "orthopedic",
    en: "Orthopaedic Consultancy",
    ur: "ہڈیوں اور جوڑوں کی کنسلٹینسی",
    short: "Bone & Joint",
    prefix: "OR",
    doctorWord: "orthopaedic surgeon",
    tagline: "Guidance for fractures, joint pain, back pain and joint replacement.",
    taglineUr: "فریکچر، جوڑوں اور کمر کے درد کے لیے رہنمائی۔",
    caseCategories: ["Fracture / Injury", "Knee Pain", "Hip Problem", "Back / Spine Pain", "Shoulder Problem", "Arthritis", "Sports Injury", "Joint Replacement", "Child Bone Problem", "Other"],
    specialists: ["Joint Replacement", "Spine Surgery", "Sports Medicine / Arthroscopy", "Trauma", "Pediatric Orthopaedics", "Hand Surgery", "General Orthopaedics", "Other"],
    packages: packages("Bone & Joint", "ہڈی و جوڑ"),
    questions: [
      { key: "affectedArea", en: "Affected area", ur: "متاثرہ حصہ", type: "select", options: ["Knee", "Hip", "Back / Spine", "Neck", "Shoulder", "Hand / Wrist", "Foot / Ankle", "Multiple", "Other"] },
      { key: "side", en: "Side", ur: "طرف", type: "select", options: ["Left", "Right", "Both", "Not applicable"] },
      { key: "injury", en: "Injury / accident history", ur: "چوٹ / حادثہ", type: "text" },
      { key: "duration", en: "How long has the problem lasted?", ur: "مسئلہ کب سے ہے؟", type: "text" },
      { key: "painScore", en: "Pain level (0–10)", ur: "درد کی شدت (0–10)", type: "select", options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
      { key: "mobility", en: "Walking / mobility", ur: "چلنے پھرنے کی صلاحیت", type: "select", options: ["Normal", "Limited", "Needs support", "Bed-bound"] },
      { key: "imaging", en: "X-ray / MRI / CT done", ur: "ایکسرے / ایم آر آئی / سی ٹی", type: "textarea" },
    ],
    ...disclaimer("Orthopaedic Consultancy", "ہڈیوں اور جوڑوں کی کنسلٹینسی", "orthopaedic surgeon", "ماہرِ امراضِ ہڈی"),
  },
  gynecology: {
    key: "gynecology",
    en: "Gynaecology Consultancy",
    ur: "امراضِ نسواں کنسلٹینسی",
    short: "Women's Health",
    prefix: "GY",
    doctorWord: "gynaecologist",
    tagline: "Private guidance for pregnancy care, women's health and gynae procedures.",
    taglineUr: "حمل اور خواتین کی صحت کے لیے نجی رہنمائی۔",
    caseCategories: ["Pregnancy Care", "Infertility", "Menstrual Problem", "PCOS", "Fibroids / Cysts", "Menopause", "Gynae Surgery", "Routine Check-up", "Other"],
    specialists: ["Obstetrics", "Infertility / IVF", "Gynae Oncology", "Urogynaecology", "General Gynaecology", "Other"],
    packages: packages("Women's Health", "خواتین کی صحت"),
    questions: [
      { key: "pregnant", en: "Currently pregnant", ur: "اس وقت حاملہ", type: "select", options: YN },
      { key: "weeks", en: "Pregnancy weeks / due date", ur: "حمل کے ہفتے / متوقع تاریخ", type: "text" },
      { key: "previousPregnancies", en: "Previous pregnancies / deliveries", ur: "پچھلے حمل / زچگی", type: "text" },
      { key: "cycle", en: "Menstrual cycle", ur: "ماہواری", type: "select", options: ["Regular", "Irregular", "Stopped / Menopause", "Not applicable"] },
      { key: "ultrasound", en: "Ultrasound / lab reports", ur: "الٹراساؤنڈ / لیب رپورٹس", type: "textarea" },
      { key: "femaleDoctor", en: "Female doctor preferred", ur: "خاتون ڈاکٹر کی ترجیح", type: "select", options: ["Yes", "No preference"] },
    ],
    ...disclaimer("Gynaecology Consultancy", "امراضِ نسواں کنسلٹینسی", "gynaecologist", "ماہرِ امراضِ نسواں"),
  },
  pediatrics: {
    key: "pediatrics",
    en: "Paediatrics Consultancy",
    ur: "امراضِ اطفال کنسلٹینسی",
    short: "Child Care",
    prefix: "PD",
    doctorWord: "paediatrician",
    tagline: "Guidance for children's illness, growth, vaccination and child specialists.",
    taglineUr: "بچوں کی بیماری، نشوونما اور ویکسین کے لیے رہنمائی۔",
    caseCategories: ["Fever / Infection", "Growth / Nutrition", "Vaccination", "Breathing / Asthma", "Stomach Problem", "Newborn Care", "Development Delay", "Child Surgery", "Other"],
    specialists: ["Neonatology", "Pediatric Neurology", "Pediatric Surgery", "Pediatric Cardiology", "Pediatric Gastroenterology", "General Paediatrics", "Other"],
    packages: packages("Child Care", "بچوں کی نگہداشت"),
    questions: [
      { key: "childAge", en: "Child's age (months / years)", ur: "بچے کی عمر", type: "text" },
      { key: "weight", en: "Weight (kg)", ur: "وزن (کلو)", type: "text" },
      { key: "birthHistory", en: "Birth history (term / premature)", ur: "پیدائش (وقت پر / قبل از وقت)", type: "select", options: ["Full term", "Premature", "Not known"] },
      { key: "vaccination", en: "Vaccinations up to date", ur: "ویکسین مکمل", type: "select", options: YN },
      { key: "feeding", en: "Feeding / diet", ur: "خوراک", type: "text" },
      { key: "development", en: "Development / milestones concerns", ur: "نشوونما سے متعلق تشویش", type: "textarea" },
      { key: "allergies", en: "Allergies", ur: "الرجی", type: "text" },
    ],
    ...disclaimer("Paediatrics Consultancy", "امراضِ اطفال کنسلٹینسی", "paediatrician", "ماہرِ امراضِ اطفال"),
  },
  dermatology: {
    key: "dermatology",
    en: "Dermatology Consultancy",
    ur: "امراضِ جلد کنسلٹینسی",
    short: "Skin Care",
    prefix: "DE",
    doctorWord: "dermatologist",
    tagline: "Guidance for skin, hair and nail problems, cosmetic procedures and skin specialists.",
    taglineUr: "جلد، بالوں اور ناخنوں کے مسائل کے لیے رہنمائی۔",
    caseCategories: ["Acne / Pimples", "Skin Allergy / Eczema", "Hair Loss", "Pigmentation / Melasma", "Psoriasis", "Skin Infection", "Mole / Growth Check", "Cosmetic Procedure", "Child Skin Problem", "Other"],
    specialists: ["Cosmetic Dermatology", "Dermatosurgery", "Pediatric Dermatology", "Hair / Trichology", "General Dermatology", "Other"],
    packages: packages("Skin Care", "جلد کی دیکھ بھال"),
    questions: [
      { key: "affectedArea", en: "Affected area", ur: "متاثرہ حصہ", type: "select", options: ["Face", "Scalp / Hair", "Hands", "Feet", "Body (widespread)", "Nails", "Multiple", "Other"] },
      { key: "duration", en: "How long has the problem lasted?", ur: "مسئلہ کب سے ہے؟", type: "text" },
      { key: "itching", en: "Itching / burning", ur: "خارش / جلن", type: "select", options: ["None", "Mild", "Moderate", "Severe"] },
      { key: "spread", en: "Is it spreading?", ur: "کیا یہ پھیل رہا ہے؟", type: "select", options: YN },
      { key: "previousTreatment", en: "Creams / medicines already tried", ur: "پہلے استعمال کی گئی ادویات / کریمیں", type: "textarea" },
      { key: "allergies", en: "Known allergies (medicine / food / cosmetics)", ur: "معلوم الرجی", type: "text" },
      { key: "photosAvailable", en: "Photos of the affected area available", ur: "متاثرہ جگہ کی تصاویر دستیاب", type: "select", options: YN },
    ],
    ...disclaimer("Dermatology Consultancy", "امراضِ جلد کنسلٹینسی", "dermatologist", "ماہرِ امراضِ جلد"),
  },
};

export const SPECIALTY_KEYS = Object.keys(SPECIALTIES) as SpecialtyKey[];

export function isSpecialtyKey(v: string): v is SpecialtyKey {
  return v in SPECIALTIES;
}
