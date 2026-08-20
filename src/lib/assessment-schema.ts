export type AssessmentType = "child" | "female" | "male";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "tel"
  | "email"
  | "textarea"
  | "select"
  | "radio"
  | "checkboxes"
  | "consent";

export interface FieldDef {
  id: string;
  en: string;
  ur: string;
  type: FieldType;
  options?: { en: string; ur: string }[];
  required?: boolean;
  unit?: string;
  placeholder?: string;
  full?: boolean;
  help?: string;
}

export interface SectionDef {
  id: string;
  en: string;
  ur: string;
  icon: string;
  fields: FieldDef[];
}

const yesNo = [
  { en: "Yes", ur: "جی ہاں" },
  { en: "No", ur: "نہیں" },
];

const o = (...pairs: [string, string][]) => pairs.map(([en, ur]) => ({ en, ur }));

export const TYPE_META: Record<
  AssessmentType,
  { en: string; ur: string; tone: string; blurb: string; icon: string }
> = {
  child: {
    en: "Child",
    ur: "بچہ / بچی",
    tone: "child",
    blurb: "For children and teenagers under 18 years.",
    icon: "child",
  },
  female: {
    en: "Female",
    ur: "خواتین",
    tone: "female",
    blurb: "For women 18 years and above.",
    icon: "female",
  },
  male: {
    en: "Male",
    ur: "مرد",
    tone: "male",
    blurb: "For men 18 years and above.",
    icon: "male",
  },
};

function basicSection(type: AssessmentType): SectionDef {
  const fields: FieldDef[] = [
    { id: "full_name", en: "Full Name", ur: "پورا نام", type: "text", required: true },
    { id: "date_of_visit", en: "Date of Assessment", ur: "تاریخِ معائنہ", type: "date", required: true },
    { id: "age", en: "Age (years)", ur: "عمر (سال)", type: "number", required: true },
    { id: "date_of_birth", en: "Date of Birth", ur: "تاریخ پیدائش", type: "date" },
    {
      id: "sex",
      en: "Sex",
      ur: "جنس",
      type: "radio",
      required: true,
      options: type === "child" ? o(["Boy", "لڑکا"], ["Girl", "لڑکی"]) : type === "female" ? o(["Female", "خاتون"]) : o(["Male", "مرد"]),
    },
    { id: "phone", en: "Mobile Number", ur: "موبائل نمبر", type: "tel", required: true },
    { id: "email", en: "Email (optional)", ur: "ای میل (اختیاری)", type: "email" },
    { id: "city", en: "City / Area", ur: "شہر / علاقہ", type: "text", required: true },
    { id: "address", en: "Address", ur: "پتہ", type: "textarea", full: true },
  ];
  if (type === "child") {
    fields.splice(5, 0, { id: "school", en: "School / Class", ur: "اسکول / جماعت", type: "text" });
    fields.splice(6, 0, { id: "guardian_name_quick", en: "Guardian Name", ur: "سرپرست کا نام", type: "text", required: true });
  } else {
    fields.splice(5, 0, { id: "occupation", en: "Occupation", ur: "پیشہ", type: "text" });
    fields.splice(6, 0, {
      id: "marital_status",
      en: "Marital Status",
      ur: "ازدواجی حیثیت",
      type: "select",
      options: o(["Single", "غیر شادی شدہ"], ["Married", "شادی شدہ"], ["Divorced", "طلاق یافتہ"], ["Widowed", "بیوہ / رنڈوا"]),
    });
  }
  return { id: "basic", en: "Basic Information", ur: "بنیادی معلومات", icon: "user", fields };
}

const measurementsSection: SectionDef = {
  id: "measurements",
  en: "Weight, Height & BMI",
  ur: "وزن، قد اور بی ایم آئی",
  icon: "scale",
  fields: [
    { id: "weight_kg", en: "Current Weight", ur: "موجودہ وزن", type: "number", unit: "kg", required: true },
    { id: "height_cm", en: "Height", ur: "قد", type: "number", unit: "cm", required: true },
    { id: "bmi", en: "BMI (auto calculated)", ur: "بی ایم آئی (خودکار)", type: "text" },
    { id: "target_weight_kg", en: "Target Weight", ur: "ہدف وزن", type: "number", unit: "kg" },
    { id: "waist_cm", en: "Waist", ur: "کمر", type: "number", unit: "cm" },
    { id: "hip_cm", en: "Hip", ur: "کولہا", type: "number", unit: "cm" },
    { id: "blood_pressure", en: "Blood Pressure", ur: "بلڈ پریشر", type: "text", placeholder: "120/80" },
    { id: "blood_group", en: "Blood Group", ur: "بلڈ گروپ", type: "text" },
  ],
};

