"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearAdminSession, passwordOk, requireAdmin, setAdminSession } from "@/lib/auth";

export async function login(_: unknown, formData: FormData) {
  if (!passwordOk(String(formData.get("password") ?? ""))) return { error: "Senha incorreta." };
  await setAdminSession();
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const reais = z.preprocess((v) => Math.round(parseFloat(String(v).replace(",", ".")) * 100), z.number().int().min(0).max(10_000_000));

const GameForm = z.object({
  name: z.string().trim().min(2).max(120),
  platform: z.string().trim().min(1).max(40),
  genre: z.string().trim().min(1).max(60),
  description: z.string().trim().max(2000),
  price: reais,
  oldPrice: z.preprocess((v) => (String(v ?? "").trim() === "" ? null : v), reais.nullable()),
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

export async function saveGame(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = GameForm.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Confira os campos (preço, estoque e nome)." };
  const { name, platform, genre, description, price, oldPrice, stock } = parsed.data;
  const data = {
    name, platform, genre, description, stock,
    priceCents: price, oldPriceCents: oldPrice,
    published: formData.get("published") === "on",
  };
  const id = Number(formData.get("id"));
  if (id) {
    await db.game.update({ where: { id }, data });
  } else {
    let slug = slugify(name) || "jogo";
    if (await db.game.findUnique({ where: { slug } })) slug += "-" + Date.now().toString(36);
    await db.game.create({ data: { ...data, slug } });
  }
  revalidatePath("/");
  redirect("/admin");
}

export async function setPublished(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.game.update({ where: { id }, data: { published: formData.get("published") === "true" } });
  revalidatePath("/");
  revalidatePath("/admin");
}
