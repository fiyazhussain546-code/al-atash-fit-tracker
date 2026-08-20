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

export async function issueToken(hours = 12) {
  const secret = await sessionSecret();
  if (!secret) throw new Error("Admin password is not configured");
  const exp = String(Date.now() + hours * 3600_000);
  return `${exp}.${await sign(exp, secret)}`;
}

export async function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const secret = await sessionSecret();
  if (!secret) return false;
  return timingSafeEqual(await sign(exp, secret), sig);
}