const weightHistorySection: SectionDef = {
  id: "weight_history",
  en: "Weight & Health History",
  ur: "وزن اور صحت کی تاریخ",
  icon: "history",
  fields: [
    { id: "highest_weight", en: "Highest Weight Ever", ur: "زیادہ سے زیادہ وزن", type: "number", unit: "kg" },
    { id: "lowest_weight", en: "Lowest Weight (adult)", ur: "کم سے کم وزن", type: "number", unit: "kg" },
    {
      id: "weight_trend",
      en: "Weight in the last 6 months",
      ur: "پچھلے 6 ماہ میں وزن",
      type: "radio",
      options: o(["Increased", "بڑھا"], ["Decreased", "کم ہوا"], ["Stable", "مستحکم"]),
    },
    { id: "weight_change_kg", en: "Amount of change", ur: "تبدیلی کی مقدار", type: "number", unit: "kg" },
    { id: "when_gained", en: "When did weight gain start?", ur: "وزن بڑھنا کب شروع ہوا؟", type: "text" },
    {
      id: "tried_before",
      en: "Tried weight programs before?",
      ur: "پہلے کوئی پروگرام آزمایا؟",
      type: "radio",
      options: yesNo,
    },
    { id: "tried_details", en: "If yes, what and result", ur: "اگر ہاں تو کیا اور نتیجہ", type: "textarea", full: true },
    { id: "main_goal", en: "Main goal of this assessment", ur: "اس معائنے کا بنیادی مقصد", type: "textarea", full: true },
  ],
};

function medicalSection(type: AssessmentType): SectionDef {
  const conditions = o(
    ["Diabetes", "ذیابیطس"],
    ["High Blood Pressure", "بلند فشارِ خون"],
    ["Thyroid Disorder", "تھائیرائیڈ"],
    ["Heart Disease", "امراضِ قلب"],
    ["Asthma / Chest issues", "دمہ / سینے کے مسائل"],
    ["Liver Disease", "جگر کی بیماری"],
    ["Kidney Disease", "گردے کی بیماری"],
    ["Digestive / IBS", "معدہ / آنتوں کے مسائل"],
    ["Joint / Back Pain", "جوڑوں / کمر کا درد"],
    ["Anemia", "خون کی کمی"],
    ["Vitamin D Deficiency", "وٹامن ڈی کی کمی"],
    ["Skin Problems", "جلدی مسائل"],
    ["Anxiety / Depression", "پریشانی / ڈپریشن"],
    ["None", "کوئی نہیں"],
  );
  const fields: FieldDef[] = [
    { id: "conditions", en: "Diagnosed conditions", ur: "تشخیص شدہ بیماریاں", type: "checkboxes", options: conditions, full: true },
    { id: "other_conditions", en: "Other conditions", ur: "دیگر بیماریاں", type: "text", full: true },
    { id: "surgeries", en: "Past surgeries / hospitalisation", ur: "ماضی کے آپریشن / اسپتال", type: "textarea", full: true },
    {
      id: "family_history",
      en: "Family history",
      ur: "خاندانی تاریخ",
      type: "checkboxes",
      full: true,
      options: o(
        ["Obesity", "موٹاپا"],
        ["Diabetes", "ذیابیطس"],
        ["Hypertension", "بلڈ پریشر"],
        ["Heart Disease", "امراضِ قلب"],
        ["Thyroid", "تھائیرائیڈ"],
        ["Cancer", "کینسر"],
        ["None", "کوئی نہیں"],
      ),
    },
    { id: "recent_labs", en: "Recent lab reports / values", ur: "حالیہ لیب رپورٹس", type: "textarea", full: true },
  ];
  if (type === "child") {
    fields.unshift(
      {
        id: "birth_type",
        en: "Birth type",
        ur: "پیدائش کی نوعیت",
        type: "radio",
        options: o(["Normal", "نارمل"], ["C-Section", "آپریشن"]),
      },
      { id: "birth_weight", en: "Birth weight", ur: "پیدائشی وزن", type: "number", unit: "kg" },
      {
        id: "vaccination",
        en: "Vaccination up to date?",
        ur: "حفاظتی ٹیکے مکمل؟",
        type: "radio",
        options: yesNo,
      },
      {
        id: "growth_concern",
        en: "Any growth / development concern",
        ur: "نشوونما سے متعلق تشویش",
        type: "text",
        full: true,
      },
    );
  }
  return { id: "medical", en: "Medical History", ur: "طبی تاریخ", icon: "stethoscope", fields };
}

