import { db } from "./db";

/** Marca o pedido como pago e baixa o estoque. Idempotente. */
export async function markPaid(orderId: string) {
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.status === "paid") return;
    await tx.order.update({ where: { id: orderId }, data: { status: "paid" } });
    for (const it of order.items) {
      await tx.game.update({
        where: { id: it.gameId },
        data: { stock: { decrement: it.qty } },
      });
    }
  });
}
