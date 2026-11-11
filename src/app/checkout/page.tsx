"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { brl, pixPrice } from "@/lib/money";
import { Shell } from "@/components/Shell";

export default function CheckoutPage() {
  const { lines, subtotalCents } = useCart();
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pixTotal = lines.reduce((s, l) => s + pixPrice(l.priceCents) * l.qty, 0);
  const total = method === "pix" ? pixTotal : subtotalCents;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, method, items: lines.map((l) => ({ slug: l.slug, qty: l.qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Não foi possível iniciar o pagamento.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <Shell>
        <div className="wrap stack" style={{ alignItems: "center" }}>
          <p className="muted">Seu carrinho está vazio.</p>
          <Link className="btn primary" href="/">Ver jogos</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="notice warn" style={{ borderRadius: 0 }}>
        Modo de teste: nenhuma cobrança real. Cartão de teste Stripe 4242 4242 4242 4242, qualquer data futura e CVC.
      </div>
      <form className="wrap" onSubmit={pay}>
        <h1 style={{ fontSize: 40, marginBottom: 24 }}>Pagamento</h1>
        <div className="cols">
          <main className="stack" style={{ gap: 24 }}>
            <section className="card stack">
              <h2 style={{ fontSize: 20 }}>Seus dados</h2>
              <div className="methods">
                <div className="field"><label htmlFor="nome">Nome completo</label><input id="nome" className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
                <div className="field"><label htmlFor="email">E-mail (a chave chega aqui)</label><input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              </div>
            </section>
            <section className="card stack">
              <h2 style={{ fontSize: 20 }}>Forma de pagamento</h2>
              <div className="methods">
                <button type="button" className="method" aria-pressed={method === "pix"} onClick={() => setMethod("pix")}>Pix<small>5% de desconto · aprovação na hora</small></button>
                <button type="button" className="method" aria-pressed={method === "card"} onClick={() => setMethod("card")}>Cartão (Stripe)<small>Visa, Mastercard · modo teste</small></button>
              </div>
              <p className="muted" style={{ fontSize: 14 }}>
                {method === "pix"
                  ? "Você verá o QR Code e o código Pix copia e cola na próxima etapa."
                  : "Você será levado ao ambiente seguro do Stripe para informar o cartão. Os dados do cartão nunca passam pelo nosso servidor."}
              </p>
            </section>
          </main>
          <aside className="card stack">
            <h2 style={{ fontSize: 22 }}>Pedido</h2>
            {lines.map((l) => (
              <div className="sum" key={l.slug} style={{ fontSize: 14 }}><span>{l.name} × {l.qty}</span><span>{brl(l.priceCents * l.qty)}</span></div>
            ))}
            <div className="sum" style={{ fontSize: 14 }}><span>Desconto Pix</span><span>{method === "pix" ? `− ${brl(subtotalCents - pixTotal)}` : brl(0)}</span></div>
            <div className="sum total"><span>Total</span><strong>{brl(total)}</strong></div>
            {error && <div className="notice bad" role="alert">{error}</div>}
            <button className="btn primary big" disabled={busy}>{busy ? "Processando…" : method === "pix" ? "Pagar com Pix" : `Pagar ${brl(total)}`}</button>
          </aside>
        </div>
      </form>
    </Shell>
  );
}