const medicationsSection: SectionDef = {
  id: "medications",
  en: "Medications & Supplements",
  ur: "ادویات اور سپلیمنٹس",
  icon: "pill",
  fields: [
    { id: "on_medication", en: "Currently taking medicines?", ur: "کیا آپ ادویات لے رہے ہیں؟", type: "radio", options: yesNo },
    { id: "medication_list", en: "Medicine names & doses", ur: "ادویات کے نام اور مقدار", type: "textarea", full: true },
    { id: "supplements", en: "Supplements / vitamins", ur: "سپلیمنٹس / وٹامنز", type: "textarea", full: true },
    { id: "drug_allergies", en: "Medicine allergies", ur: "ادویات سے الرجی", type: "text", full: true },
  ],
};

const foodSection: SectionDef = {
  id: "food",
  en: "Daily Food Habits",
  ur: "روزمرہ کھانے کی عادات",
  icon: "utensils",
  fields: [
    { id: "breakfast", en: "Typical breakfast", ur: "عام ناشتہ", type: "textarea", full: true },
    { id: "lunch", en: "Typical lunch", ur: "عام دوپہر کا کھانا", type: "textarea", full: true },
    { id: "dinner", en: "Typical dinner", ur: "عام رات کا کھانا", type: "textarea", full: true },
    { id: "snacks", en: "Snacks between meals", ur: "کھانوں کے درمیان اسنیکس", type: "textarea", full: true },
    { id: "meals_per_day", en: "Meals per day", ur: "روزانہ کھانے کی تعداد", type: "number" },
    { id: "water_glasses", en: "Water per day (glasses)", ur: "روزانہ پانی (گلاس)", type: "number" },
    { id: "tea_coffee", en: "Tea / coffee per day (cups)", ur: "چائے / کافی (کپ)", type: "number" },
    {
      id: "eating_out",
      en: "Outside / fast food frequency",
      ur: "باہر کا کھانا کتنی بار",
      type: "select",
      options: o(["Daily", "روزانہ"], ["2-3 times a week", "ہفتے میں 2-3 بار"], ["Weekly", "ہفتہ وار"], ["Rarely", "کبھی کبھار"], ["Never", "کبھی نہیں"]),
    },
    {
      id: "sugary_drinks",
      en: "Soft drinks / juices",
      ur: "کولڈ ڈرنکس / جوس",
      type: "select",
      options: o(["Daily", "روزانہ"], ["Few times a week", "ہفتے میں چند بار"], ["Rarely", "کبھی کبھار"], ["Never", "کبھی نہیں"]),
    },
    {
      id: "food_habits",
      en: "Habits that apply",
      ur: "لاگو ہونے والی عادات",
      type: "checkboxes",
      full: true,
      options: o(
        ["Skipping breakfast", "ناشتہ چھوڑنا"],
        ["Late night eating", "رات دیر سے کھانا"],
        ["Emotional / stress eating", "پریشانی میں کھانا"],
        ["Fast eating", "جلدی کھانا"],
        ["Large portions", "زیادہ مقدار"],
        ["Frequent sweets", "میٹھا زیادہ"],
        ["Frequent fried food", "تلی ہوئی اشیاء"],
      ),
    },
  ],
};

