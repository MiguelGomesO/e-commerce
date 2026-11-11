import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";

const sign = () =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "dev-secret").update("admin").digest("hex");

export function passwordOk(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminSession() {
  (await cookies()).set(COOKIE, sign(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(sign());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Use no topo de toda página e server action do admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
