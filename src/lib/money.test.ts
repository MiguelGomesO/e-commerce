import { describe, expect, it } from "vitest";
import { brl, offPercent, pixPrice } from "./money";

describe("pixPrice", () => {
  it("aplica 5% de desconto", () => {
    expect(pixPrice(10000)).toBe(9500);
  });

  it("arredonda para o centavo mais próximo", () => {
    expect(pixPrice(8990)).toBe(8541); // 8540,5 -> 8541
    expect(pixPrice(14990)).toBe(14241); // 14240,5 -> 14241
  });

  it("devolve sempre um inteiro (valor em centavos)", () => {
    for (const cents of [1, 99, 1490, 2499, 24990]) {
      expect(Number.isInteger(pixPrice(cents))).toBe(true);
    }
  });
});

describe("offPercent", () => {
  it("calcula o desconto arredondado", () => {
    expect(offPercent(8990, 12990)).toBe(31);
  });

  it("retorna 0 sem preço antigo ou quando não há desconto", () => {
    expect(offPercent(5000, null)).toBe(0);
    expect(offPercent(5000, undefined)).toBe(0);
    expect(offPercent(5000, 5000)).toBe(0);
    expect(offPercent(5000, 4000)).toBe(0);
  });
});

describe("brl", () => {
  it("formata em reais", () => {
    expect(brl(8990).replace(/\s/g, " ")).toBe("R$ 89,90");
    expect(brl(0).replace(/\s/g, " ")).toBe("R$ 0,00");
  });
});
