import { db } from "@/lib/db";

export async function resetDb() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.game.deleteMany();
}

export function makeGame(over: Partial<{ slug: string; name: string; priceCents: number; stock: number; published: boolean }> = {}) {
  const slug = over.slug ?? "jogo-teste";
  return db.game.create({
    data: { slug, name: over.name ?? "Jogo Teste", platform: "PC", genre: "Ação", priceCents: 8990, stock: 5, ...over },
  });
}
