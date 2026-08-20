import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, LogOut, RefreshCw, Search, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminLogin, adminListSubmissions, adminAuthStatus, adminSetupPassword } from "@/lib/admin.functions";
import { allFields, type AssessmentType } from "@/lib/assessment-schema";

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
  data: Record<string, string | string[] | boolean>;
}

const TOKEN_KEY = "alatash_admin_token";

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
  const [selected, setSelected] = useState<Submission | null>(null);

  const login = useServerFn(adminLogin);
  const list = useServerFn(adminListSubmissions);
  const status = useServerFn(adminAuthStatus);
  const setup = useServerFn(adminSetupPassword);

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

  const filtered = submissions.filter((s) => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [s.submissionId, s.name, s.phone, s.city, s.type].some((v) => v.toLowerCase().includes(q));
  });

  function exportCsv() {
    const keys = new Set<string>();
    filtered.forEach((s) => Object.keys(s.data).forEach((k) => keys.add(k)));
    const cols = ["Submission ID", "Type", "Submitted At", ...Array.from(keys)];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((s) =>
      [
        s.submissionId,
        s.type,
        s.submittedAt,
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
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">Assessment submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submissions.length} total · {filtered.length} shown
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !busy && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </main>
  );
}