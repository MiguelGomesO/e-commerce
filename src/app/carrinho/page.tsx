"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { brl, pixPrice } from "@/lib/money";
import { Shell } from "@/components/Shell";

export default function CartPage() {
  const { lines, subtotalCents, setQty, remove } = useCart();
  const pixTotal = lines.reduce((s, l) => s + pixPrice(l.priceCents) * l.qty, 0);

  return (
    <Shell>
      <div className="wrap">
        <h1 style={{ fontSize: 40, marginBottom: 24 }}>Seu carrinho</h1>
        {lines.length === 0 ? (
          <div className="card stack" style={{ alignItems: "center", textAlign: "center", padding: 48 }}>
            <p className="muted">Seu carrinho está vazio.</p>
            <Link className="btn primary" href="/">Ver jogos</Link>
          </div>
        ) : (
          <div className="cols">
            <main className="stack">
              {lines.map((l) => (
                <div className="line" key={l.slug}>
                  <div className="thumb"><Image src={l.cover} alt="" fill sizes="96px" className="fit" /></div>
                  <div className="stack" style={{ flex: "1 1 200px", gap: 6, minWidth: 0 }}>
                    <Link href={`/jogo/${l.slug}`} className="display" style={{ fontWeight: 700, fontSize: 20 }}>{l.name}</Link>
                    <span className="muted" style={{ fontSize: 14 }}>{l.platform} · chave digital</span>
                  </div>
                  <div className="qty">
                    <button aria-label={`Diminuir ${l.name}`} onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
                    <span aria-live="polite">{l.qty}</span>
                    <button aria-label={`Aumentar ${l.name}`} onClick={() => setQty(l.slug, Math.min(10, l.qty + 1))}>+</button>
                  </div>
                  <span style={{ width: 110, textAlign: "right", fontWeight: 600, fontSize: 18 }}>{brl(l.priceCents * l.qty)}</span>
                  <button className="btn" aria-label={`Remover ${l.name}`} onClick={() => remove(l.slug)} style={{ width: 44, padding: 0 }}>
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                  </button>
                </div>
              ))}
            </main>
            <aside className="card stack">
              <h2 style={{ fontSize: 22 }}>Resumo</h2>
              <div className="sum"><span>Subtotal</span><span>{brl(subtotalCents)}</span></div>
              <div className="sum"><span>Desconto Pix (5%)</span><span>− {brl(subtotalCents - pixTotal)}</span></div>
              <div className="sum total"><span>Total no Pix</span><strong>{brl(pixTotal)}</strong></div>
              <Link href="/checkout" className="btn primary big">Ir para o checkout</Link>
              <Link href="/" className="muted" style={{ textAlign: "center", fontSize: 14 }}>Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </Shell>
  );
}