function lifestyleSection(type: AssessmentType): SectionDef {
  const fields: FieldDef[] = [
    {
      id: "activity_level",
      en: "Activity level",
      ur: "جسمانی سرگرمی کی سطح",
      type: "radio",
      options: o(["Sedentary", "بہت کم"], ["Light", "ہلکی"], ["Moderate", "درمیانی"], ["Very active", "بہت زیادہ"]),
    },
    { id: "exercise_type", en: "Type of exercise / sports", ur: "ورزش / کھیل کی قسم", type: "text" },
    { id: "exercise_minutes", en: "Exercise per day (minutes)", ur: "روزانہ ورزش (منٹ)", type: "number" },
    { id: "sleep_hours", en: "Sleep per night (hours)", ur: "رات کی نیند (گھنٹے)", type: "number" },
    {
      id: "sleep_quality",
      en: "Sleep quality",
      ur: "نیند کا معیار",
      type: "select",
      options: o(["Good", "اچھی"], ["Average", "درمیانی"], ["Poor", "خراب"]),
    },
    { id: "screen_hours", en: "Screen time per day (hours)", ur: "اسکرین ٹائم (گھنٹے)", type: "number" },
    {
      id: "stress_level",
      en: "Stress level",
      ur: "ذہنی دباؤ",
      type: "select",
      options: o(["Low", "کم"], ["Moderate", "درمیانہ"], ["High", "زیادہ"]),
    },
  ];
  if (type === "child") {
    fields.push({
      id: "outdoor_play",
      en: "Outdoor play per day (hours)",
      ur: "باہر کھیلنے کا وقت (گھنٹے)",
      type: "number",
    });
  } else {
    fields.push({
      id: "smoking",
      en: "Smoking / tobacco / paan",
      ur: "تمباکو نوشی / پان",
      type: "radio",
      options: yesNo,
    });
  }
  return { id: "lifestyle", en: "Lifestyle, Activity & Sleep", ur: "طرزِ زندگی، سرگرمی اور نیند", icon: "activity", fields };
}

const dietPrefSection: SectionDef = {
  id: "diet_pref",
  en: "Dietary Preferences & Allergies",
  ur: "غذائی ترجیحات اور الرجی",
  icon: "leaf",
  fields: [
    {
      id: "diet_type",
      en: "Diet type",
      ur: "غذا کی قسم",
      type: "radio",
      options: o(["Regular (mixed)", "عام (مخلوط)"], ["Vegetarian", "سبزی خور"], ["Mostly meat", "زیادہ تر گوشت"], ["Other", "دیگر"]),
    },
    {
      id: "food_allergies",
      en: "Food allergies / intolerance",
      ur: "غذائی الرجی",
      type: "checkboxes",
      full: true,
      options: o(
        ["Milk / Dairy", "دودھ"],
        ["Eggs", "انڈے"],
        ["Nuts", "خشک میوہ جات"],
        ["Wheat / Gluten", "گندم / گلوٹن"],
        ["Seafood", "سمندری غذا"],
        ["Soy", "سویا"],
        ["None", "کوئی نہیں"],
      ),
    },
    { id: "disliked_foods", en: "Foods you dislike", ur: "ناپسندیدہ غذائیں", type: "text", full: true },
    { id: "favourite_foods", en: "Favourite foods", ur: "پسندیدہ غذائیں", type: "text", full: true },
  ],
};

