"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Slide = {
  slug: string;
  name: string;
  hero: string;
  genre: string;
  price: string;
  old: string;
  pix: string;
  off: number;
};

type View = { i: number; prev: number; dir: 1 | -1 };

export function PromoCarousel({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  // prev = slide que está saindo; dir = sentido da navegação (1 avança, -1 volta)
  const [v, setV] = useState<View>({ i: 0, prev: -1, dir: 1 });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true); // sem autoplay até saber a preferência

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = (target: number, dir: 1 | -1) =>
    setV((c) => (target === c.i ? c : { i: target, prev: c.i, dir }));
  const step = (d: 1 | -1) => setV((c) => ({ i: (c.i + d + n) % n, prev: c.i, dir: d }));

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = setInterval(() => step(1), 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reduced, n, v.i]);

  if (n === 0) return null;

  return (
    <section
      className="carousel"
      style={{ "--dir": v.dir } as React.CSSProperties}
      aria-roledescription="carousel"
      aria-label="Jogos em promoção"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="track">
        {slides.map((s, idx) => (
          <div
            className="slide"
            key={s.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} de ${n}: ${s.name}`}
            data-active={idx === v.i}
            data-leaving={idx === v.prev && idx !== v.i}
            inert={idx !== v.i}
          >
            <div className="slide-bg" aria-hidden="true">
              <Image src={s.hero} alt="" fill sizes="100vw" className="fit" priority={idx === 0} />
            </div>
            <div className="slide-text">
              <span className="badge warn" style={{ alignSelf: "flex-start" }}>PROMOÇÃO · −{s.off}%</span>
              <h2 className="slide-title">{s.name}</h2>
              <span style={{ opacity: 0.85 }}>{s.genre}</span>
              <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
                <span className="display" style={{ fontSize: 36, fontWeight: 700 }}>{s.price}</span>
                <span className="old" style={{ color: "inherit", opacity: 0.7 }}>{s.old}</span>
              </div>
              <span style={{ fontSize: 14 }}>{s.pix} no Pix</span>
              <Link href={`/jogo/${s.slug}`} className="btn big slide-cta">Ver jogo</Link>
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button className="car-btn prev" aria-label="Promoção anterior" onClick={() => step(-1)}>‹</button>
          <button className="car-btn next" aria-label="Próxima promoção" onClick={() => step(1)}>›</button>
          <div className="dots">
            {slides.map((s, idx) => (
              <button
                key={s.slug}
                className="dot"
                aria-label={`Ir para ${s.name}`}
                aria-current={idx === v.i}
                onClick={() => goTo(idx, idx > v.i ? 1 : -1)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
