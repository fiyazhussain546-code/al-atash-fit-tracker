const encoder = new TextEncoder();
const SETTINGS_KEY = "admin_auth";

interface AdminAuthRecord {
  [key: string]: string;
  salt: string;
  hash: string;
  sessionSecret: string;
  createdAt: string;
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomB64(len = 32) {
  return b64url(crypto.getRandomValues(new Uint8Array(len)));
}

async function pbkdf2(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return b64url(bits);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function loadAdminAuth(): Promise<AdminAuthRecord | null> {
  const db = await admin();
  const { data } = await db.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  const value = (data?.value ?? null) as Partial<AdminAuthRecord> | null;
  if (value?.salt && value?.hash && value?.sessionSecret) return value as AdminAuthRecord;
  return null;
}

/** Env fallback keeps an owner-provided ADMIN_PASSWORD working if it was set. */
export async function isConfigured() {
  if (process.env["ADMIN_PASSWORD"]) return true;
  return (await loadAdminAuth()) !== null;
}

export async function setupPassword(password: string) {
  if (await loadAdminAuth()) return { ok: false as const, error: "Admin password is already set." };
  const salt = randomB64(16);
  const record: AdminAuthRecord = {
    salt,
    hash: await pbkdf2(password, salt),
    sessionSecret: randomB64(32),
    createdAt: new Date().toISOString(),
  };
  const db = await admin();
  const { error } = await db
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: record, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, error: "" };
}

export async function changePassword(current: string, next: string) {
  const rec = await loadAdminAuth();
  if (!rec) return { ok: false as const, error: "Admin password is not set up yet." };
  if (!timingSafeEqual(await pbkdf2(current, rec.salt), rec.hash)) {
    return { ok: false as const, error: "Current password is incorrect." };
  }
  const salt = randomB64(16);
  const record: AdminAuthRecord = {
    salt,
    hash: await pbkdf2(next, salt),
    sessionSecret: randomB64(32),
    createdAt: rec.createdAt,
  };
  const db = await admin();
  const { error } = await db
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: record, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, error: "" };
}

async function sessionSecret() {
  const rec = await loadAdminAuth();
  if (rec) return rec.sessionSecret;
  const env = process.env["ADMIN_PASSWORD"];
  if (env) return `env:${env}`;
  return null;
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function checkPassword(candidate: string) {
  const rec = await loadAdminAuth();
  if (rec) return timingSafeEqual(await pbkdf2(candidate, rec.salt), rec.hash);
  const env = process.env["ADMIN_PASSWORD"];
  if (env) return timingSafeEqual(candidate, env);
  return false;
}

export async function issueToken(hours = 12, username = "owner", role: StaffRole = "admin") {
  const secret = await sessionSecret();
  if (!secret) throw new Error("Admin password is not configured");
  const exp = Date.now() + hours * 3600_000;
  const payload = b64url(encoder.encode(JSON.stringify({ u: username, r: role, exp })));
  return `v2.${payload}.${await sign(payload, secret)}`;
}

/** Returns the verified identity for a session token, or null when invalid/expired. */
export async function verifyAccess(
  token: string | undefined,
): Promise<{ username: string; role: StaffRole } | null> {
  if (!token) return null;
  const secret = await sessionSecret();
  if (!secret) return null;
  const parts = token.split(".");

  if (parts.length === 3 && parts[0] === "v2") {
    const [, payload, sig] = parts as [string, string, string];
    if (!timingSafeEqual(await sign(payload, secret), sig)) return null;
    let parsed: { u?: string; r?: string; exp?: number };
    try {
      parsed = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    } catch {
      return null;
    }
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    const role: StaffRole = parsed.r === "team" ? "team" : "admin";
    const username = parsed.u || "owner";
    if (username !== "owner") {
      const member = (await listStaff()).find((m) => m.username === username);
      if (!member || !member.active) return null;
      return { username, role: member.role };
    }
    return { username, role };
  }

  // Legacy owner token: exp.signature
  const [exp, sig] = parts;
  if (!exp || !sig || parts.length !== 2) return null;
  if (Number(exp) < Date.now()) return null;
  if (!timingSafeEqual(await sign(exp, secret), sig)) return null;
  return { username: "owner", role: "admin" };
}

export async function verifyToken(token: string | undefined) {
  return (await verifyAccess(token)) !== null;
}

export async function verifyAdmin(token: string | undefined) {
  return (await verifyAccess(token))?.role === "admin";
}

// ---------------------------------------------------------------- staff users

const STAFF_KEY = "staff_users";

interface StoredStaff extends StaffMember {
  salt: string;
  hash: string;
}

async function loadStaff(): Promise<StoredStaff[]> {
  const db = await admin();
  const { data } = await db.from("app_settings").select("value").eq("key", STAFF_KEY).maybeSingle();
  const value = data?.value as { members?: StoredStaff[] } | null;
  return Array.isArray(value?.members) ? value.members : [];
}

async function persistStaff(members: StoredStaff[]) {
  const db = await admin();
  const { error } = await db
    .from("app_settings")
    .upsert(
      { key: STAFF_KEY, value: { members } as never, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

export async function listStaff(): Promise<StaffMember[]> {
  return (await loadStaff()).map(({ salt: _s, hash: _h, ...rest }) => rest);
}

const normalizeUsername = (u: string) => u.trim().toLowerCase().replace(/\s+/g, "");

export async function saveStaff(input: {
  id: string | null;
  username: string;
  name: string;
  role: StaffRole;
  active: boolean;
  password: string;
}) {
  const username = normalizeUsername(input.username);
  if (!username) return { ok: false as const, error: "Username is required." };
  if (username === "owner") return { ok: false as const, error: "‘owner’ is reserved for the main admin." };
  const members = await loadStaff();
  const existing = input.id ? members.find((m) => m.id === input.id) : undefined;
  if (input.id && !existing) return { ok: false as const, error: "This team member no longer exists." };
  if (members.some((m) => m.username === username && m.id !== input.id)) {
    return { ok: false as const, error: "That username is already taken." };
  }
  if (!existing && input.password.length < 10) {
    return { ok: false as const, error: "Password must be at least 10 characters." };
  }
  if (input.password && input.password.length < 10) {
    return { ok: false as const, error: "Password must be at least 10 characters." };
  }

  const salt = input.password ? randomB64(16) : existing!.salt;
  const hash = input.password ? await pbkdf2(input.password, salt) : existing!.hash;
  const record: StoredStaff = {
    id: existing?.id ?? randomB64(12),
    username,
    name: input.name.trim() || username,
    role: input.role,
    active: input.active,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    salt,
    hash,
  };
  const next = existing ? members.map((m) => (m.id === existing.id ? record : m)) : [...members, record];
  await persistStaff(next);
  return { ok: true as const, error: "" };
}

export async function deleteStaff(id: string) {
  const members = await loadStaff();
  await persistStaff(members.filter((m) => m.id !== id));
  return { ok: true as const, error: "" };
}

/** Password check for a named team/admin member. */
export async function checkStaffPassword(username: string, password: string) {
  const member = (await loadStaff()).find((m) => m.username === normalizeUsername(username));
  if (!member) return null;
  if (!member.active) return "inactive" as const;
  if (!timingSafeEqual(await pbkdf2(password, member.salt), member.hash)) return null;
  return member;
}

