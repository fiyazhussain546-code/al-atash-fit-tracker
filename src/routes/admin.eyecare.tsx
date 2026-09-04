import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Eye,
  Loader2,
  MessageCircle,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, Field, Modal, Pill, Select, TextArea, TextInput } from "@/components/eyecare-ui";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  CASE_STATUS_UR,
  CONSULTATION_STATUSES,
  DISCLAIMER_EN,
  DISCLAIMER_UR,
  DOCUMENT_CATEGORIES,
  GENDERS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRIORITIES,
  SERVICE_PACKAGES,
  SPECIALISTS,
  TRAVEL_PREFERENCES,
  YES_NO,
  YES_NO_RECOMMENDED,
  YES_NO_UNCONFIRMED,
  emptyEyeCareData,
  isValidWhatsapp,
  waLink,
  type EyeCareData,
  type EyePatient,
} from "@/lib/eyecare";
import {
  eyecareArchivePatient,
  eyecareDelete,
  eyecareLoad,
  eyecareSaveAppointment,
  eyecareSaveAssessment,
  eyecareSaveDoctor,
  eyecareSaveDocument,
  eyecareSaveFollowup,
  eyecareSavePatient,
  eyecareSaveRecommendation,
  eyecareSaveService,
} from "@/lib/eyecare.functions";

