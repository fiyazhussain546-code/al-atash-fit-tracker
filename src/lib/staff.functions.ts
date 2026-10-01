import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StaffMember } from "@/lib/staff";

const token = z.string().min(1).max(1000);

export const staffList = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token }).parse(i))
  .handler(async ({ data }) => {
    const { verifyAdmin, listStaff } = await import("@/lib/admin-auth.server");
    if (!(await verifyAdmin(data.token))) {
      return { ok: false as const, error: "Only admins can manage roles.", members: [] as StaffMember[] };
    }
    try {
      return { ok: true as const, error: "", members: await listStaff() };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not load team.", members: [] as StaffMember[] };
    }
  });

export const staffSave = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        token,
        member: z.object({
          id: z.string().max(60).nullable().default(null),
          username: z.string().trim().min(3, "Username must be at least 3 characters").max(40).regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, dash or underscore"),
          name: z.string().max(120).default(""),
          role: z.enum(["admin", "team"]),
          active: z.boolean().default(true),
          password: z.string().max(200).default(""),
        }),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { verifyAdmin, saveStaff } = await import("@/lib/admin-auth.server");
    if (!(await verifyAdmin(data.token))) return { ok: false as const, error: "Only admins can manage roles." };
    try {
      return await saveStaff(data.member);
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not save team member." };
    }
  });

export const staffDelete = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token, id: z.string().min(1).max(60) }).parse(i))
  .handler(async ({ data }) => {
    const { verifyAdmin, deleteStaff } = await import("@/lib/admin-auth.server");
    if (!(await verifyAdmin(data.token))) return { ok: false as const, error: "Only admins can manage roles." };
    try {
      return await deleteStaff(data.id);
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Could not remove team member." };
    }
  });