const femaleHealthSection: SectionDef = {
  id: "female_health",
  en: "Women's Health Details",
  ur: "خواتین کی صحت سے متعلق تفصیلات",
  icon: "heart",
  fields: [
    {
      id: "menstrual_status",
      en: "Menstrual status",
      ur: "ماہواری کی حالت",
      type: "radio",
      options: o(["Regular", "باقاعدہ"], ["Irregular", "بے قاعدہ"], ["Perimenopause", "ماہواری کا اختتامی دور"], ["Menopause", "سنِ یاس"]),
    },
    { id: "cycle_length", en: "Cycle length (days)", ur: "ماہواری کا دورانیہ (دن)", type: "number" },
    { id: "last_period", en: "Last period date", ur: "آخری ماہواری کی تاریخ", type: "date" },
    { id: "menopause_age", en: "Age at menopause (if any)", ur: "سنِ یاس کی عمر", type: "number" },
    { id: "pcos", en: "Diagnosed with PCOS?", ur: "پی سی او ایس کی تشخیص؟", type: "radio", options: yesNo },
    { id: "pcos_details", en: "PCOS details / treatment", ur: "پی سی او ایس تفصیل", type: "text", full: true },
    { id: "pregnancies", en: "Number of pregnancies", ur: "حملوں کی تعداد", type: "number" },
    { id: "deliveries", en: "Number of deliveries", ur: "ولادتوں کی تعداد", type: "number" },
    { id: "miscarriages", en: "Miscarriages", ur: "اسقاطِ حمل", type: "number" },
    { id: "currently_pregnant", en: "Currently pregnant?", ur: "کیا اس وقت حاملہ ہیں؟", type: "radio", options: yesNo },
    { id: "pregnancy_weeks", en: "If pregnant, weeks", ur: "اگر حاملہ ہیں تو ہفتے", type: "number" },
    { id: "breastfeeding", en: "Currently breastfeeding?", ur: "کیا دودھ پلا رہی ہیں؟", type: "radio", options: yesNo },
    { id: "baby_age", en: "Baby's age (months)", ur: "بچے کی عمر (ماہ)", type: "number" },
    { id: "contraception", en: "Contraception / hormonal therapy", ur: "مانع حمل / ہارمون تھراپی", type: "text", full: true },
    { id: "anemia_female", en: "Anemia / low hemoglobin?", ur: "خون کی کمی؟", type: "radio", options: yesNo },
    { id: "hemoglobin", en: "Hemoglobin value (if known)", ur: "ہیموگلوبن (اگر معلوم ہو)", type: "text" },
    { id: "vitamin_d_female", en: "Vitamin D deficiency?", ur: "وٹامن ڈی کی کمی؟", type: "radio", options: yesNo },
    { id: "vitamin_d_value", en: "Vitamin D value (if known)", ur: "وٹامن ڈی لیول", type: "text" },
    { id: "thyroid_female", en: "Thyroid problem?", ur: "تھائیرائیڈ کا مسئلہ؟", type: "radio", options: yesNo },
    {
      id: "female_symptoms",
      en: "Symptoms present",
      ur: "موجود علامات",
      type: "checkboxes",
      full: true,
      options: o(
        ["Hair fall", "بال گرنا"],
        ["Acne", "کیل مہاسے"],
        ["Facial hair", "چہرے کے بال"],
        ["Fatigue", "تھکاوٹ"],
        ["Mood swings", "مزاج کی تبدیلی"],
        ["Painful periods", "ماہواری میں درد"],
        ["Hot flashes", "گرمی کے جھٹکے"],
        ["None", "کوئی نہیں"],
      ),
    },
    { id: "female_notes", en: "Other gynae / hormonal details", ur: "دیگر ہارمونی تفصیلات", type: "textarea", full: true },
  ],
};

const maleHealthSection: SectionDef = {
  id: "male_health",
  en: "Men's Health Details",
  ur: "مردوں کی صحت سے متعلق تفصیلات",
  icon: "heart",
  fields: [
    { id: "energy_level", en: "Daily energy level", ur: "روزانہ توانائی کی سطح", type: "select", options: o(["Good", "اچھی"], ["Average", "درمیانی"], ["Low", "کم"]) },
    { id: "work_shift", en: "Work shift / timing", ur: "کام کی شفٹ", type: "select", options: o(["Day", "دن"], ["Night", "رات"], ["Rotating", "بدلتی ہوئی"], ["Not working", "کام نہیں"]) },
    { id: "gym_supplements", en: "Gym / protein supplements used", ur: "جم / پروٹین سپلیمنٹس", type: "text", full: true },
    { id: "prostate_urinary", en: "Prostate / urinary issues?", ur: "پروسٹیٹ / پیشاب کے مسائل؟", type: "radio", options: yesNo },
    { id: "testosterone", en: "Low testosterone / hormonal treatment?", ur: "ٹیسٹوسٹیرون / ہارمون علاج؟", type: "radio", options: yesNo },
    { id: "snoring_apnea", en: "Snoring / sleep apnea?", ur: "خراٹے / نیند میں سانس رکنا؟", type: "radio", options: yesNo },
    { id: "anemia_male", en: "Anemia / low hemoglobin?", ur: "خون کی کمی؟", type: "radio", options: yesNo },
    { id: "vitamin_d_male", en: "Vitamin D deficiency?", ur: "وٹامن ڈی کی کمی؟", type: "radio", options: yesNo },
    { id: "cholesterol", en: "High cholesterol / fatty liver?", ur: "کولیسٹرول / فیٹی لیور؟", type: "radio", options: yesNo },
    {
      id: "male_symptoms",
      en: "Symptoms present",
      ur: "موجود علامات",
      type: "checkboxes",
      full: true,
      options: o(
        ["Fatigue", "تھکاوٹ"],
        ["Hair fall", "بال گرنا"],
        ["Shortness of breath", "سانس پھولنا"],
        ["Joint pain", "جوڑوں کا درد"],
        ["Heartburn", "سینے کی جلن"],
        ["Excess sweating", "زیادہ پسینہ"],
        ["None", "کوئی نہیں"],
      ),
    },
    { id: "male_notes", en: "Other medical details", ur: "دیگر طبی تفصیلات", type: "textarea", full: true },
  ],
};

