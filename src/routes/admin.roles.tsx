import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABEL, isAdminToken, type StaffMember, type StaffRole } from "@/lib/staff";
import { staffDelete, staffList, staffSave } from "@/lib/staff.functions";

const TOKEN_KEY = "alatash_admin_token";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Team & Roles — AL-ATASH FIT Admin" },
      { name: "description", content: "Manage admin and team member access for AL-ATASH FIT." },
      { property: "og:title", content: "Team & Roles — AL-ATASH FIT Admin" },
      { property: "og:description", content: "Manage admin and team member access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RolesPage,
});

interface Form {
  id: string | null;
  username: string;
  name: string;
  role: StaffRole;
  active: boolean;
  password: string;
}

const emptyForm = (): Form => ({ id: null, username: "", name: "", role: "team", active: true, password: "" });

function RolesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useServerFn(staffList);
  const save = useServerFn(staffSave);
  const del = useServerFn(staffDelete);

  const load = useCallback(
    async (t: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await list({ data: { token: t } });
        if (res.ok) setMembers(res.members);
        else setError(res.error);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load team.");
      } finally {
        setLoading(false);
      }
    },
    [list],
  );

  useEffect(() => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (!t || !isAdminToken(t)) {
      setLoading(false);
      setError("Only admins can manage roles. Please sign in as an admin. / صرف ایڈمن رسائی۔");
      return;
    }
    setToken(t);
    void load(t);
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !form) return;
    setBusy(true);
    setError("");
    try {
      const res = await save({ data: { token, member: form } });
      if (res.ok) {
        setForm(null);
        setToast(form.id ? "Team member updated." : "Team member added.");
        void load(token);
      } else setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: StaffMember) {
    if (!token || !confirm(`Remove ${m.name || m.username}? They will lose access immediately.`)) return;
    const res = await del({ data: { token, id: m.id } });
    if (res.ok) {
      setToast("Team member removed.");
      void load(token);
    } else setError(res.error);
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Logo compact />
          <Link
            to="/admin"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="size-4" /> Back to admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">
          Team & roles <span className="font-urdu text-lg font-semibold">/ ٹیم اور رولز</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admins have full access (Weight Assessment, Eye Care, doctors & centres, payments, CSV export, roles).
          Team / Consultant members can only open the Eye Care dashboard to view and update patients, assessments,
          recommendations, appointments and follow-ups.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {toast && (
          <div className="mt-4 rounded-2xl border border-brand/30 bg-brand-soft p-4 text-sm font-medium text-brand-dark">
            {toast}
          </div>
        )}

        {token && (
          <>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => { setToast(""); setForm(emptyForm()); }}>
                <Plus className="size-4" /> Add team member
              </Button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-brand" /> owner
                </div>
                <span className="text-xs text-muted-foreground">Main admin (password login) · Admin</span>
              </div>
              {loading ? (
                <div className="grid place-items-center py-10">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No team members yet. / ابھی کوئی ٹیم ممبر نہیں۔
                </p>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">@{m.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-dark">
                        {ROLE_LABEL[m.role].en}
                      </span>
                      {!m.active && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          Disabled
                        </span>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setForm({ ...m, password: "" })} aria-label="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void remove(m)} aria-label="Remove">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {form && (
          <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border bg-card p-5">
            <h2 className="font-display text-lg font-bold">{form.id ? "Edit team member" : "New team member"}</h2>
            <label className="block text-sm font-semibold">
              Full name
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              Username (used to sign in)
              <Input
                className="mt-1"
                required
                minLength={3}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <select
                className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
              >
                <option value="team">Team / Consultant — Eye Care only</option>
                <option value="admin">Admin — full access</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {form.id ? "New password (leave blank to keep)" : "Password (min. 10 characters)"}
              <Input
                className="mt-1"
                type="password"
                autoComplete="new-password"
                required={!form.id}
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Account active
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
