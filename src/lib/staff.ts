export type StaffRole = "admin" | "team";

export interface StaffMember {
  id: string;
  username: string;
  name: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
}

export const ROLE_LABEL: Record<StaffRole, { en: string; ur: string }> = {
  admin: { en: "Admin", ur: "ایڈمن" },
  team: { en: "Team / Consultant", ur: "ٹیم / کنسلٹنٹ" },
};

export interface TokenIdentity {
  username: string;
  role: StaffRole;
  exp: number;
}

function b64urlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const full = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  if (typeof atob === "function") return atob(full);
  return Buffer.from(full, "base64").toString("binary");
}

/** Reads the (signed, server-verified) identity out of a session token. Display use only. */
export function decodeToken(token: string | null | undefined): TokenIdentity | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length === 3 && parts[0] === "v2") {
    try {
      const payload = JSON.parse(b64urlDecode(parts[1]!)) as { u?: string; r?: string; exp?: number };
      const role: StaffRole = payload.r === "team" ? "team" : "admin";
      return { username: payload.u || "owner", role, exp: Number(payload.exp) || 0 };
    } catch {
      return null;
    }
  }
  // Legacy owner token (exp.signature) — always full admin.
  if (parts.length === 2) return { username: "owner", role: "admin", exp: Number(parts[0]) || 0 };
  return null;
}

export function isAdminToken(token: string | null | undefined) {
  return decodeToken(token)?.role === "admin";
}
