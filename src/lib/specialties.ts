/**
 * Medical Consultancy specialty modules. Each specialty reuses the same private
 * case-management system (patients, doctors, recommendations, appointments,
 * follow-ups, services, documents) with its own options and assessment questions.
 */

export type SpecialtyKey = "eye-care" | "cardiology" | "orthopedic" | "gynecology" | "pediatrics" | "dermatology" | "ent" | "dental" | "diabetes" | "general";

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
  ent: {
    key: "ent",
    en: "ENT Consultancy",
    ur: "کان ناک گلا کنسلٹینسی",
    short: "ENT",
    prefix: "EN",
    doctorWord: "ENT specialist",
    tagline: "Guidance for ear, nose, throat, hearing and sinus problems.",
    taglineUr: "کان، ناک، گلے اور سائنز کے مسائل کے لیے رہنمائی۔",
    caseCategories: ["Hearing Problem", "Ear Infection / Pain", "Sinus / Nasal Blockage", "Throat / Tonsils", "Voice Problem", "Dizziness / Vertigo", "Snoring / Sleep Apnea", "Child ENT Problem", "ENT Surgery", "Other"],
    specialists: ["Otology / Ear Surgery", "Rhinology / Sinus", "Laryngology / Voice", "Pediatric ENT", "Head & Neck Surgery", "General ENT", "Other"],
    packages: packages("ENT", "کان ناک گلا"),
    questions: [
      { key: "affectedArea", en: "Main affected area", ur: "متاثرہ حصہ", type: "select", options: ["Ear", "Nose / Sinus", "Throat", "Hearing", "Voice", "Balance / Dizziness", "Multiple", "Other"] },
      { key: "side", en: "Side", ur: "طرف", type: "select", options: ["Left", "Right", "Both", "Not applicable"] },
      { key: "duration", en: "How long has the problem lasted?", ur: "مسئلہ کب سے ہے؟", type: "text" },
      { key: "hearingLoss", en: "Hearing loss", ur: "سماعت میں کمی", type: "select", options: ["None", "Mild", "Moderate", "Severe"] },
      { key: "discharge", en: "Ear / nasal discharge or bleeding", ur: "کان یا ناک سے رطوبت / خون", type: "select", options: YN },
      { key: "previousTreatment", en: "Previous ENT treatment / surgery", ur: "پچھلا علاج / سرجری", type: "textarea" },
      { key: "tests", en: "Hearing test / endoscopy / CT done", ur: "سماعت کا ٹیسٹ / اینڈوسکوپی / سی ٹی", type: "textarea" },
    ],
    ...disclaimer("ENT Consultancy", "کان ناک گلا کنسلٹینسی", "ENT specialist", "ماہرِ کان ناک گلا"),
  },
  dental: {
    key: "dental",
    en: "Dental Consultancy",
    ur: "ڈینٹل کنسلٹینسی",
    short: "Dental",
    prefix: "DN",
    doctorWord: "dentist",
    tagline: "Guidance for tooth pain, dental procedures, braces and implants.",
    taglineUr: "دانتوں کے درد، برسیز اور امپلانٹ کے لیے رہنمائی۔",
    caseCategories: ["Tooth Pain", "Cavity / Filling", "Root Canal", "Tooth Extraction", "Braces / Aligners", "Implant", "Gum Problem", "Child Dental Care", "Cosmetic / Whitening", "Other"],
    specialists: ["Orthodontics / Braces", "Implantology", "Endodontics / Root Canal", "Oral Surgery", "Pediatric Dentistry", "Cosmetic Dentistry", "General Dentistry", "Other"],
    packages: packages("Dental", "دانتوں کی دیکھ بھال"),
    questions: [
      { key: "problem", en: "Main dental problem", ur: "بنیادی مسئلہ", type: "select", options: ["Pain", "Broken / decayed tooth", "Gum bleeding / swelling", "Alignment / braces", "Missing tooth", "Cosmetic", "Other"] },
      { key: "duration", en: "How long has the problem lasted?", ur: "مسئلہ کب سے ہے؟", type: "text" },
      { key: "painScore", en: "Pain level (0–10)", ur: "درد کی شدت (0–10)", type: "select", options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
      { key: "swelling", en: "Swelling / pus", ur: "سوجن / پیپ", type: "select", options: YN },
      { key: "previousTreatment", en: "Previous dental treatment", ur: "پچھلا ڈینٹل علاج", type: "textarea" },
      { key: "xray", en: "Dental X-ray available", ur: "ڈینٹل ایکسرے دستیاب", type: "select", options: YN },
      { key: "medical", en: "Diabetes / heart condition / blood thinner", ur: "ذیابیطس / دل کی بیماری / خون پتلا کرنے کی دوا", type: "text" },
    ],
    ...disclaimer("Dental Consultancy", "ڈینٹل کنسلٹینسی", "dentist", "دانتوں کے ڈاکٹر"),
  },
  diabetes: {
    key: "diabetes",
    en: "Diabetes Care Consultancy",
    ur: "ذیابیطس کیئر کنسلٹینسی",
    short: "Diabetes Care",
    prefix: "DI",
    doctorWord: "diabetologist",
    tagline: "Guidance for sugar control, diabetes complications and specialist care.",
    taglineUr: "شوگر کنٹرول اور ذیابیطس کے ماہرین تک رسائی کے لیے رہنمائی۔",
    caseCategories: ["Newly Diagnosed", "Uncontrolled Sugar", "Insulin Guidance", "Diabetic Foot", "Eye / Kidney Complication", "Pregnancy with Diabetes", "Child Diabetes", "Routine Review", "Other"],
    specialists: ["Diabetology", "Endocrinology", "Diabetic Foot Care", "Diabetic Eye / Retina", "Nephrology", "General Physician", "Other"],
    packages: packages("Diabetes Care", "ذیابیطس کی دیکھ بھال"),
    questions: [
      { key: "diagnosis", en: "Diabetes type / since when", ur: "ذیابیطس کی قسم / کب سے", type: "text" },
      { key: "lastSugar", en: "Latest sugar readings (fasting / random / HbA1c)", ur: "تازہ شوگر ریڈنگ (فاسٹنگ / رینڈم / HbA1c)", type: "textarea" },
      { key: "medications", en: "Current medicines / insulin", ur: "موجودہ ادویات / انسولین", type: "textarea" },
      { key: "complications", en: "Complications (eyes / kidneys / feet / nerves)", ur: "پیچیدگیاں (آنکھیں / گردے / پاؤں / اعصاب)", type: "textarea" },
      { key: "otherConditions", en: "Blood pressure / cholesterol / other conditions", ur: "بلڈ پریشر / کولیسٹرول / دیگر بیماریاں", type: "text" },
      { key: "diet", en: "Current diet routine", ur: "موجودہ خوراک", type: "text" },
    ],
    ...disclaimer("Diabetes Care Consultancy", "ذیابیطس کیئر کنسلٹینسی", "diabetologist", "ماہرِ ذیابیطس"),
  },
  general: {
    key: "general",
    en: "General Medical Consultancy",
    ur: "جنرل میڈیکل کنسلٹینسی",
    short: "General Medical",
    prefix: "GM",
    doctorWord: "doctor",
    tagline: "Guidance for general health problems, tests, reports and the right specialist.",
    taglineUr: "عام طبی مسائل، ٹیسٹس اور مناسب ماہر تک رسائی کے لیے رہنمائی۔",
    caseCategories: ["Fever / Infection", "Weakness / Fatigue", "Stomach / Digestion", "Blood Pressure", "Report Review", "Second Opinion", "Surgery Advice", "Routine Check-up", "Other"],
    specialists: ["Internal Medicine", "General Surgery", "Family Medicine", "Gastroenterology", "Pulmonology", "General Physician", "Other"],
    packages: packages("General Medical", "جنرل میڈیکل"),
    questions: [
      { key: "mainComplaint", en: "Main health problem", ur: "بنیادی طبی مسئلہ", type: "textarea" },
      { key: "duration", en: "How long has the problem lasted?", ur: "مسئلہ کب سے ہے؟", type: "text" },
      { key: "fever", en: "Fever", ur: "بخار", type: "select", options: YN },
      { key: "existingConditions", en: "Existing conditions (diabetes / BP / asthma etc.)", ur: "موجودہ بیماریاں (ذیابیطس / بلڈ پریشر وغیرہ)", type: "text" },
      { key: "medications", en: "Current medicines", ur: "موجودہ ادویات", type: "textarea" },
      { key: "reports", en: "Lab tests / reports available", ur: "لیب ٹیسٹ / رپورٹس دستیاب", type: "select", options: YN },
      { key: "specialistNeeded", en: "Which specialist are you looking for?", ur: "کس ماہر کی تلاش ہے؟", type: "text" },
    ],
    ...disclaimer("General Medical Consultancy", "جنرل میڈیکل کنسلٹینسی", "doctor", "مستند ڈاکٹر"),
  },
};

export const SPECIALTY_KEYS = Object.keys(SPECIALTIES) as SpecialtyKey[];

export function isSpecialtyKey(v: string): v is SpecialtyKey {
  return v in SPECIALTIES;
}