const guardianSection: SectionDef = {
  id: "guardian",
  en: "Parent / Guardian Information",
  ur: "والدین / سرپرست کی معلومات",
  icon: "users",
  fields: [
    { id: "guardian_name", en: "Guardian full name", ur: "سرپرست کا پورا نام", type: "text", required: true },
    {
      id: "guardian_relation",
      en: "Relationship to child",
      ur: "بچے سے رشتہ",
      type: "select",
      required: true,
      options: o(["Mother", "والدہ"], ["Father", "والد"], ["Grandparent", "دادا / نانا"], ["Other", "دیگر"]),
    },
    { id: "guardian_phone", en: "Guardian mobile number", ur: "سرپرست کا موبائل نمبر", type: "tel", required: true },
    { id: "guardian_occupation", en: "Guardian occupation", ur: "سرپرست کا پیشہ", type: "text" },
    { id: "mother_weight_issue", en: "Mother has weight/health issues?", ur: "والدہ میں وزن/صحت کے مسائل؟", type: "radio", options: yesNo },
    { id: "father_weight_issue", en: "Father has weight/health issues?", ur: "والد میں وزن/صحت کے مسائل؟", type: "radio", options: yesNo },
    { id: "siblings", en: "Number of siblings", ur: "بہن بھائیوں کی تعداد", type: "number" },
  ],
};

const consentSection: SectionDef = {
  id: "consent",
  en: "Notes & Consent",
  ur: "نوٹس اور رضامندی",
  icon: "shield",
  fields: [
    { id: "additional_notes", en: "Anything else we should know?", ur: "کوئی اور بات جو ہمیں معلوم ہونی چاہیے؟", type: "textarea", full: true },
    { id: "how_heard", en: "How did you hear about AL-ATASH FIT?", ur: "آپ نے ال عطش فٹ کے بارے میں کیسے سنا؟", type: "text", full: true },
    {
      id: "consent_accurate",
      en: "I confirm the information above is accurate to the best of my knowledge.",
      ur: "میں تصدیق کرتا/کرتی ہوں کہ دی گئی معلومات درست ہیں۔",
      type: "consent",
      required: true,
      full: true,
    },
    {
      id: "consent_contact",
      en: "I allow AL-ATASH FIT to contact me about this assessment.",
      ur: "میں ال عطش فٹ کو رابطے کی اجازت دیتا/دیتی ہوں۔",
      type: "consent",
      required: true,
      full: true,
    },
    { id: "signature_name", en: "Signature (type full name)", ur: "دستخط (پورا نام لکھیں)", type: "text", required: true, full: true },
  ],
};

export function getSections(type: AssessmentType): SectionDef[] {
  const base: SectionDef[] = [
    basicSection(type),
    measurementsSection,
    weightHistorySection,
    medicalSection(type),
    medicationsSection,
    foodSection,
    lifestyleSection(type),
    dietPrefSection,
  ];
  if (type === "female") base.push(femaleHealthSection);
  if (type === "male") base.push(maleHealthSection);
  if (type === "child") base.push(guardianSection);
  base.push(consentSection);
  return base;
}

export function allFields(type: AssessmentType): FieldDef[] {
  return getSections(type).flatMap((s) => s.fields);
}

export function calculateBmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm || heightCm < 30 || weightKg < 2) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number, type: AssessmentType) {
  if (type === "child") return { en: "Child BMI must be read against growth charts", ur: "بچوں کا بی ایم آئی گروتھ چارٹ سے دیکھا جاتا ہے" };
  if (bmi < 18.5) return { en: "Underweight", ur: "کم وزن" };
  if (bmi < 25) return { en: "Normal", ur: "نارمل" };
  if (bmi < 30) return { en: "Overweight", ur: "زائد وزن" };
  return { en: "Obese", ur: "موٹاپا" };
}