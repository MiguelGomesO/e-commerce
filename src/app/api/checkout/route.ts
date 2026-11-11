import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pixPrice } from "@/lib/money";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  method: z.enum(["pix", "card"]),
  items: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(10) })).min(1).max(30),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const { name, email, method, items } = parsed.data;

  // Preço sempre recalculado no servidor; nunca confiamos no valor vindo do navegador.
  const games = await db.game.findMany({ where: { slug: { in: items.map((i) => i.slug) }, published: true } });
  const lines = [];
  for (const it of items) {
    const g = games.find((x) => x.slug === it.slug);
    if (!g) return NextResponse.json({ error: "Um dos jogos não está mais disponível." }, { status: 400 });
    if (g.stock < it.qty) return NextResponse.json({ error: `Estoque insuficiente de ${g.name}.` }, { status: 409 });
    lines.push({ game: g, qty: it.qty, unit: method === "pix" ? pixPrice(g.priceCents) : g.priceCents });
  }
  const total = lines.reduce((s, l) => s + l.unit * l.qty, 0);

  const order = await db.order.create({
    data: {
      name, email, method, totalCents: total,
      items: { create: lines.map((l) => ({ gameId: l.game.id, name: l.game.name, qty: l.qty, unitCents: l.unit })) },
    },
  });

  if (!stripeEnabled) return NextResponse.json({ url: `/pedido/${order.id}` });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: [method],
    customer_email: email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: lines.map((l) => ({
      quantity: l.qty,
      price_data: { currency: "brl", unit_amount: l.unit, product_data: { name: l.game.name } },
    })),
    success_url: `${appUrl}/pedido/${order.id}`,
    cancel_url: `${appUrl}/checkout`,
  });
  await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  return NextResponse.json({ url: session.url });
}
