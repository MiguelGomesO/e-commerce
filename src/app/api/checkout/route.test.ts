import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeGame, resetDb } from "@/test/helpers";
import { POST } from "./route";

const call = (body: unknown) =>
  POST(new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));

const valid = { name: "Ana Souza", email: "ana@exemplo.com", method: "pix", items: [{ slug: "jogo-teste", qty: 2 }] };

describe("POST /api/checkout", () => {
  beforeEach(resetDb);

  it("rejeita corpo que não é JSON", async () => {
    expect((await call("isso não é json")).status).toBe(400);
  });

  it.each([
    ["nome curto", { ...valid, name: "A" }],
    ["e-mail inválido", { ...valid, email: "x" }],
    ["método desconhecido", { ...valid, method: "boleto" }],
    ["carrinho vazio", { ...valid, items: [] }],
    ["quantidade zero", { ...valid, items: [{ slug: "jogo-teste", qty: 0 }] }],
    ["quantidade acima do limite", { ...valid, items: [{ slug: "jogo-teste", qty: 11 }] }],
  ])("rejeita dados inválidos: %s", async (_nome, body) => {
    await makeGame();
    expect((await call(body)).status).toBe(400);
  });

  it("recusa jogo inexistente ou despublicado", async () => {
    expect((await call(valid)).status).toBe(400);
    await makeGame({ published: false });
    expect((await call(valid)).status).toBe(400);
  });

  it("recusa quando não há estoque suficiente", async () => {
    await makeGame({ stock: 1 });
    const res = await call(valid);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("Estoque insuficiente");
  });

  it("cria o pedido pendente com desconto Pix de 5% no modo simulado", async () => {
    await makeGame({ priceCents: 8990 });
    const res = await call(valid);
    expect(res.status).toBe(200);

    const { url } = await res.json();
    const order = await db.order.findFirstOrThrow({ include: { items: true } });
    expect(url).toBe(`/pedido/${order.id}`);
    expect(order.status).toBe("pending");
    expect(order.items[0].unitCents).toBe(8541);
    expect(order.totalCents).toBe(8541 * 2);
  });

  it("cobra o preço cheio no cartão", async () => {
    await makeGame({ priceCents: 8990 });
    await call({ ...valid, method: "card" });
    const order = await db.order.findFirstOrThrow();
    expect(order.totalCents).toBe(8990 * 2);
  });

  it("ignora qualquer preço enviado pelo cliente", async () => {
    await makeGame({ priceCents: 8990 });
    await call({ ...valid, totalCents: 1, items: [{ slug: "jogo-teste", qty: 1, priceCents: 1, unitCents: 1 }] });
    const order = await db.order.findFirstOrThrow();
    expect(order.totalCents).toBe(8541);
  });

  it("não baixa o estoque ao criar o pedido (só quando o pagamento é confirmado)", async () => {
    const game = await makeGame({ stock: 5 });
    await call(valid);
    expect((await db.game.findUnique({ where: { id: game.id } }))?.stock).toBe(5);
  });
});
