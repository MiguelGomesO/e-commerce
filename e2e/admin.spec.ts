import { expect, test } from "@playwright/test";

test("o painel exige login e recusa senha errada", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Senha incorreta.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("despublicar um jogo no admin o remove da loja, e publicar o traz de volta", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill("e2e-senha");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Jogos", exact: true })).toBeVisible();

  const row = page.locator("tr", { hasText: "Undertale" });
  await row.getByRole("button", { name: "Despublicar" }).click();
  await expect(row.getByText("Despublicado")).toBeVisible();

  await page.goto("/?q=undertale");
  await expect(page.getByText("Nenhum jogo encontrado.")).toBeVisible();

  await page.goto("/admin");
  await page.locator("tr", { hasText: "Undertale" }).getByRole("button", { name: "Publicar" }).click();
  await page.goto("/?q=undertale");
  await expect(page.locator("article.game")).toHaveCount(1);
});
