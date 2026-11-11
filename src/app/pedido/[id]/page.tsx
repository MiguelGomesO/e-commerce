import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { brl } from "@/lib/money";
import { markPaid } from "@/lib/orders";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { Shell } from "@/components/Shell";
import { ClearCart } from "@/components/ClearCart";

export const dynamic = "force-dynamic";

async function simulatePay(formData: FormData) {
  "use server";
  if (stripeEnabled) return; // só existe no modo simulado
  const id = String(formData.get("id"));
  await markPaid(id);
  redirect(`/pedido/${id}`);
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  // Sem webhook (ex.: desenvolvimento local), confirma consultando o Stripe ao abrir a página.
  if (order.status === "pending" && stripeEnabled && order.stripeSessionId) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      if (s.payment_status === "paid") {
        await markPaid(order.id);
        order = (await db.order.findUnique({ where: { id }, include: { items: true } }))!;
      }
    } catch {}
  }

  const paid = order.status === "paid";

  return (
    <Shell>
      {(paid || order.status === "pending") && <ClearCart />}
      <div className="wrap stack" style={{ maxWidth: 720, gap: 24 }}>
        <h1 style={{ fontSize: 40 }}>{paid ? "Pagamento aprovado" : "Aguardando pagamento"}</h1>
        {paid ? (
          <div className="notice" role="status">As chaves foram enviadas para {order.email}. Obrigado pela compra, {order.name.split(" ")[0]}!</div>
        ) : order.method === "pix" && !stripeEnabled ? (
          <div className="card row" style={{ gap: 24 }}>
            <div className="qr">
              <svg role="img" aria-label="QR Code Pix de exemplo" viewBox="0 0 21 21" width="144" height="144" shapeRendering="crispEdges"><path fill="#0e1116" d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0zM2 2v3h3V2zM16 2v3h3V2zM2 16v3h3v-3zM8 0h2v2H8zM11 1h2v2h-2zM8 4h1v3H8zM10 5h3v2h-3zM0 8h2v2H0zM3 8h3v1H3zM8 8h2v2H8zM11 9h3v2h-3zM15 8h2v3h-2zM18 8h3v2h-3zM8 12h3v2H8zM12 12h2v3h-2zM16 12h2v2h-2zM19 11h2v3h-2zM8 15h2v3H8zM11 16h3v2h-3zM15 15h3v3h-3zM19 16h2v2h-2zM8 19h4v2H8zM14 19h2v2h-2zM18 19h3v2h-3z" /></svg>
            </div>
            <div className="stack" style={{ flex: "1 1 260px" }}>
              <strong>Pix simulado</strong>
              <span className="muted" style={{ fontSize: 14 }}>Modo de teste sem Stripe: este QR não é um Pix real. Clique abaixo para simular a aprovação.</span>
              <div className="code">PIX-SIMULADO-{order.id}</div>
              <form action={simulatePay}>
                <input type="hidden" name="id" value={order.id} />
                <button className="btn primary">Simular pagamento Pix</button>
              </form>
            </div>
          </div>
        ) : order.method === "card" && !stripeEnabled ? (
          <div className="card stack">
            <span className="muted">Modo de teste sem Stripe: simule a aprovação do cartão.</span>
            <form action={simulatePay}>
              <input type="hidden" name="id" value={order.id} />
              <button className="btn primary">Simular pagamento no cartão</button>
            </form>
          </div>
        ) : (
          <div className="notice warn">Estamos aguardando a confirmação do Stripe. Atualize esta página em instantes.</div>
        )}

        <section className="card stack">
          <h2 style={{ fontSize: 20 }}>Pedido {order.id.slice(-8)}</h2>
          {order.items.map((i) => (
            <div className="sum" key={i.id}><span>{i.name} × {i.qty}</span><span>{brl(i.unitCents * i.qty)}</span></div>
          ))}
          <div className="sum total"><span>Total ({order.method === "pix" ? "Pix" : "cartão"})</span><strong>{brl(order.totalCents)}</strong></div>
        </section>
        <Link href="/" className="btn" style={{ alignSelf: "flex-start" }}>Voltar à loja</Link>
      </div>
    </Shell>
  );
}
