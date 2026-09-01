import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  Download,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  adminLogin,
  adminListSubmissions,
  adminAuthStatus,
  adminSetupPassword,
  adminGetPackages,
  adminSavePackages,
  adminReviewPayment,
  adminProofUrl,
  adminListDietPlans,
  adminSaveDietPlan,
  adminGenerateDietDraft,
  adminGetPaymentChannels,
  adminSavePaymentChannels,
} from "@/lib/admin.functions";
import {
  DEFAULT_PAYMENT_CHANNELS,
  methodLabel,
  type PaymentChannelSettings,
} from "@/lib/payment-channels";
import { allFields, type AssessmentType } from "@/lib/assessment-schema";
import {
  DEFAULT_PACKAGE_SETTINGS,
  PAYMENT_STATUSES,
  formatPrice,
  type DietPackage,
  type PackageSettings,
} from "@/lib/packages";
import { DietPlanEditor, type EditorSubmission } from "@/components/diet-plan-editor";
import { downloadDietPlanPdf } from "@/lib/diet-plan-pdf";
import { DIET_PLAN_STATUSES, emptyDietPlan, type DietPlan } from "@/lib/diet-plans";


export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AL-ATASH FIT" },
      { name: "description", content: "Private AL-ATASH FIT staff dashboard for weight assessment submissions." },
      { property: "og:title", content: "Admin Dashboard — AL-ATASH FIT" },
      { property: "og:description", content: "Private staff area. Authorised AL-ATASH FIT team members only." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

interface Submission {
  recordId: string;
  submissionId: string;
  type: string;
  submittedAt: string;
  name: string;
  phone: string;
  city: string;
  age: string;
  bmi: string;
  packageKey: string;
  paymentStatus: string;
  paymentReference: string;
  paymentNote: string;
  paymentProofPath: string;
  paymentSubmittedAt: string;
  paymentReviewedAt: string;
  paymentReviewNote: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentDate: string;
  paymentClientName: string;
  paymentWhatsapp: string;
  data: Record<string, string | string[] | boolean>;
}

const TOKEN_KEY = "alatash_admin_token";

const statusClass: Record<string, string> = {
  Pending: "bg-secondary text-muted-foreground",
  "Proof Submitted": "bg-accent text-accent-foreground",
  Verified: "bg-brand/15 text-brand-dark",
  Rejected: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        statusClass[status] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

const planStatusClass: Record<string, string> = {
  "Not Started": "bg-secondary text-muted-foreground",
  Draft: "bg-accent text-accent-foreground",
  "Ready for Review": "bg-accent text-accent-foreground",
  "Consultant Approved": "bg-brand/15 text-brand-dark",
  Released: "bg-brand text-primary-foreground",
  "Rejected/Needs Changes": "bg-destructive/10 text-destructive",
};

function PlanBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        planStatusClass[status] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

function labelFor(type: string, fieldId: string) {
  const t = (type.toLowerCase() as AssessmentType) || "male";
  const f = allFields(["child", "female", "male"].includes(t) ? t : "male").find((x) => x.id === fieldId);
  return f?.en ?? fieldId;
}

function formatValue(v: string | string[] | boolean) {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v;
}

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [proofBusy, setProofBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<PackageSettings>(DEFAULT_PACKAGE_SETTINGS);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [tab, setTab] = useState<"submissions" | "plans">("submissions");
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [planFilter, setPlanFilter] = useState("All");
  const [planTarget, setPlanTarget] = useState<Submission | null>(null);
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planMsg, setPlanMsg] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [channels, setChannels] = useState<PaymentChannelSettings>(DEFAULT_PAYMENT_CHANNELS);

  const login = useServerFn(adminLogin);
  const list = useServerFn(adminListSubmissions);
  const status = useServerFn(adminAuthStatus);
  const setup = useServerFn(adminSetupPassword);
  const getPackages = useServerFn(adminGetPackages);
  const savePackages = useServerFn(adminSavePackages);
  const reviewPayment = useServerFn(adminReviewPayment);
  const proofUrl = useServerFn(adminProofUrl);
  const listPlans = useServerFn(adminListDietPlans);
  const savePlan = useServerFn(adminSaveDietPlan);
  const generateDraft = useServerFn(adminGenerateDietDraft);
  const getChannels = useServerFn(adminGetPaymentChannels);
  const saveChannels = useServerFn(adminSavePaymentChannels);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await status({});
        if (active) setConfigured(res.ok ? res.configured : true);
      } catch {
        if (active) setConfigured(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  const load = useMemo(
    () => async (t: string) => {
      setBusy(true);
      setLoadError("");
      try {
        const res = await list({ data: { token: t } });
        if (res.ok) setSubmissions(res.submissions as Submission[]);
        else {
          setLoadError(res.error);
          if (res.error.startsWith("Session expired")) {
            sessionStorage.removeItem(TOKEN_KEY);
            setToken(null);
          }
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Could not load submissions.");
      } finally {
        setBusy(false);
      }
    },
    [list],
  );

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    void (async () => {
      try {
        const res = await getPackages({ data: { token } });
        if (active && res.ok) setSettings(res.settings as PackageSettings);
        const ch = await getChannels({ data: { token } });
        if (active && ch.ok) setChannels(ch.channels as PaymentChannelSettings);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, [token, getPackages, getChannels]);

  const loadPlans = useMemo(
    () => async (t: string) => {
      try {
        const res = await listPlans({ data: { token: t } });
        if (res.ok) setPlans(res.plans as DietPlan[]);
      } catch {
        /* non-fatal */
      }
    },
    [listPlans],
  );

  useEffect(() => {
    if (token) void loadPlans(token);
  }, [token, loadPlans]);

  const packageName = (key: string) =>
    settings.packages.find((p) => p.key === key)?.name ?? (key || "—");

  const planFor = (recordId: string) =>
    plans.find((p) => p.submissionRecordId === recordId) ?? emptyDietPlan(recordId);

  function editorSubmission(s: Submission): EditorSubmission {
    const pkg = settings.packages.find((p) => p.key === s.packageKey);
    return {
      recordId: s.recordId,
      submissionId: s.submissionId,
      type: s.type,
      name: s.name,
      phone: s.phone,
      city: s.city,
      age: s.age,
      bmi: s.bmi,
      packageLabel: pkg?.name ?? "",
      packageDuration: pkg?.durationLabel ?? "",
      paymentStatus: s.paymentStatus || "Pending",
      data: s.data,
    };
  }

  async function handleGenerateDraft(mode: "generate" | "improve", current: DietPlan): Promise<DietPlan | null> {
    if (!token || !planTarget) return null;
    setAiBusy(true);
    setPlanError("");
    setPlanMsg("");
    try {
      const res = await generateDraft({
        data: {
          token,
          recordId: planTarget.recordId,
          mode,
          current: {
            planTitle: current.planTitle,
            durationLabel: current.durationLabel,
            breakfast: current.breakfast,
            midMorning: current.midMorning,
            lunch: current.lunch,
            eveningSnack: current.eveningSnack,
            dinner: current.dinner,
            waterGuidance: current.waterGuidance,
            activityGuidance: current.activityGuidance,
            foodsPrefer: current.foodsPrefer,
            foodsLimit: current.foodsLimit,
            notes: current.notes,
          },
        },
      });
      if (!res.ok) {
        setPlanError(res.error);
        return null;
      }
      const saved = res.plan as DietPlan;
      setPlans((prev) => [...prev.filter((p) => p.submissionRecordId !== saved.submissionRecordId), saved]);
      setPlanMsg(mode === "improve" ? "Draft improved — please review and edit." : "AI draft generated — please review and edit.");
      return saved;
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Could not generate the AI draft.");
      return null;
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSavePlan(plan: DietPlan) {
    if (!token) return;
    setPlanBusy(true);
    setPlanError("");
    setPlanMsg("");
    try {
      const res = await savePlan({ data: { token, plan } });
      if (!res.ok) {
        setPlanError(res.error);
        return;
      }
      const saved = res.plan as DietPlan;
      setPlans((prev) => {
        const rest = prev.filter((p) => p.submissionRecordId !== saved.submissionRecordId);
        return [...rest, saved];
      });
      setPlanMsg(`Plan saved as “${saved.status}”.`);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Could not save diet plan.");
    } finally {
      setPlanBusy(false);
    }
  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const res = await login({ data: { password } });
      if (res.ok) {
        sessionStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setPassword("");
      } else setLoginError(res.error);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    if (newPassword.length < 10) {
      setLoginError("Password must be at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await setup({ data: { password: newPassword } });
      if (res.ok) {
        sessionStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setConfigured(true);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setLoginError(res.error);
        if (res.error.includes("already set")) setConfigured(true);
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReview(decision: "Verified" | "Rejected") {
    if (!token || !selected) return;
    setReviewBusy(true);
    setReviewError("");
    try {
      const res = await reviewPayment({
        data: { token, recordId: selected.recordId, decision, note: reviewNote },
      });
      if (!res.ok) {
        setReviewError(res.error);
        return;
      }
      const reviewedAt = new Date().toISOString();
      setSubmissions((prev) =>
        prev.map((s) =>
          s.recordId === selected.recordId
            ? { ...s, paymentStatus: decision, paymentReviewNote: reviewNote, paymentReviewedAt: reviewedAt }
            : s,
        ),
      );
      setSelected((s) =>
        s ? { ...s, paymentStatus: decision, paymentReviewNote: reviewNote, paymentReviewedAt: reviewedAt } : s,
      );
      setReviewNote("");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not update payment.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function openProof() {
    if (!token || !selected?.paymentProofPath) return;
    setProofBusy(true);
    setReviewError("");
    try {
      const res = await proofUrl({ data: { token, path: selected.paymentProofPath } });
      if (res.ok && res.url) window.open(res.url, "_blank", "noopener");
      else setReviewError(res.error || "Could not open proof.");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not open proof.");
    } finally {
      setProofBusy(false);
    }
  }

  async function handleSaveSettings() {
    if (!token) return;
    setSettingsBusy(true);
    setSettingsMsg("");
    try {
      const res = await savePackages({ data: { token, settings } });
      const ch = await saveChannels({ data: { token, channels } });
      setSettingsMsg(res.ok && ch.ok ? "Settings saved." : res.error || ch.error);
    } catch (err) {
      setSettingsMsg(err instanceof Error ? err.message : "Could not save packages.");
    } finally {
      setSettingsBusy(false);
    }
  }

  function updatePackage(index: number, patch: Partial<DietPackage>) {
    setSettings((prev) => ({
      ...prev,
      packages: prev.packages.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  const matchesDate = (s: Submission) =>
    !dateFilter || (s.submittedAt ? s.submittedAt.slice(0, 10) === dateFilter : false);

  const filtered = submissions.filter((s) => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false;
    if (!matchesDate(s)) return false;
    if (statusFilter !== "All" && (s.paymentStatus || "Pending") !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [s.submissionId, s.name, s.phone, s.city, s.type].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  const filteredPlans = submissions.filter((s) => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false;
    if (!matchesDate(s)) return false;
    if (statusFilter !== "All" && (s.paymentStatus || "Pending") !== statusFilter) return false;
    if (planFilter !== "All" && planFor(s.recordId).status !== planFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [s.submissionId, s.name, s.phone, s.city, s.type].some((v) => (v ?? "").toLowerCase().includes(q));
  });



  function exportCsv() {
    const keys = new Set<string>();
    filtered.forEach((s) => Object.keys(s.data).forEach((k) => keys.add(k)));
    const cols = [
      "Submission ID",
      "Type",
      "Submitted At",
      "Package",
      "Payment Status",
      "Payment Reference",
      ...Array.from(keys),
    ];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((s) =>
      [
        s.submissionId,
        s.type,
        s.submittedAt,
        packageName(s.packageKey),
        s.paymentStatus || "Pending",
        s.paymentReference,
        ...Array.from(keys).map((k) => formatValue(s.data[k] ?? "")),
      ]
        .map((v) => esc(String(v)))
        .join(","),
    );
    const csv = [cols.map(esc).join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `al-atash-fit-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-soft/60 to-background px-4">
        <div className="w-full max-w-sm rounded-3xl border bg-card p-7 shadow-lg">
          <Logo />
          {configured === null ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : configured === false ? (
            <>
              <h1 className="mt-6 font-display text-xl font-extrabold text-brand-dark">
                First-time admin setup
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create the admin password for this dashboard. It is stored only as a secure hash on the
                server and can be set once.
              </p>
              <form onSubmit={handleSetup} className="mt-5 space-y-3">
                <label htmlFor="newpw" className="text-sm font-semibold">
                  New admin password (min. 10 characters)
                </label>
                <Input
                  id="newpw"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <label htmlFor="confirmpw" className="text-sm font-semibold">
                  Confirm password
                </label>
                <Input
                  id="confirmpw"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {loginError && <p className="text-sm font-medium text-destructive">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Create password & sign in"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-xl font-extrabold text-brand-dark">Staff sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Private dashboard for the AL-ATASH FIT clinical team.
              </p>
              <form onSubmit={handleLogin} className="mt-5 space-y-3">
                <label htmlFor="pw" className="text-sm font-semibold">
                  Admin password
                </label>
                <Input
                  id="pw"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {loginError && <p className="text-sm font-medium text-destructive">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </>
          )}
          <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:underline">
            Back to assessment forms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load(token)} disabled={busy}>
              <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="size-4" /> Packages
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="size-4" /> CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setSubmissions([]);
              }}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 inline-flex rounded-full border bg-card p-1">
          {(
            [
              ["submissions", "Submissions"],
              ["plans", "Diet Plans"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                tab === k ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <h1 className="font-display text-2xl font-extrabold text-brand-dark">
          {tab === "plans" ? "Diet plans" : "Assessment submissions"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tab === "plans" ? (
            <>
              {submissions.length} patients · {filteredPlans.length} shown ·{" "}
              {plans.filter((p) => p.status === "Ready for Review").length} ready for review
            </>
          ) : (
            <>
              {submissions.length} total · {filtered.length} shown ·{" "}
              {submissions.filter((s) => s.paymentStatus === "Proof Submitted").length} awaiting payment review
            </>
          )}
        </p>


        {loadError && (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, city or ID"
              className="pl-9"
              aria-label="Search submissions"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by submission date"
            className="w-auto"
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
              Clear date
            </Button>
          )}
          <div className="flex gap-1.5">
            {["All", "Child", "Female", "Male"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  typeFilter === t ? "border-brand bg-brand text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment
          </span>
          {["All", ...PAYMENT_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                statusFilter === s ? "border-brand bg-brand text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {tab === "plans" ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Plan status
              </span>
              {["All", ...DIET_PLAN_STATUSES].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlanFilter(s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    planFilter === s ? "border-brand bg-brand text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Submission ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Diet plan</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((s) => {
                    const plan = planFor(s.recordId);
                    return (
                      <tr key={s.recordId} className="border-t hover:bg-secondary/40">
                        <td className="px-4 py-3 font-medium">{s.name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{s.submissionId}</td>
                        <td className="px-4 py-3">{s.type}</td>
                        <td className="px-4 py-3">{s.phone}</td>
                        <td className="px-4 py-3">{s.city}</td>
                        <td className="px-4 py-3">{packageName(s.packageKey)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.paymentStatus || "Pending"} />
                        </td>
                        <td className="px-4 py-3">
                          <PlanBadge status={plan.status} />
                          {plan.aiGeneratedAt && (
                            <span className="mt-1 block text-[11px] font-medium text-amber-700">
                              AI Draft — Pending Professional Review
                            </span>
                          )}
                          {plan.aiReviewRequired && (
                            <span className="mt-0.5 block text-[11px] font-medium text-destructive">
                              Professional review required before release.
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {(plan.status === "Consultant Approved" || plan.status === "Released") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  void downloadDietPlanPdf(plan, {
                                    submissionId: s.submissionId,
                                    packageLabel: packageName(s.packageKey),
                                  })
                                }
                              >
                                <Download className="size-4" /> PDF
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPlanTarget(s);
                                setPlanError("");
                                setPlanMsg("");
                              }}
                            >
                              {plan.status === "Not Started" ? "Create plan" : "Edit plan"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPlans.length === 0 && !busy && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>

        <div className="mt-5 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Submission ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">BMI</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.recordId} className="border-t hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">{s.submissionId}</td>
                  <td className="px-4 py-3">{s.type}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.city}</td>
                  <td className="px-4 py-3">{s.bmi}</td>
                  <td className="px-4 py-3">{packageName(s.packageKey)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.paymentStatus || "Pending"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(s);
                        setReviewNote(s.paymentReviewNote || "");
                        setReviewError("");
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !busy && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>

      {planTarget && (
        <DietPlanEditor
          key={planTarget.recordId}
          submission={editorSubmission(planTarget)}
          plan={planFor(planTarget.recordId)}
          saving={planBusy}
          error={planError}
          message={planMsg}
          onClose={() => setPlanTarget(null)}
          onSave={(p) => void handleSavePlan(p)}
          aiBusy={aiBusy}
          onGenerate={handleGenerateDraft}
        />
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Submission ${selected.submissionId}`}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-extrabold text-brand-dark">{selected.name || "—"}</h2>
                <p className="font-mono text-xs text-muted-foreground">{selected.submissionId}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setSelected(null)}>
                <X className="size-4" />
              </Button>
            </div>

            <section className="mt-5 rounded-2xl border bg-secondary/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-brand-dark">Payment</h3>
                <StatusBadge status={selected.paymentStatus || "Pending"} />
              </div>
              <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Package</dt>
                  <dd className="text-muted-foreground">{packageName(selected.packageKey)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Reference</dt>
                  <dd className="text-muted-foreground">{selected.paymentReference || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Payment method</dt>
                  <dd className="text-muted-foreground">{methodLabel(selected.paymentMethod)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Amount paid</dt>
                  <dd className="text-muted-foreground">{selected.paymentAmount || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Payment date</dt>
                  <dd className="text-muted-foreground">{selected.paymentDate || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Name on payment</dt>
                  <dd className="text-muted-foreground">{selected.paymentClientName || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">WhatsApp</dt>
                  <dd className="text-muted-foreground">{selected.paymentWhatsapp || selected.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Proof submitted</dt>
                  <dd className="text-muted-foreground">
                    {selected.paymentSubmittedAt ? new Date(selected.paymentSubmittedAt).toLocaleString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Reviewed</dt>
                  <dd className="text-muted-foreground">
                    {selected.paymentReviewedAt ? new Date(selected.paymentReviewedAt).toLocaleString() : "—"}
                  </dd>
                </div>
                {selected.paymentNote && (
                  <div className="sm:col-span-2">
                    <dt className="font-semibold">Client note</dt>
                    <dd className="text-muted-foreground">{selected.paymentNote}</dd>
                  </div>
                )}
                {selected.paymentReviewNote && (
                  <div className="sm:col-span-2">
                    <dt className="font-semibold">Review note</dt>
                    <dd className="text-muted-foreground">{selected.paymentReviewNote}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selected.paymentProofPath || proofBusy}
                  onClick={() => void openProof()}
                >
                  {proofBusy ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
                  {selected.paymentProofPath ? "View payment proof" : "No proof uploaded"}
                </Button>
              </div>

              <div className="mt-4">
                <label htmlFor="reviewnote" className="mb-1.5 block text-sm font-semibold">
                  Review note (optional)
                </label>
                <Textarea
                  id="reviewnote"
                  rows={2}
                  maxLength={600}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>

              {reviewError && <p className="mt-2 text-sm font-medium text-destructive">{reviewError}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" disabled={reviewBusy} onClick={() => void handleReview("Verified")}>
                  {reviewBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Verify
                  payment
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={reviewBusy}
                  onClick={() => void handleReview("Rejected")}
                >
                  <X className="size-4" /> Reject
                </Button>
              </div>
            </section>

            <dl className="mt-5 divide-y">
              {Object.entries(selected.data).map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[240px_1fr]">
                  <dt className="text-sm font-semibold text-foreground">{labelFor(selected.type, k)}</dt>
                  <dd className="text-sm text-muted-foreground">{formatValue(v) || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Package settings"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="my-8 w-full max-w-3xl rounded-3xl border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-lg font-extrabold text-brand-dark">Package & payment settings</h2>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setSettingsOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-1.5 sm:max-w-40">
                <label htmlFor="currency" className="text-sm font-semibold">
                  Currency label
                </label>
                <Input
                  id="currency"
                  value={settings.currency}
                  maxLength={10}
                  onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="instructions" className="text-sm font-semibold">
                  Payment instructions shown to clients
                </label>
                <Textarea
                  id="instructions"
                  rows={3}
                  maxLength={1000}
                  value={settings.paymentInstructions}
                  onChange={(e) => setSettings((p) => ({ ...p, paymentInstructions: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-4">
              <h3 className="font-display text-base font-bold text-brand-dark">
                Payment details shown to clients
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Bank, wallet and WhatsApp details. Leave a field empty to hide it from clients.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["serviceFee", "Initial service fee"],
                    ["currency", "Currency label"],
                    ["bankName", "Bank name"],
                    ["bankAccountTitle", "Bank account title"],
                    ["bankAccountNumber", "Bank account number"],
                    ["bankIban", "IBAN"],
                    ["easypaisaTitle", "Easypaisa title"],
                    ["easypaisaNumber", "Easypaisa number"],
                    ["easypaisaIban", "Easypaisa IBAN"],
                    ["jazzcashTitle", "JazzCash title"],
                    ["jazzcashNumber", "JazzCash number"],
                    ["whatsappNumber", "WhatsApp number (e.g. 923001234567)"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="grid gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                    <Input
                      value={field === "serviceFee" ? channels.serviceFee : (channels[field] as string)}
                      type={field === "serviceFee" ? "number" : "text"}
                      maxLength={120}
                      onChange={(e) =>
                        setChannels((prev) => ({
                          ...prev,
                          [field]: field === "serviceFee" ? Number(e.target.value) || 0 : e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Payment note (English)</label>
                  <Textarea
                    rows={3}
                    maxLength={1000}
                    value={channels.noteEn}
                    onChange={(e) => setChannels((p) => ({ ...p, noteEn: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Payment note (Urdu)</label>
                  <Textarea
                    rows={3}
                    maxLength={1000}
                    value={channels.noteUr}
                    onChange={(e) => setChannels((p) => ({ ...p, noteUr: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {settings.packages.map((p, i) => (
                <div key={p.key} className="rounded-2xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{p.name || p.key}</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={p.active}
                        onChange={(e) => updatePackage(i, { active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Name (English)</label>
                      <Input value={p.name} maxLength={60} onChange={(e) => updatePackage(i, { name: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Name (Urdu)</label>
                      <Input
                        value={p.nameUr}
                        maxLength={60}
                        onChange={(e) => updatePackage(i, { nameUr: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Duration label</label>
                      <Input
                        value={p.durationLabel}
                        maxLength={60}
                        onChange={(e) => updatePackage(i, { durationLabel: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Price</label>
                      <Input
                        type="number"
                        min={0}
                        value={p.price}
                        onChange={(e) => updatePackage(i, { price: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Max price (optional)</label>
                      <Input
                        type="number"
                        min={0}
                        value={p.priceMax ?? ""}
                        onChange={(e) =>
                          updatePackage(i, { priceMax: e.target.value === "" ? null : Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Duration (days)</label>
                      <Input
                        type="number"
                        min={1}
                        value={p.durationDays}
                        onChange={(e) => updatePackage(i, { durationDays: Number(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Clients see: {formatPrice(p, settings.currency)} · {p.durationLabel}
                  </p>
                </div>
              ))}
            </div>

            {settingsMsg && <p className="mt-4 text-sm font-medium text-brand-dark">{settingsMsg}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Close
              </Button>
              <Button disabled={settingsBusy} onClick={() => void handleSaveSettings()}>
                {settingsBusy && <Loader2 className="size-4 animate-spin" />} Save settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