export const Route = createFileRoute("/admin/eyecare")({
  head: () => ({
    meta: [
      { title: "Eye Care Consultancy — AL-ATASH FIT Admin" },
      { name: "description", content: "Private Eye Care Consultancy case management for the AL-ATASH FIT team." },
      { property: "og:title", content: "Eye Care Consultancy — AL-ATASH FIT Admin" },
      { property: "og:description", content: "Private staff area. Authorised AL-ATASH FIT team members only." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EyeCareAdmin,
});

const TOKEN_KEY = "alatash_admin_token";
const today = () => new Date().toISOString().slice(0, 10);

type Tab = "dashboard" | "patients" | "doctors" | "appointments" | "followups" | "payments";

const TABS: { key: Tab; en: string; ur: string }[] = [
  { key: "dashboard", en: "Dashboard", ur: "ڈیش بورڈ" },
  { key: "patients", en: "Patients", ur: "مریض" },
  { key: "doctors", en: "Doctors & Centres", ur: "ڈاکٹرز اور سینٹرز" },
  { key: "appointments", en: "Appointments", ur: "اپائنٹمنٹس" },
  { key: "followups", en: "Follow-ups", ur: "فالو اپ" },
  { key: "payments", en: "Services & Payments", ur: "سروسز اور ادائیگیاں" },
];

const emptyPatientForm = () => ({
  id: null as string | null,
  name: "",
  age: "",
  gender: "Male",
  whatsapp: "",
  city: "",
  attendantName: "",
  relationship: "",
  mainProblem: "",
  caseCategory: "Vision Problem",
  priority: "Normal",
  preferredCity: "",
  budgetPreference: "",
  servicePackage: SERVICE_PACKAGES[0].key as string,
  caseStatus: "New",
  registrationDate: today(),
  notes: "",
});
type PatientForm = ReturnType<typeof emptyPatientForm>;

function csvEscape(v: string) {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}

function EyeCareAdmin() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<EyeCareData>(emptyEyeCareData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [openPatient, setOpenPatient] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState<PatientForm | null>(null);

  const load = useServerFn(eyecareLoad);

  useEffect(() => {
    const t = typeof window === "undefined" ? "" : localStorage.getItem(TOKEN_KEY) ?? "";
    setToken(t);
    if (!t) {
      setLoading(false);
      setError("Please sign in from the staff dashboard first.");
    }
  }, []);

  const refresh = useCallback(
    async (t = token) => {
      if (!t) return;
      setLoading(true);
      const res = await load({ data: { token: t } });
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError("");
      setData(res.data as EyeCareData);
    },
    [load, token],
  );

  useEffect(() => {
    if (token) void refresh(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  };

  const cities = useMemo(
    () => Array.from(new Set(data.patients.map((p) => p.city).filter(Boolean))).sort(),
    [data.patients],
  );

  const patients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.patients.filter((p) => {
      if (p.archived) return false;
      if (statusFilter !== "All" && p.caseStatus !== statusFilter) return false;
      if (priorityFilter !== "All" && p.priority !== priorityFilter) return false;
      if (cityFilter !== "All" && p.city !== cityFilter) return false;
      if (!q) return true;
      return [p.patientId, p.name, p.whatsapp, p.city].some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [data.patients, search, statusFilter, priorityFilter, cityFilter]);

  const savePatientFn = useServerFn(eyecareSavePatient);
  const archiveFn = useServerFn(eyecareArchivePatient);

  async function submitPatient(form: PatientForm) {
    if (!form.name.trim()) return "Patient name is required — مریض کا نام لازمی ہے";
    if (form.age && (Number.isNaN(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120))
      return "Enter a valid age — درست عمر درج کریں";
    if (!isValidWhatsapp(form.whatsapp)) return "Enter a valid WhatsApp number — درست واٹس ایپ نمبر درج کریں";
    const res = await savePatientFn({ data: { token, patient: form } });
    if (!res.ok) return res.error;
    await refresh();
    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
    return "";
  }

  function exportCsv() {
    const head = [
      "Patient ID",
      "Name",
      "Age",
      "Gender",
      "WhatsApp",
      "City",
      "Main Problem",
      "Category",
      "Priority",
      "Service Package",
      "Case Status",
      "Registration Date",
    ];
    const rows = patients.map((p) =>
      [
        p.patientId,
        p.name,
        p.age,
        p.gender,
        p.whatsapp,
        p.city,
        p.mainProblem,
        p.caseCategory,
        p.priority,
        p.servicePackage,
        p.caseStatus,
        p.registrationDate,
      ]
        .map(csvEscape)
        .join(","),
    );
    const blob = new Blob([[head.map(csvEscape).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eyecare-patients-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const counts = useMemo(() => {
    const active = data.patients.filter((p) => !p.archived);
    const by = (s: string) => active.filter((p) => p.caseStatus === s).length;
    return {
      total: active.length,
      New: by("New"),
      Assessment: by("Assessment"),
      Appointment: by("Appointment"),
      "Treatment Planned": by("Treatment Planned"),
      "Follow-up": by("Follow-up"),
      Completed: by("Completed"),
      pendingPayments: data.services.filter((s) => s.paymentStatus === "Pending").length,
    };
  }, [data]);

  const upcomingFollowups = useMemo(
    () =>
      data.followups
        .filter((f) => !f.completed && f.nextFollowup)
        .sort((a, b) => a.nextFollowup.localeCompare(b.nextFollowup))
        .slice(0, 8),
    [data.followups],
  );

  const pendingAppointments = useMemo(
    () => data.appointments.filter((a) => a.status === "Requested" || a.status === "Pending").slice(0, 8),
    [data.appointments],
  );

  const nameOf = (uid: string) => data.patients.find((p) => p.id === uid)?.name ?? "—";
  const pidOf = (uid: string) => data.patients.find((p) => p.id === uid)?.patientId ?? "";

  if (!token && !loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-soft/40 p-6">
        <div className="w-full max-w-sm rounded-3xl border bg-card p-6 text-center shadow-lg">
          <Logo className="justify-center" />
          <p className="mt-5 text-sm text-muted-foreground">
            Please sign in from the staff dashboard to open Eye Care Consultancy.
          </p>
          <Urdu className="mt-2 block text-sm text-muted-foreground">
            براہِ کرم پہلے اسٹاف ڈیش بورڈ میں سائن اِن کریں۔
          </Urdu>
          <Link
            to="/admin"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground"
          >
            Go to staff login
          </Link>
        </div>
      </main>
    );
  }

  const selected = data.patients.find((p) => p.id === openPatient) ?? null;

  return (
    <main className="min-h-screen bg-secondary/40 pb-16">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span className="hidden text-sm font-semibold text-brand-dark sm:inline">Eye Care Consultancy</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Weight Assessment
            </Link>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "min-h-10 whitespace-nowrap rounded-full px-4 text-xs font-semibold transition",
                  tab === t.key
                    ? "bg-brand text-primary-foreground"
                    : "border bg-background text-muted-foreground hover:bg-secondary",
                )}
              >
                {t.en}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {toast && (
          <div className="mb-4 rounded-2xl border border-brand/30 bg-brand-soft p-4 text-sm font-medium text-brand-dark">
            {toast}
          </div>
        )}
        {loading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading… لوڈ ہو رہا ہے…
          </div>
        )}

        {tab === "dashboard" && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total Patients", ur: "کل مریض", value: counts.total },
                { label: "New", ur: "نئے", value: counts.New },
                { label: "Assessment", ur: "جائزہ", value: counts.Assessment },
                { label: "Appointment", ur: "اپائنٹمنٹ", value: counts.Appointment },
                { label: "Treatment Planned", ur: "علاج طے شدہ", value: counts["Treatment Planned"] },
                { label: "Follow-up", ur: "فالو اپ", value: counts["Follow-up"] },
                { label: "Completed", ur: "مکمل", value: counts.Completed },
                { label: "Pending Payments", ur: "زیرِ التوا ادائیگیاں", value: counts.pendingPayments },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border bg-card p-4">
                  <p className="font-display text-2xl font-extrabold text-brand-dark">{c.value}</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{c.label}</p>
                  <Urdu className="block text-xs text-muted-foreground">{c.ur}</Urdu>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPatientForm(emptyPatientForm())} className="min-h-11">
                <Plus className="size-4" /> New Patient
              </Button>
              <Button variant="outline" className="min-h-11" onClick={() => setTab("appointments")}>
                <CalendarClock className="size-4" /> Appointments
              </Button>
              <Button variant="outline" className="min-h-11" onClick={() => setTab("followups")}>
                Follow-ups
              </Button>
              <Button variant="outline" className="min-h-11" onClick={() => setTab("payments")}>
                Payments
              </Button>
              <Button variant="outline" className="min-h-11" onClick={() => setTab("doctors")}>
                <Users className="size-4" /> Doctors
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Upcoming follow-ups" ur="آنے والے فالو اپ">
                {upcomingFollowups.length === 0 ? (
                  <EmptyState en="No upcoming follow-ups" ur="کوئی فالو اپ نہیں" />
                ) : (
                  <ul className="divide-y">
                    {upcomingFollowups.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <button className="text-left" onClick={() => setOpenPatient(f.patientUid)}>
                          <span className="font-medium text-foreground">{nameOf(f.patientUid)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{pidOf(f.patientUid)}</span>
                        </button>
                        <span className="text-xs text-muted-foreground">{f.nextFollowup}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Pending appointments" ur="زیرِ التوا اپائنٹمنٹس">
                {pendingAppointments.length === 0 ? (
                  <EmptyState en="No pending appointments" ur="کوئی اپائنٹمنٹ نہیں" />
                ) : (
                  <ul className="divide-y">
                    {pendingAppointments.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <button className="text-left" onClick={() => setOpenPatient(a.patientUid)}>
                          <span className="font-medium text-foreground">{nameOf(a.patientUid)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{a.doctorName}</span>
                        </button>
                        <Pill value={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Recent patients" ur="حالیہ مریض">
                {data.patients.length === 0 ? (
                  <EmptyState en="No patients found" ur="کوئی مریض نہیں ملا" />
                ) : (
                  <ul className="divide-y">
                    {data.patients.slice(0, 8).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <button className="text-left" onClick={() => setOpenPatient(p.id)}>
                          <span className="font-medium text-foreground">{p.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{p.patientId}</span>
                        </button>
                        <Pill value={p.caseStatus} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Pending payments" ur="زیرِ التوا ادائیگیاں">
                {data.services.filter((s) => s.paymentStatus !== "Paid").length === 0 ? (
                  <EmptyState en="No pending payments" ur="کوئی ادائیگی باقی نہیں" />
                ) : (
                  <ul className="divide-y">
                    {data.services
                      .filter((s) => s.paymentStatus !== "Paid")
                      .slice(0, 8)
                      .map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <button className="text-left" onClick={() => setOpenPatient(s.patientUid)}>
                            <span className="font-medium text-foreground">{nameOf(s.patientUid)}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{s.servicePackage}</span>
                          </button>
                          <Pill value={s.paymentStatus} />
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            </div>

            <Disclaimer />
          </section>
        )}

        {tab === "patients" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-52 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, name, WhatsApp, city…"
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={["All", ...CASE_STATUSES]}
                className="w-auto"
              />
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={["All", ...PRIORITIES]}
                className="w-auto"
              />
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                options={["All", ...cities]}
                className="w-auto"
              />
              <Button className="min-h-11" onClick={() => setPatientForm(emptyPatientForm())}>
                <Plus className="size-4" /> New Patient
              </Button>
              <Button variant="outline" className="min-h-11" onClick={exportCsv}>
                <Download className="size-4" /> CSV
              </Button>
            </div>

            {patients.length === 0 ? (
              <EmptyState en="No patients found" ur="کوئی مریض نہیں ملا" />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {patients.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setOpenPatient(p.id)}
                      className="w-full rounded-2xl border bg-card p-4 text-left transition hover:border-brand hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-bold text-foreground">{p.name}</p>
                          <p className="text-xs font-medium text-brand-dark">{p.patientId}</p>
                        </div>
                        <Pill value={p.priority} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.mainProblem || "—"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Pill value={p.caseStatus} />
                        <span className="text-xs text-muted-foreground">{p.city || "—"}</span>
                        <span className="text-xs text-muted-foreground">{p.servicePackage}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Disclaimer />
          </section>
        )}

        {tab === "doctors" && (
          <DoctorsTab token={token} data={data} onChanged={() => void refresh()} flash={flash} />
        )}

        {tab === "appointments" && (
          <ListTab
            title="Appointments"
            ur="اپائنٹمنٹس"
            empty={["No appointments found", "کوئی اپائنٹمنٹ نہیں ملی"]}
            rows={data.appointments.map((a) => ({
              id: a.id,
              patientUid: a.patientUid,
              primary: `${nameOf(a.patientUid)} — ${a.doctorName || "Doctor not set"}`,
              secondary: `${pidOf(a.patientUid)} · ${a.appointmentDate || "date TBC"} ${a.appointmentTime} · ${a.appointmentType}`,
              status: a.status,
            }))}
            onOpen={setOpenPatient}
          />
        )}

        {tab === "followups" && (
          <ListTab
            title="Follow-ups"
            ur="فالو اپ"
            empty={["No follow-ups found", "کوئی فالو اپ نہیں ملا"]}
            rows={data.followups.map((f) => ({
              id: f.id,
              patientUid: f.patientUid,
              primary: nameOf(f.patientUid),
              secondary: `${pidOf(f.patientUid)} · ${f.followupDate || "—"} · next: ${f.nextFollowup || "—"}`,
              status: f.completed ? "Completed" : f.consultationStatus,
            }))}
            onOpen={setOpenPatient}
          />
        )}

        {tab === "payments" && (
          <ListTab
            title="Services & Payments"
            ur="سروسز اور ادائیگیاں"
            empty={["No service records found", "کوئی سروس ریکارڈ نہیں ملا"]}
            rows={data.services.map((s) => ({
              id: s.id,
              patientUid: s.patientUid,
              primary: `${nameOf(s.patientUid)} — ${s.servicePackage}`,
              secondary: `${pidOf(s.patientUid)} · PKR ${s.fee} · ${s.paymentMethod || "method not set"} · ${s.paymentDate || "—"}`,
              status: s.paymentStatus,
            }))}
            onOpen={setOpenPatient}
          />
        )}
      </div>

      {patientForm && (
        <PatientFormModal
          form={patientForm}
          onChange={setPatientForm}
          onClose={() => setPatientForm(null)}
          onSubmit={async (f) => {
            const err = await submitPatient(f);
            if (!err) setPatientForm(null);
            return err;
          }}
        />
      )}

      {selected && (
        <PatientDetail
          token={token}
          patient={selected}
          data={data}
          onClose={() => setOpenPatient(null)}
          onChanged={() => void refresh()}
          flash={flash}
          onEdit={(p) =>
            setPatientForm({
              id: p.id,
              name: p.name,
              age: p.age,
              gender: p.gender || "Male",
              whatsapp: p.whatsapp,
              city: p.city,
              attendantName: p.attendantName,
              relationship: p.relationship,
              mainProblem: p.mainProblem,
              caseCategory: p.caseCategory || "Other",
              priority: p.priority || "Normal",
              preferredCity: p.preferredCity,
              budgetPreference: p.budgetPreference,
              servicePackage: p.servicePackage || SERVICE_PACKAGES[0].key,
              caseStatus: p.caseStatus || "New",
              registrationDate: p.registrationDate || today(),
              notes: p.notes,
            })
          }
          onArchive={async (p) => {
            if (!window.confirm("Archive this patient case? / کیا آپ یہ کیس آرکائیو کرنا چاہتے ہیں؟")) return;
            const res = await archiveFn({ data: { token, id: p.id, archived: true } });
            if (!res.ok) return flash(res.error);
            setOpenPatient(null);
            await refresh();
            flash("Case archived — کیس آرکائیو ہو گیا");
          }}
        />
      )}
    </main>
  );
}

function Card({ title, ur, children }: { title: string; ur: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
      <Urdu className="mb-2 block text-xs text-muted-foreground">{ur}</Urdu>
      {children}
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-4">
      <p className="text-xs font-semibold text-brand-dark">Medical disclaimer</p>
      <p className="mt-1 text-xs text-muted-foreground">{DISCLAIMER_EN}</p>
      <Urdu className="mt-1 block text-xs text-muted-foreground">{DISCLAIMER_UR}</Urdu>
    </div>
  );
}

function ListTab({
  title,
  ur,
  empty,
  rows,
  onOpen,
}: {
  title: string;
  ur: string;
  empty: [string, string];
  rows: { id: string; patientUid: string; primary: string; secondary: string; status: string }[];
  onOpen: (uid: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-extrabold text-brand-dark">{title}</h2>
        <Urdu className="block text-sm text-muted-foreground">{ur}</Urdu>
      </div>
      {rows.length === 0 ? (
        <EmptyState en={empty[0]} ur={empty[1]} />
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => onOpen(r.patientUid)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-left hover:border-brand"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{r.primary}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.secondary}</span>
                </span>
                <Pill value={r.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------ patient form ------------------------------ */

function PatientFormModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: PatientForm;
  onChange: (f: PatientForm) => void;
  onClose: () => void;
  onSubmit: (f: PatientForm) => Promise<string>;
}) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof PatientForm, v: string) => onChange({ ...form, [k]: v });

  return (
    <Modal
      wide
      title={form.id ? "Edit Patient" : "Patient Registration"}
      ur={form.id ? "مریض میں ترمیم" : "مریض کا اندراج"}
      onClose={onClose}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Patient Name" ur="مریض کا نام" required>
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Age" ur="عمر">
          <TextInput inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} />
        </Field>
        <Field label="Gender" ur="جنس">
          <Select value={form.gender} onChange={(e) => set("gender", e.target.value)} options={GENDERS} />
        </Field>
        <Field label="WhatsApp Number" ur="واٹس ایپ نمبر" required>
          <TextInput
            inputMode="tel"
            placeholder="03xx xxxxxxx"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Field>
        <Field label="City" ur="شہر">
          <TextInput value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Attendant Name" ur="ساتھ آنے والے کا نام">
          <TextInput value={form.attendantName} onChange={(e) => set("attendantName", e.target.value)} />
        </Field>
        <Field label="Relationship" ur="رشتہ">
          <TextInput value={form.relationship} onChange={(e) => set("relationship", e.target.value)} />
        </Field>
        <Field label="Case Category" ur="کیس کی نوعیت">
          <Select
            value={form.caseCategory}
            onChange={(e) => set("caseCategory", e.target.value)}
            options={CASE_CATEGORIES}
          />
        </Field>
        <Field label="Priority" ur="ترجیح">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)} options={PRIORITIES} />
        </Field>
        <Field label="Preferred City" ur="پسندیدہ شہر">
          <TextInput value={form.preferredCity} onChange={(e) => set("preferredCity", e.target.value)} />
        </Field>
        <Field label="Budget Preference" ur="بجٹ">
          <TextInput value={form.budgetPreference} onChange={(e) => set("budgetPreference", e.target.value)} />
        </Field>
        <Field label="Service Package" ur="سروس پیکج">
          <Select
            value={form.servicePackage}
            onChange={(e) => set("servicePackage", e.target.value)}
            options={SERVICE_PACKAGES.map((p) => p.key)}
          />
        </Field>
        <Field label="Case Status" ur="کیس اسٹیٹس">
          <Select value={form.caseStatus} onChange={(e) => set("caseStatus", e.target.value)} options={CASE_STATUSES} />
        </Field>
        <Field label="Registration Date" ur="تاریخِ اندراج">
          <TextInput type="date" value={form.registrationDate} onChange={(e) => set("registrationDate", e.target.value)} />
        </Field>
        <Field label="Main Eye Problem" ur="آنکھ کا بنیادی مسئلہ" className="sm:col-span-2">
          <TextArea value={form.mainProblem} onChange={(e) => set("mainProblem", e.target.value)} />
        </Field>
        <Field label="Notes (internal)" ur="داخلی نوٹس" className="sm:col-span-2">
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
      {err && <p className="mt-3 text-sm font-medium text-destructive">{err}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" className="min-h-11" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="min-h-11"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setErr(await onSubmit(form));
            setBusy(false);
          }}
        >
          {busy && <Loader2 className="size-4 animate-spin" />} Save
        </Button>
      </div>
    </Modal>
  );
}

/* ----------------------------- doctors & centres ---------------------------- */

const emptyDoctor = () => ({
  id: null as string | null,
  name: "",
  city: "",
  specialty: "General Ophthalmology",
  consultationFee: "",
  estimatedCost: "",
  services: "",
  location: "",
  contact: "",
  notes: "",
  active: true,
});

function DoctorsTab({
  token,
  data,
  onChanged,
  flash,
}: {
  token: string;
  data: EyeCareData;
  onChanged: () => void;
  flash: (m: string) => void;
}) {
  const [form, setForm] = useState<ReturnType<typeof emptyDoctor> | null>(null);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [spec, setSpec] = useState("All");
  const save = useServerFn(eyecareSaveDoctor);
  const del = useServerFn(eyecareDelete);

  const cities = Array.from(new Set(data.doctors.map((d) => d.city).filter(Boolean))).sort();
  const list = data.doctors.filter((d) => {
    if (city !== "All" && d.city !== city) return false;
    if (spec !== "All" && d.specialty !== spec) return false;
    if (q && !`${d.name} ${d.city} ${d.specialty}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-3 text-xs text-foreground">
        Private internal database — never shared with patients. یہ فہرست مریضوں کو نہیں دکھائی جاتی۔
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search doctor / centre…"
          className="min-w-52 flex-1"
        />
        <Select value={city} onChange={(e) => setCity(e.target.value)} options={["All", ...cities]} className="w-auto" />
        <Select value={spec} onChange={(e) => setSpec(e.target.value)} options={["All", ...SPECIALISTS]} className="w-auto" />
        <Button className="min-h-11" onClick={() => setForm(emptyDoctor())}>
          <Plus className="size-4" /> Add doctor
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState en="No doctors or centres found" ur="کوئی ڈاکٹر یا سینٹر نہیں ملا" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((d) => (
            <li key={d.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.specialty} · {d.city || "—"}
                  </p>
                </div>
                <Pill value={d.active ? "Confirmed" : "Cancelled"} className={d.active ? "" : ""} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Consultation: {d.consultationFee || "—"} · Estimate: {d.estimatedCost || "—"}
              </p>
              {d.contact && <p className="mt-1 text-xs text-muted-foreground">Contact: {d.contact}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setForm({ ...d, id: d.id })}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const res = await save({ data: { token, doctor: { ...d, id: d.id, active: !d.active } } });
                    if (!res.ok) return flash(res.error);
                    onChanged();
                    flash(d.active ? "Marked inactive" : "Marked active");
                  }}
                >
                  {d.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to delete this record? / کیا آپ واقعی حذف کرنا چاہتے ہیں؟"))
                      return;
                    const res = await del({ data: { token, table: "eyecare_doctors", id: d.id } });
                    if (!res.ok) return flash(res.error);
                    onChanged();
                    flash("Deleted");
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <Modal wide title="Doctor / Centre" ur="ڈاکٹر یا سینٹر" onClose={() => setForm(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Doctor / Centre Name" ur="نام" required>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="City" ur="شہر">
              <TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Specialty" ur="اسپیشلٹی">
              <Select
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                options={SPECIALISTS}
              />
            </Field>
            <Field label="Consultation Fee" ur="فیس">
              <TextInput value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
            </Field>
            <Field label="Estimated Treatment / Surgery Cost" ur="تخمینی لاگت">
              <TextInput value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} />
            </Field>
            <Field label="Contact" ur="رابطہ">
              <TextInput value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Location" ur="مقام" className="sm:col-span-2">
              <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field label="Services" ur="سروسز" className="sm:col-span-2">
              <TextArea value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
            </Field>
            <Field label="Internal notes" ur="داخلی نوٹس" className="sm:col-span-2">
              <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              className="min-h-11"
              onClick={async () => {
                if (!form.name.trim()) return flash("Doctor/Centre name is required — نام لازمی ہے");
                const res = await save({ data: { token, doctor: form } });
                if (!res.ok) return flash(res.error);
                setForm(null);
                onChanged();
                flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
              }}
            >
              Save
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ------------------------------ patient detail ----------------------------- */

type DetailTab =
  | "overview"
  | "assessment"
  | "recommendations"
  | "appointments"
  | "followups"
  | "services"
  | "documents"
  | "timeline";

function PatientDetail({
  token,
  patient,
  data,
  onClose,
  onChanged,
  flash,
  onEdit,
  onArchive,
}: {
  token: string;
  patient: EyePatient;
  data: EyeCareData;
  onClose: () => void;
  onChanged: () => void;
  flash: (m: string) => void;
  onEdit: (p: EyePatient) => void;
  onArchive: (p: EyePatient) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const assessment = data.assessments.find((a) => a.patientUid === patient.id);
  const recs = data.recommendations.filter((r) => r.patientUid === patient.id);
  const appts = data.appointments.filter((a) => a.patientUid === patient.id);
  const fups = data.followups.filter((f) => f.patientUid === patient.id);
  const svcs = data.services.filter((s) => s.patientUid === patient.id);
  const docs = data.documents.filter((d) => d.patientUid === patient.id);
  const timeline = data.timeline.filter((t) => t.patientUid === patient.id);

  const saveAssessment = useServerFn(eyecareSaveAssessment);
  const saveRec = useServerFn(eyecareSaveRecommendation);
  const saveAppt = useServerFn(eyecareSaveAppointment);
  const saveFup = useServerFn(eyecareSaveFollowup);
  const saveSvc = useServerFn(eyecareSaveService);
  const saveDoc = useServerFn(eyecareSaveDocument);
  const del = useServerFn(eyecareDelete);

  const [aForm, setAForm] = useState({
    symptoms: assessment?.symptoms ?? "",
    previousDiagnosis: assessment?.previousDiagnosis ?? "",
    previousDoctor: assessment?.previousDoctor ?? "",
    previousTreatment: assessment?.previousTreatment ?? "",
    previousReports: assessment?.previousReports ?? "",
    reportsAvailable: assessment?.reportsAvailable ?? "No",
    surgerySuggested: assessment?.surgerySuggested ?? "Not Confirmed",
    secondOpinionRequired: assessment?.secondOpinionRequired ?? "No",
    requiredSpecialist: assessment?.requiredSpecialist ?? "General Ophthalmology",
    patientPriority: assessment?.patientPriority ?? patient.priority ?? "Normal",
    travelPreference: assessment?.travelPreference ?? "Local",
    budget: assessment?.budget ?? patient.budgetPreference ?? "",
    consultantNotes: assessment?.consultantNotes ?? "",
    assessmentDate: assessment?.assessmentDate ?? today(),
  });

  const [recForm, setRecForm] = useState<null | {
    id: string | null;
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
  }>(null);

  const [apptForm, setApptForm] = useState<null | {
    id: string | null;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    status: string;
    notes: string;
  }>(null);

  const [fupForm, setFupForm] = useState<null | {
    id: string | null;
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
  }>(null);

  const [svcForm, setSvcForm] = useState<null | {
    id: string | null;
    servicePackage: string;
    serviceType: string;
    fee: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: string;
    notes: string;
  }>(null);

  const [docForm, setDocForm] = useState<null | {
    id: string | null;
    title: string;
    category: string;
    storagePath: string;
    externalLink: string;
    patientShareable: boolean;
    notes: string;
  }>(null);

  const shareSummary = () => {
    const rec = recs.find((r) => r.shareable);
    const appt = appts.find((a) => a.status === "Confirmed") ?? appts[0];
    const lines = [
      "AL-ATASH FIT — Eye Care Consultancy",
      `Patient ID: ${patient.patientId}`,
      `Name: ${patient.name}`,
      rec ? `Recommended option: ${rec.doctorName} (${rec.specialty}, ${rec.city})` : "",
      rec?.estimatedCost ? `Estimated cost: ${rec.estimatedCost}` : "",
      appt ? `Appointment: ${appt.appointmentDate || "to be confirmed"} ${appt.appointmentTime} (${appt.status})` : "",
      "",
      "Next step: our team will contact you to confirm the details.",
      "",
      "Note: This is a guidance and coordination service and does not replace examination or treatment by a qualified ophthalmologist.",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const printCaseSheet = () => {
    const esc = (v: string) => (v ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);
    const row = (k: string, v: string) => (v ? `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>` : "");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(patient.patientId)} — Case Sheet</title>
<style>body{font-family:system-ui,sans-serif;color:#111;padding:24px;max-width:800px;margin:auto}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:20px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px}
table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;width:180px;padding:4px 6px;color:#555;font-weight:600;vertical-align:top}
td{padding:4px 6px}.brand{color:#0f766e;font-weight:800}.small{font-size:11px;color:#666;margin-top:24px}</style></head><body>
<h1><span class="brand">AL-ATASH FIT</span> — Eye Care Consultancy</h1>
<p style="font-size:12px;color:#555">Patient case sheet · ${esc(new Date().toLocaleDateString())}</p>
<h2>Patient</h2><table>
${row("Patient ID", patient.patientId)}${row("Name", patient.name)}${row("Age", patient.age)}${row("Gender", patient.gender)}
${row("City", patient.city)}${row("Attendant", patient.attendantName)}${row("Main problem", patient.mainProblem)}
${row("Case status", patient.caseStatus)}${row("Registered", patient.registrationDate)}</table>
${
  assessment
    ? `<h2>Assessment</h2><table>${row("Symptoms", assessment.symptoms)}${row("Previous diagnosis", assessment.previousDiagnosis)}
${row("Previous doctor", assessment.previousDoctor)}${row("Previous treatment", assessment.previousTreatment)}
${row("Reports available", assessment.reportsAvailable)}${row("Surgery suggested", assessment.surgerySuggested)}
${row("Second opinion", assessment.secondOpinionRequired)}${row("Required specialist", assessment.requiredSpecialist)}
${row("Assessment date", assessment.assessmentDate)}</table>`
    : ""
}
${
  recs.length
    ? `<h2>Recommended options</h2><table>${recs
        .map((r) =>
          row(
            `Option ${r.optionNumber}`,
            `${r.doctorName} — ${r.specialty}, ${r.city}${r.estimatedCost ? ` · ${r.estimatedCost}` : ""}${r.whySuitable ? ` · ${r.whySuitable}` : ""}`,
          ),
        )
        .join("")}</table>`
    : ""
}
${
  appts.length
    ? `<h2>Appointments</h2><table>${appts
        .map((a) => row(a.appointmentDate || "Date TBC", `${a.doctorName} · ${a.appointmentType} · ${a.status}`))
        .join("")}</table>`
    : ""
}
${
  fups.length
    ? `<h2>Follow-ups</h2><table>${fups
        .map((f) => row(f.followupDate || "—", `${f.consultationStatus}${f.nextFollowup ? ` · next ${f.nextFollowup}` : ""}`))
        .join("")}</table>`
    : ""
}
${
  svcs.length
    ? `<h2>Services & payments</h2><table>${svcs
        .map((s) => row(s.servicePackage, `PKR ${s.fee} · ${s.paymentStatus}${s.paymentDate ? ` · ${s.paymentDate}` : ""}`))
        .join("")}</table>`
    : ""
}
<p class="small">${esc(DISCLAIMER_EN)}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return flash("Please allow pop-ups to print the case sheet.");
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const detailTabs: { key: DetailTab; en: string }[] = [
    { key: "overview", en: "Overview" },
    { key: "assessment", en: "Assessment" },
    { key: "recommendations", en: "Recommendations" },
    { key: "appointments", en: "Appointments" },
    { key: "followups", en: "Follow-ups" },
    { key: "services", en: "Services & Payments" },
    { key: "documents", en: "Documents" },
    { key: "timeline", en: "Timeline" },
  ];

  return (
    <Modal wide title={patient.name} ur={patient.patientId} onClose={onClose}>
      <div className="mb-3 flex flex-wrap gap-2">
        <Pill value={patient.caseStatus} />
        <Pill value={patient.priority} />
        <a
          href={waLink(patient.whatsapp, `Assalam o Alaikum ${patient.name} — AL-ATASH FIT Eye Care Consultancy.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold text-brand-dark hover:bg-brand-soft"
        >
          <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
        </a>
        <a
          href={waLink(patient.whatsapp, shareSummary())}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold text-brand-dark hover:bg-brand-soft"
        >
          Share patient summary
        </a>
        <button
          onClick={printCaseSheet}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary"
        >
          <Printer className="size-3.5" aria-hidden /> Print case sheet
        </button>
        <button
          onClick={() => onEdit(patient)}
          className="inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary"
        >
          Edit
        </button>
        <button
          onClick={() => onArchive(patient)}
          className="inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          Archive
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {detailTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "min-h-9 whitespace-nowrap rounded-full px-3 text-xs font-semibold",
              tab === t.key ? "bg-brand text-primary-foreground" : "border text-muted-foreground hover:bg-secondary",
            )}
          >
            {t.en}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Patient ID", patient.patientId],
            ["Age", patient.age],
            ["Gender", patient.gender],
            ["WhatsApp", patient.whatsapp],
            ["City", patient.city],
            ["Attendant", `${patient.attendantName} ${patient.relationship ? `(${patient.relationship})` : ""}`],
            ["Main problem", patient.mainProblem],
            ["Case category", patient.caseCategory],
            ["Preferred city", patient.preferredCity],
            ["Budget preference", patient.budgetPreference],
            ["Service package", patient.servicePackage],
            ["Case status", `${patient.caseStatus} — ${CASE_STATUS_UR[patient.caseStatus] ?? ""}`],
            ["Registered", patient.registrationDate],
            ["Internal notes", patient.notes],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-card p-3">
              <dt className="text-xs font-semibold text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 text-sm text-foreground">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      )}

      {tab === "assessment" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Symptoms" ur="علامات" className="sm:col-span-2">
            <TextArea value={aForm.symptoms} onChange={(e) => setAForm({ ...aForm, symptoms: e.target.value })} />
          </Field>
          <Field label="Previous Diagnosis" ur="پچھلی تشخیص">
            <TextInput
              value={aForm.previousDiagnosis}
              onChange={(e) => setAForm({ ...aForm, previousDiagnosis: e.target.value })}
            />
          </Field>
          <Field label="Previous Doctor" ur="پچھلے ڈاکٹر">
            <TextInput value={aForm.previousDoctor} onChange={(e) => setAForm({ ...aForm, previousDoctor: e.target.value })} />
          </Field>
          <Field label="Previous Treatment" ur="پچھلا علاج">
            <TextInput
              value={aForm.previousTreatment}
              onChange={(e) => setAForm({ ...aForm, previousTreatment: e.target.value })}
            />
          </Field>
          <Field label="Previous Reports" ur="پچھلی رپورٹس">
            <TextInput
              value={aForm.previousReports}
              onChange={(e) => setAForm({ ...aForm, previousReports: e.target.value })}
            />
          </Field>
          <Field label="Reports Available" ur="رپورٹس دستیاب">
            <Select
              value={aForm.reportsAvailable}
              onChange={(e) => setAForm({ ...aForm, reportsAvailable: e.target.value })}
              options={YES_NO}
            />
          </Field>
          <Field label="Surgery Suggested" ur="سرجری تجویز">
            <Select
              value={aForm.surgerySuggested}
              onChange={(e) => setAForm({ ...aForm, surgerySuggested: e.target.value })}
              options={YES_NO_UNCONFIRMED}
            />
          </Field>
          <Field label="Second Opinion Required" ur="دوسری رائے">
            <Select
              value={aForm.secondOpinionRequired}
              onChange={(e) => setAForm({ ...aForm, secondOpinionRequired: e.target.value })}
              options={YES_NO_RECOMMENDED}
            />
          </Field>
          <Field label="Required Specialist" ur="مطلوبہ ماہر">
            <Select
              value={aForm.requiredSpecialist}
              onChange={(e) => setAForm({ ...aForm, requiredSpecialist: e.target.value })}
              options={SPECIALISTS}
            />
          </Field>
          <Field label="Patient Priority" ur="ترجیح">
            <Select
              value={aForm.patientPriority}
              onChange={(e) => setAForm({ ...aForm, patientPriority: e.target.value })}
              options={PRIORITIES}
            />
          </Field>
          <Field label="Travel Preference" ur="سفر کی ترجیح">
            <Select
              value={aForm.travelPreference}
              onChange={(e) => setAForm({ ...aForm, travelPreference: e.target.value })}
              options={TRAVEL_PREFERENCES}
            />
          </Field>
          <Field label="Budget" ur="بجٹ">
            <TextInput value={aForm.budget} onChange={(e) => setAForm({ ...aForm, budget: e.target.value })} />
          </Field>
          <Field label="Assessment Date" ur="تاریخ">
            <TextInput
              type="date"
              value={aForm.assessmentDate}
              onChange={(e) => setAForm({ ...aForm, assessmentDate: e.target.value })}
            />
          </Field>
          <Field label="Consultant coordination notes" ur="کنسلٹنٹ نوٹس" className="sm:col-span-2">
            <TextArea
              value={aForm.consultantNotes}
              onChange={(e) => setAForm({ ...aForm, consultantNotes: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Button
              className="min-h-11"
              onClick={async () => {
                const res = await saveAssessment({ data: { token, patientUid: patient.id, assessment: aForm } });
                if (!res.ok) return flash(res.error);
                onChanged();
                flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
              }}
            >
              Save assessment
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Disclaimer />
          </div>
        </div>
      )}

      {tab === "recommendations" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Maximum 3 recommended options per patient. Options are guidance only — subject to specialist evaluation.
          </p>
          {recs.length === 0 ? (
            <EmptyState en="No recommendations yet" ur="ابھی کوئی تجویز نہیں" />
          ) : (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Option {r.optionNumber}: {r.doctorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.specialty} · {r.city} · {r.estimatedCost || "cost TBC"}
                      </p>
                      {r.whySuitable && <p className="mt-1 text-xs text-muted-foreground">{r.whySuitable}</p>}
                    </div>
                    <Pill value={r.appointmentStatus} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRecForm({ ...r, id: r.id })}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm("Delete this recommendation? / کیا آپ واقعی حذف کرنا چاہتے ہیں؟")) return;
                        const res = await del({ data: { token, table: "eyecare_recommendations", id: r.id } });
                        if (!res.ok) return flash(res.error);
                        onChanged();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {recs.length < 3 && (
            <Button
              className="min-h-11"
              onClick={() => {
                const used = recs.map((r) => r.optionNumber);
                const next = [1, 2, 3].find((n) => !used.includes(n)) ?? 1;
                setRecForm({
                  id: null,
                  optionNumber: next,
                  doctorUid: "",
                  doctorName: "",
                  specialty: assessment?.requiredSpecialist ?? "General Ophthalmology",
                  city: patient.preferredCity || patient.city,
                  estimatedCost: "",
                  whySuitable: "",
                  appointmentStatus: "Requested",
                  consultantNotes: "",
                  shareable: false,
                });
              }}
            >
              <Plus className="size-4" /> Add recommended option
            </Button>
          )}

          {recForm && (
            <Modal title={`Recommended option ${recForm.optionNumber}`} ur="تجویز کردہ آپشن" onClose={() => setRecForm(null)}>
              <div className="grid gap-3">
                <Field label="Doctor / Centre (from private database)" ur="ڈاکٹر یا سینٹر">
                  <select
                    className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={recForm.doctorUid}
                    onChange={(e) => {
                      const d = data.doctors.find((x) => x.id === e.target.value);
                      setRecForm({
                        ...recForm,
                        doctorUid: e.target.value,
                        doctorName: d?.name ?? recForm.doctorName,
                        specialty: d?.specialty ?? recForm.specialty,
                        city: d?.city ?? recForm.city,
                        estimatedCost: d?.estimatedCost ?? recForm.estimatedCost,
                      });
                    }}
                  >
                    <option value="">— Manual entry —</option>
                    {data.doctors
                      .filter((d) => d.active)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialty}, {d.city}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Doctor / Centre name" ur="نام" required>
                  <TextInput value={recForm.doctorName} onChange={(e) => setRecForm({ ...recForm, doctorName: e.target.value })} />
                </Field>
                <Field label="Specialty" ur="اسپیشلٹی">
                  <Select
                    value={recForm.specialty}
                    onChange={(e) => setRecForm({ ...recForm, specialty: e.target.value })}
                    options={SPECIALISTS}
                  />
                </Field>
                <Field label="City" ur="شہر">
                  <TextInput value={recForm.city} onChange={(e) => setRecForm({ ...recForm, city: e.target.value })} />
                </Field>
                <Field label="Estimated cost" ur="تخمینی لاگت">
                  <TextInput
                    value={recForm.estimatedCost}
                    onChange={(e) => setRecForm({ ...recForm, estimatedCost: e.target.value })}
                  />
                </Field>
                <Field label="Why suitable (guidance wording)" ur="کیوں مناسب ہے">
                  <TextArea
                    value={recForm.whySuitable}
                    onChange={(e) => setRecForm({ ...recForm, whySuitable: e.target.value })}
                    placeholder="Suitable based on available information — subject to specialist evaluation."
                  />
                </Field>
                <Field label="Appointment status" ur="اپائنٹمنٹ اسٹیٹس">
                  <Select
                    value={recForm.appointmentStatus}
                    onChange={(e) => setRecForm({ ...recForm, appointmentStatus: e.target.value })}
                    options={APPOINTMENT_STATUSES}
                  />
                </Field>
                <Field label="Consultant notes (internal)" ur="داخلی نوٹس">
                  <TextArea
                    value={recForm.consultantNotes}
                    onChange={(e) => setRecForm({ ...recForm, consultantNotes: e.target.value })}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={recForm.shareable}
                    onChange={(e) => setRecForm({ ...recForm, shareable: e.target.checked })}
                  />
                  Approved to share with patient / مریض کو بھیجنے کی اجازت
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setRecForm(null)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  onClick={async () => {
                    if (!recForm.doctorName.trim()) return flash("Doctor/Centre name is required — نام لازمی ہے");
                    const res = await saveRec({ data: { token, patientUid: patient.id, rec: recForm } });
                    if (!res.ok) return flash(res.error);
                    setRecForm(null);
                    onChanged();
                    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
                  }}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "appointments" && (
        <div className="space-y-3">
          {appts.length === 0 ? (
            <EmptyState en="No appointments yet" ur="ابھی کوئی اپائنٹمنٹ نہیں" />
          ) : (
            <ul className="space-y-2">
              {appts.map((a) => (
                <li key={a.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.doctorName || "Doctor not set"}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.appointmentDate || "Date to be confirmed"} {a.appointmentTime} · {a.appointmentType}
                      </p>
                      {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
                    </div>
                    <Pill value={a.status} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setApptForm({ ...a, id: a.id })}>
                      Edit
                    </Button>
                    <a
                      href={waLink(
                        patient.whatsapp,
                        `AL-ATASH FIT — Eye Care\nPatient ID: ${patient.patientId}\nAppointment reminder: ${a.appointmentDate || "date to be confirmed"} ${a.appointmentTime}\nDoctor/Centre: ${a.doctorName}`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-secondary"
                    >
                      <MessageCircle className="size-3.5" /> Reminder
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm("Delete this appointment? / کیا آپ واقعی حذف کرنا چاہتے ہیں؟")) return;
                        const res = await del({ data: { token, table: "eyecare_appointments", id: a.id } });
                        if (!res.ok) return flash(res.error);
                        onChanged();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="min-h-11"
            onClick={() =>
              setApptForm({
                id: null,
                doctorName: recs.find((r) => r.shareable)?.doctorName ?? "",
                appointmentDate: "",
                appointmentTime: "",
                appointmentType: "Consultation",
                status: "Requested",
                notes: "",
              })
            }
          >
            <Plus className="size-4" /> Add appointment
          </Button>
          {apptForm && (
            <Modal title="Appointment" ur="اپائنٹمنٹ" onClose={() => setApptForm(null)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Doctor / Centre" ur="ڈاکٹر یا سینٹر" className="sm:col-span-2">
                  <TextInput value={apptForm.doctorName} onChange={(e) => setApptForm({ ...apptForm, doctorName: e.target.value })} />
                </Field>
                <Field label="Date" ur="تاریخ">
                  <TextInput
                    type="date"
                    value={apptForm.appointmentDate}
                    onChange={(e) => setApptForm({ ...apptForm, appointmentDate: e.target.value })}
                  />
                </Field>
                <Field label="Time" ur="وقت">
                  <TextInput
                    type="time"
                    value={apptForm.appointmentTime}
                    onChange={(e) => setApptForm({ ...apptForm, appointmentTime: e.target.value })}
                  />
                </Field>
                <Field label="Type" ur="قسم">
                  <Select
                    value={apptForm.appointmentType}
                    onChange={(e) => setApptForm({ ...apptForm, appointmentType: e.target.value })}
                    options={APPOINTMENT_TYPES}
                  />
                </Field>
                <Field label="Status" ur="اسٹیٹس">
                  <Select
                    value={apptForm.status}
                    onChange={(e) => setApptForm({ ...apptForm, status: e.target.value })}
                    options={APPOINTMENT_STATUSES}
                  />
                </Field>
                <Field label="Coordination notes" ur="کوآرڈینیشن نوٹس" className="sm:col-span-2">
                  <TextArea value={apptForm.notes} onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setApptForm(null)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  onClick={async () => {
                    const res = await saveAppt({ data: { token, patientUid: patient.id, appointment: apptForm } });
                    if (!res.ok) return flash(res.error);
                    setApptForm(null);
                    onChanged();
                    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
                  }}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "followups" && (
        <div className="space-y-3">
          {fups.length === 0 ? (
            <EmptyState en="No follow-ups yet" ur="ابھی کوئی فالو اپ نہیں" />
          ) : (
            <ul className="space-y-2">
              {fups.map((f) => (
                <li key={f.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.followupDate || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.consultationStatus} · surgery: {f.surgeryPlanned}
                        {f.nextFollowup ? ` · next ${f.nextFollowup}` : ""}
                      </p>
                      {f.doctorAdvice && <p className="mt-1 text-xs text-muted-foreground">{f.doctorAdvice}</p>}
                    </div>
                    <Pill value={f.completed ? "Completed" : "Pending"} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setFupForm({ ...f, id: f.id })}>
                      Edit
                    </Button>
                    <a
                      href={waLink(
                        patient.whatsapp,
                        `AL-ATASH FIT — Eye Care\nPatient ID: ${patient.patientId}\nFollow-up reminder: ${f.nextFollowup || f.followupDate}`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-secondary"
                    >
                      <MessageCircle className="size-3.5" /> Reminder
                    </a>
                    {!f.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const res = await saveFup({
                            data: { token, patientUid: patient.id, followup: { ...f, id: f.id, completed: true } },
                          });
                          if (!res.ok) return flash(res.error);
                          onChanged();
                          flash("Marked completed");
                        }}
                      >
                        Mark completed
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="min-h-11"
            onClick={() =>
              setFupForm({
                id: null,
                followupDate: today(),
                consultationStatus: "Pending",
                doctorAdvice: "",
                surgeryPlanned: "No",
                surgeryDate: "",
                nextFollowup: "",
                patientFeedback: "",
                caseStatus: "Follow-up",
                notes: "",
                completed: false,
              })
            }
          >
            <Plus className="size-4" /> Add follow-up
          </Button>
          {fupForm && (
            <Modal title="Follow-up" ur="فالو اپ" onClose={() => setFupForm(null)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Follow-up Date" ur="تاریخ">
                  <TextInput
                    type="date"
                    value={fupForm.followupDate}
                    onChange={(e) => setFupForm({ ...fupForm, followupDate: e.target.value })}
                  />
                </Field>
                <Field label="Consultation Status" ur="مشاورت کی صورتحال">
                  <Select
                    value={fupForm.consultationStatus}
                    onChange={(e) => setFupForm({ ...fupForm, consultationStatus: e.target.value })}
                    options={CONSULTATION_STATUSES}
                  />
                </Field>
                <Field label="Surgery Planned" ur="سرجری طے شدہ">
                  <Select
                    value={fupForm.surgeryPlanned}
                    onChange={(e) => setFupForm({ ...fupForm, surgeryPlanned: e.target.value })}
                    options={YES_NO_UNCONFIRMED}
                  />
                </Field>
                <Field label="Surgery Date" ur="سرجری کی تاریخ">
                  <TextInput
                    type="date"
                    value={fupForm.surgeryDate}
                    onChange={(e) => setFupForm({ ...fupForm, surgeryDate: e.target.value })}
                  />
                </Field>
                <Field label="Next Follow-up" ur="اگلا فالو اپ">
                  <TextInput
                    type="date"
                    value={fupForm.nextFollowup}
                    onChange={(e) => setFupForm({ ...fupForm, nextFollowup: e.target.value })}
                  />
                </Field>
                <Field label="Case Status" ur="کیس اسٹیٹس">
                  <Select
                    value={fupForm.caseStatus}
                    onChange={(e) => setFupForm({ ...fupForm, caseStatus: e.target.value })}
                    options={CASE_STATUSES}
                  />
                </Field>
                <Field label="Doctor Advice" ur="ڈاکٹر کی ہدایت" className="sm:col-span-2">
                  <TextArea value={fupForm.doctorAdvice} onChange={(e) => setFupForm({ ...fupForm, doctorAdvice: e.target.value })} />
                </Field>
                <Field label="Patient Feedback" ur="مریض کی رائے" className="sm:col-span-2">
                  <TextArea
                    value={fupForm.patientFeedback}
                    onChange={(e) => setFupForm({ ...fupForm, patientFeedback: e.target.value })}
                  />
                </Field>
                <Field label="Notes (internal)" ur="داخلی نوٹس" className="sm:col-span-2">
                  <TextArea value={fupForm.notes} onChange={(e) => setFupForm({ ...fupForm, notes: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setFupForm(null)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  onClick={async () => {
                    const res = await saveFup({ data: { token, patientUid: patient.id, followup: fupForm } });
                    if (!res.ok) return flash(res.error);
                    setFupForm(null);
                    onChanged();
                    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
                  }}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "services" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Payments are recorded manually — there is no online payment gateway. ادائیگی دستی طور پر درج کی جاتی ہے۔
          </p>
          {svcs.length === 0 ? (
            <EmptyState en="No service records yet" ur="ابھی کوئی سروس ریکارڈ نہیں" />
          ) : (
            <ul className="space-y-2">
              {svcs.map((s) => (
                <li key={s.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.servicePackage}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.serviceType || "—"} · PKR {s.fee} · {s.paymentMethod || "method not set"} ·{" "}
                        {s.paymentDate || "—"}
                      </p>
                    </div>
                    <Pill value={s.paymentStatus} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSvcForm({ ...s, id: s.id })}>
                      Edit
                    </Button>
                    <a
                      href={waLink(
                        patient.whatsapp,
                        `AL-ATASH FIT — Eye Care\nPatient ID: ${patient.patientId}\nService: ${s.servicePackage}\nAmount: PKR ${s.fee}\nStatus: ${s.paymentStatus}`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-secondary"
                    >
                      <MessageCircle className="size-3.5" /> Payment reminder
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="min-h-11"
            onClick={() =>
              setSvcForm({
                id: null,
                servicePackage: patient.servicePackage || SERVICE_PACKAGES[0].key,
                serviceType: "",
                fee: 0,
                paymentStatus: "Pending",
                paymentMethod: "",
                paymentDate: "",
                notes: "",
              })
            }
          >
            <Plus className="size-4" /> Add service / payment
          </Button>
          {svcForm && (
            <Modal title="Service & Payment" ur="سروس اور ادائیگی" onClose={() => setSvcForm(null)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Service Package" ur="سروس پیکج" className="sm:col-span-2">
                  <Select
                    value={svcForm.servicePackage}
                    onChange={(e) => setSvcForm({ ...svcForm, servicePackage: e.target.value })}
                    options={SERVICE_PACKAGES.map((p) => p.key)}
                  />
                </Field>
                <Field label="Service Type" ur="سروس کی قسم">
                  <TextInput value={svcForm.serviceType} onChange={(e) => setSvcForm({ ...svcForm, serviceType: e.target.value })} />
                </Field>
                <Field label="Fee (PKR)" ur="فیس">
                  <TextInput
                    inputMode="decimal"
                    value={String(svcForm.fee)}
                    onChange={(e) => setSvcForm({ ...svcForm, fee: Number(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Payment Status" ur="ادائیگی کی صورتحال">
                  <Select
                    value={svcForm.paymentStatus}
                    onChange={(e) => setSvcForm({ ...svcForm, paymentStatus: e.target.value })}
                    options={PAYMENT_STATUSES}
                  />
                </Field>
                <Field label="Payment Method" ur="ادائیگی کا ذریعہ">
                  <Select
                    value={svcForm.paymentMethod || PAYMENT_METHODS[0]}
                    onChange={(e) => setSvcForm({ ...svcForm, paymentMethod: e.target.value })}
                    options={PAYMENT_METHODS}
                  />
                </Field>
                <Field label="Payment Date" ur="تاریخ">
                  <TextInput
                    type="date"
                    value={svcForm.paymentDate}
                    onChange={(e) => setSvcForm({ ...svcForm, paymentDate: e.target.value })}
                  />
                </Field>
                <Field label="Notes" ur="نوٹس" className="sm:col-span-2">
                  <TextArea value={svcForm.notes} onChange={(e) => setSvcForm({ ...svcForm, notes: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setSvcForm(null)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  onClick={async () => {
                    if (svcForm.fee < 0 || Number.isNaN(svcForm.fee)) return flash("Enter a valid amount — درست رقم درج کریں");
                    const res = await saveSvc({ data: { token, patientUid: patient.id, service: svcForm } });
                    if (!res.ok) return flash(res.error);
                    setSvcForm(null);
                    onChanged();
                    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
                  }}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Internal documents stay private. Only documents marked shareable may be sent to the patient.
          </p>
          {docs.length === 0 ? (
            <EmptyState en="No documents yet" ur="ابھی کوئی دستاویز نہیں" />
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.category}</p>
                      {d.externalLink && (
                        <a
                          href={d.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand underline underline-offset-2"
                        >
                          Open document
                        </a>
                      )}
                    </div>
                    <Pill value={d.patientShareable ? "Confirmed" : "Pending"} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDocForm({ ...d, id: d.id })}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm("Delete this document record? / کیا آپ واقعی حذف کرنا چاہتے ہیں؟")) return;
                        const res = await del({ data: { token, table: "eyecare_documents", id: d.id } });
                        if (!res.ok) return flash(res.error);
                        onChanged();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="min-h-11"
            onClick={() =>
              setDocForm({
                id: null,
                title: "",
                category: "Medical Report",
                storagePath: "",
                externalLink: "",
                patientShareable: false,
                notes: "",
              })
            }
          >
            <Plus className="size-4" /> Add document
          </Button>
          {docForm && (
            <Modal title="Document" ur="دستاویز" onClose={() => setDocForm(null)}>
              <div className="grid gap-3">
                <Field label="Title" ur="عنوان" required>
                  <TextInput value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} />
                </Field>
                <Field label="Category" ur="قسم">
                  <Select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    options={DOCUMENT_CATEGORIES}
                  />
                </Field>
                <Field label="Document link" ur="دستاویز کا لنک">
                  <TextInput
                    value={docForm.externalLink}
                    onChange={(e) => setDocForm({ ...docForm, externalLink: e.target.value })}
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Notes" ur="نوٹس">
                  <TextArea value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={docForm.patientShareable}
                    onChange={(e) => setDocForm({ ...docForm, patientShareable: e.target.checked })}
                  />
                  Patient shareable / مریض کے ساتھ شیئر کیا جا سکتا ہے
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setDocForm(null)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  onClick={async () => {
                    if (!docForm.title.trim()) return flash("Document title is required — عنوان لازمی ہے");
                    const res = await saveDoc({ data: { token, patientUid: patient.id, document: docForm } });
                    if (!res.ok) return flash(res.error);
                    setDocForm(null);
                    onChanged();
                    flash("Saved successfully — کامیابی سے محفوظ ہو گیا");
                  }}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div>
          {timeline.length === 0 ? (
            <EmptyState en="No case events yet" ur="ابھی کوئی ریکارڈ نہیں" />
          ) : (
            <ol className="space-y-3 border-l pl-4">
              {timeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-brand" />
                  <p className="text-sm font-medium text-foreground">{t.event}</p>
                  {t.detail && <p className="text-xs text-muted-foreground">{t.detail}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(t.occurredAt).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Modal>
  );
}
