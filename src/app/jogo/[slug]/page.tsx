import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { brl, offPercent, pixPrice } from "@/lib/money";
import { Shell } from "@/components/Shell";
import { AddToCart } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await db.game.findUnique({ where: { slug } });
  if (!g || !g.published) notFound();
  const off = offPercent(g.priceCents, g.oldPriceCents);

  return (
    <Shell>
      <div className="wrap stack" style={{ gap: 32 }}>
        <Link href="/" className="muted" style={{ fontSize: 14 }}>← Voltar à loja</Link>
        <div className="detail">
          <div><div className="big-cover">
            <Image src={g.hero || g.cover} alt={`Capa de ${g.name}`} fill sizes="(max-width: 900px) 100vw, 620px" className="fit" priority />
          </div></div>
          <div className="stack" style={{ gap: 20 }}>
            <span className="muted" style={{ fontSize: 13 }}>Loja / {g.platform} / {g.genre}</span>
            <h1 style={{ fontSize: 48, lineHeight: 1.05 }}>{g.name}</h1>
            <p className="muted">{g.description}</p>
            <span className="badge" style={{ alignSelf: "flex-start", background: "var(--accent-soft)" }}>{g.platform}</span>
            <div className="card stack" style={{ gap: 8 }}>
              <div className="row" style={{ alignItems: "baseline" }}>
                <span className="display" style={{ fontSize: 40, fontWeight: 700 }}>{brl(g.priceCents)}</span>
                {off > 0 && g.oldPriceCents && <span className="old">{brl(g.oldPriceCents)}</span>}
                {off > 0 && <span className="badge warn">−{off}%</span>}
              </div>
              <span className="pixline" style={{ fontSize: 15 }}>{brl(pixPrice(g.priceCents))} no Pix (5% off)</span>
              {g.stock > 0 && g.stock < 10 && <span className="badge warn" style={{ alignSelf: "flex-start" }}>Restam {g.stock} chaves</span>}
              <div style={{ marginTop: 8 }}><AddToCart game={g} big /></div>
            </div>
            <span className="muted" style={{ fontSize: 13 }}>Chave digital enviada por e-mail após a aprovação do pagamento.</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
