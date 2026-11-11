import Image from "next/image";
import Link from "next/link";
import { brl, offPercent, pixPrice } from "@/lib/money";
import { AddToCart } from "./AddToCart";

type G = {
  slug: string; name: string; platform: string; genre: string; cover: string;
  priceCents: number; oldPriceCents: number | null; stock: number;
};

export function GameCard({ g }: { g: G }) {
  const off = offPercent(g.priceCents, g.oldPriceCents);
  return (
    <article className="game">
      <div className="art" aria-hidden="true">
        <Image src={g.cover} alt="" fill sizes="(max-width: 640px) 90vw, 280px" className="fit" />
      </div>
      <span className="tag">{g.platform}</span>
      {off > 0 && <span className="off">−{off}%</span>}
      <div className="body">
        <Link href={`/jogo/${g.slug}`} className="name">{g.name}</Link>
        <span style={{ fontSize: 14, opacity: 0.85 }}>{g.genre}</span>
        <div className="row" style={{ gap: 8, marginTop: 6, alignItems: "baseline" }}>
          <span className="price">{brl(g.priceCents)}</span>
          {off > 0 && g.oldPriceCents && <span className="old">{brl(g.oldPriceCents)}</span>}
        </div>
        <span className="pixline">{brl(pixPrice(g.priceCents))} no Pix</span>
        <div style={{ marginTop: 10 }}><AddToCart game={g} /></div>
      </div>
    </article>
  );
}
