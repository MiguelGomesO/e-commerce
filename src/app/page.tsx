import Link from "next/link";
import { db } from "@/lib/db";
import { brl, offPercent, pixPrice } from "@/lib/money";
import { Shell } from "@/components/Shell";
import { GameCard } from "@/components/GameCard";
import { PromoCarousel, type Slide } from "@/components/PromoCarousel";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; plataforma?: string; genero?: string }> }) {
  const { q, plataforma, genero } = await searchParams;
  const all = await db.game.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } });
  const genres = [...new Set(all.map((g) => g.genre))];
  const needle = q?.trim().toLowerCase();
  const games = all.filter(
    (g) =>
      (!plataforma || g.platform === plataforma) &&
      (!genero || g.genre === genero) &&
      (!needle || `${g.name} ${g.genre} ${g.platform}`.toLowerCase().includes(needle)),
  );
  const slides: Slide[] = all
    .filter((g) => g.stock > 0 && offPercent(g.priceCents, g.oldPriceCents) > 0)
    .sort((a, b) => offPercent(b.priceCents, b.oldPriceCents) - offPercent(a.priceCents, a.oldPriceCents))
    .slice(0, 5)
    .map((g) => ({
      slug: g.slug, name: g.name, hero: g.hero || g.cover, genre: g.genre,
      price: brl(g.priceCents), old: brl(g.oldPriceCents!), pix: brl(pixPrice(g.priceCents)),
      off: offPercent(g.priceCents, g.oldPriceCents),
    }));
  const base = plataforma ? `/?plataforma=${encodeURIComponent(plataforma)}` : "/?";

  return (
    <Shell platform={plataforma}>
      <div className="wrap">
        {!q && !plataforma && !genero && <PromoCarousel slides={slides} />}

        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 30 }}>{q ? `Resultados para “${q}”` : "Jogos"}</h2>
          <div className="row" style={{ gap: 8 }}>
            <Link className="chip" href={plataforma ? `/?plataforma=${encodeURIComponent(plataforma)}` : "/"} aria-current={!genero}>Todos</Link>
            {genres.map((gn) => (
              <Link key={gn} className="chip" href={`${base}&genero=${encodeURIComponent(gn)}`} aria-current={genero === gn}>{gn}</Link>
            ))}
          </div>
        </div>

        {games.length === 0 ? (
          <p className="muted">Nenhum jogo encontrado.</p>
        ) : (
          <div className="grid">{games.map((g) => <GameCard key={g.id} g={g} />)}</div>
        )}
      </div>
    </Shell>
  );
}
