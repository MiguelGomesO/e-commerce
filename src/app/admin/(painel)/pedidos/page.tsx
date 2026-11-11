import { db } from "@/lib/db";
import { brl } from "@/lib/money";

const STATUS: Record<string, [string, string]> = {
  paid: ["Pago", "ok"],
  pending: ["Aguardando", "warn"],
  canceled: ["Cancelado", "bad"],
};

export default async function Orders() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { items: true } });
  return (
    <>
      <h1 style={{ fontSize: 36 }}>Pedidos</h1>
      <div className="tablebox">
        <table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} className="muted">Nenhum pedido ainda.</td></tr>}
            {orders.map((o) => {
              const [label, tone] = STATUS[o.status] ?? [o.status, "warn"];
              return (
                <tr key={o.id}>
                  <td>{o.id.slice(-8)}<div className="muted" style={{ fontSize: 12 }}>{o.createdAt.toLocaleString("pt-BR")}</div></td>
                  <td>{o.name}<div className="muted" style={{ fontSize: 12 }}>{o.email}</div></td>
                  <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                  <td>{o.method === "pix" ? "Pix" : "Cartão"}</td>
                  <td>{brl(o.totalCents)}</td>
                  <td><span className={`badge ${tone}`}>{label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
