import Stripe from "stripe";

// Sem chave, a loja roda em modo simulado (sem chamar o Stripe).
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY ausente");
  if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    throw new Error("Use apenas chaves de teste (sk_test_...) neste projeto.");
  }
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
