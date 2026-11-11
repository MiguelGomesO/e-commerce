import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { brl } from "@/lib/money";
import { setPublished } from "../actions";

export default async function AdminGames() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [games, paidToday, pending] = await Promise.all([
    db.game.findMany({ orderBy: { createdAt: "asc" } }),
    db.order.findMany({ where: { status: "paid", createdAt: { gte: startOfDay } } }),
    db.order.count({ where: { status: "pending", method: "pix" } }),
  ]);
  const low = games.filter((g) => g.stock < 10).length;
  const revenue = paidToday.reduce((s, o) => s + o.totalCents, 0);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 36 }}>Jogos</h1>
        <Link href="/admin/jogos/novo" className="btn primary">+ Novo jogo</Link>
      </div>
      <div className="stats">
        <div className="stat"><span className="muted" style={{ fontSize: 13 }}>Vendas hoje</span><strong>{brl(revenue)}</strong></div>
        <div className="stat"><span className="muted" style={{ fontSize: 13 }}>Pedidos pagos hoje</span><strong>{paidToday.length}</strong></div>
        <div className="stat"><span className="muted" style={{ fontSize: 13 }}>Pix aguardando</span><strong>{pending}</strong></div>
        <div className="stat"><span className="muted" style={{ fontSize: 13 }}>Chaves em baixa</span><strong style={{ color: "var(--warn)" }}>{low} jogos</strong></div>
      </div>
      <div className="tablebox">
        <table>
          <thead><tr><th>Jogo</th><th>Preço</th><th>Chaves</th><th>Status</th><th /></tr></thead>
          <tbody>
            {games.map((g) => {
              const out = g.stock === 0;
              const lowStock = g.stock > 0 && g.stock < 10;
              return (
                <tr key={g.id}>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <span style={{ position: "relative", width: 36, height: 54, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}><Image src={g.cover} alt="" fill sizes="36px" className="fit" /></span>
                      <div><strong>{g.name}</strong><div className="muted" style={{ fontSize: 12 }}>{g.platform}</div></div>
                    </div>
                  </td>
                  <td>{brl(g.priceCents)}</td>
                  <td style={{ fontWeight: 600, color: out ? "var(--bad)" : lowStock ? "var(--warn)" : undefined }}>{g.stock}</td>
                  <td>
                    {!g.published ? <span className="badge bad">Despublicado</span> : out ? <span className="badge bad">Esgotado</span> : lowStock ? <span className="badge warn">Estoque baixo</span> : <span className="badge ok">Publicado</span>}
                  </td>
                  <td>
                    <div className="row" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                      <form action={setPublished}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="published" value={String(!g.published)} />
                        <button className="btn">{g.published ? "Despublicar" : "Publicar"}</button>
                      </form>
                      <Link href={`/admin/jogos/${g.id}`} className="btn">Editar</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
