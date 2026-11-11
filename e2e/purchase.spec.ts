import { expect, test } from "@playwright/test";

async function addTerrariaAndGoToCheckout(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator("article.game", { hasText: "Terraria" }).getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.getByRole("link", { name: /Carrinho \(1\)/ }).click();
  await expect(page.getByRole("heading", { name: "Seu carrinho" })).toBeVisible();
  await expect(page.getByText("Terraria").first()).toBeVisible();
  await page.getByRole("link", { name: "Ir para o checkout" }).click();
  await page.getByLabel("Nome completo").fill("Ana Souza");
  await page.getByLabel(/E-mail/).fill("ana@exemplo.com");
}

test("compra com Pix (simulado) do carrinho até o pagamento aprovado", async ({ page }) => {
  await addTerrariaAndGoToCheckout(page);
  await page.getByRole("button", { name: "Pagar com Pix" }).click();

  await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
  await page.getByRole("button", { name: "Simular pagamento Pix" }).click();

  await expect(page.getByRole("heading", { name: "Pagamento aprovado" })).toBeVisible();
  await expect(page.getByText("ana@exemplo.com")).toBeVisible();
});

test("compra no cartão cobra o preço cheio e esvazia o carrinho", async ({ page }) => {
  await addTerrariaAndGoToCheckout(page);
  await page.getByRole("button", { name: /Cartão \(Stripe\)/ }).click();
  await expect(page.getByRole("button", { name: /^Pagar R\$/ })).toBeVisible();
  await page.getByRole("button", { name: /^Pagar R\$/ }).click();

  await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
  await page.getByRole("button", { name: "Simular pagamento no cartão" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento aprovado" })).toBeVisible();

  await page.goto("/carrinho");
  await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
});

test("busca filtra os jogos da vitrine", async ({ page }) => {
  await page.goto("/?q=hades");
  await expect(page.locator("article.game")).toHaveCount(1);
  await expect(page.locator("article.game")).toContainText("Hades");
});
