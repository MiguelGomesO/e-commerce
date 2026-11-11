export const PIX_DISCOUNT = 0.05;

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const pixPrice = (cents: number) => Math.round(cents * (1 - PIX_DISCOUNT));

export const offPercent = (price: number, old?: number | null) =>
  old && old > price ? Math.round((1 - price / old) * 100) : 0;
