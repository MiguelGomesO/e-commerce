"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

type Props = {
  game: { slug: string; name: string; cover: string; platform: string; priceCents: number; stock: number };
  big?: boolean;
  label?: string;
};

export function AddToCart({ game, big, label = "Adicionar ao carrinho" }: Props) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const soldOut = game.stock <= 0;
  return (
    <button
      className={`btn primary${big ? " big" : ""}`}
      disabled={soldOut}
      onClick={() => {
        const { slug, name, cover, platform, priceCents } = game;
        add({ slug, name, cover, platform, priceCents });
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {soldOut ? "Esgotado" : done ? "Adicionado ✓" : label}
    </button>
  );
}
