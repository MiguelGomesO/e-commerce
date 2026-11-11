import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeGame, resetDb } from "@/test/helpers";
import { markPaid } from "./orders";

async function pendingOrder(gameId: number, qty: number) {
  return db.order.create({
    data: {
      name: "Ana", email: "ana@exemplo.com", method: "pix", totalCents: 1000 * qty,
      items: { create: [{ gameId, name: "Jogo Teste", qty, unitCents: 1000 }] },
    },
  });
}

describe("markPaid", () => {
  beforeEach(resetDb);

  it("marca o pedido como pago e baixa o estoque", async () => {
    const game = await makeGame({ stock: 5 });
    const order = await pendingOrder(game.id, 2);

    await markPaid(order.id);

    expect((await db.order.findUnique({ where: { id: order.id } }))?.status).toBe("paid");
    expect((await db.game.findUnique({ where: { id: game.id } }))?.stock).toBe(3);
  });

  it("é idempotente: chamar de novo não baixa o estoque outra vez", async () => {
    const game = await makeGame({ stock: 5 });
    const order = await pendingOrder(game.id, 2);

    await markPaid(order.id);
    await markPaid(order.id);

    expect((await db.game.findUnique({ where: { id: game.id } }))?.stock).toBe(3);
  });

  it("não baixa o estoque duas vezes se webhook e página chamarem ao mesmo tempo", async () => {
    const game = await makeGame({ stock: 5 });
    const order = await pendingOrder(game.id, 2);

    await Promise.all([markPaid(order.id), markPaid(order.id)]);

    expect((await db.game.findUnique({ where: { id: game.id } }))?.stock).toBe(3);
  });

  it("ignora pedido inexistente sem lançar erro", async () => {
    await expect(markPaid("nao-existe")).resolves.toBeUndefined();
  });
});
