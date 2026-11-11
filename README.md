# PixelVault

Loja de jogos digitais feita com **Next.js**, com vitrine, carrinho, checkout por **Pix ou cartão (Stripe em modo teste)** e um painel de administração. Projeto de portfólio: não vende nada de verdade.

<!-- Adicione aqui: link da demo e screenshots/GIF do fluxo (vitrine → carrinho → checkout → admin). -->

## O que tem

**Loja**
- Vitrine com 25 jogos em 4 plataformas (PC, PlayStation, Xbox e Switch), com busca e filtros por plataforma e gênero.
- Carrossel de promoções com os maiores descontos: troca automática, setas, pontos de navegação, animação de entrada e suporte a "reduzir movimento".
- Página do jogo com preço, desconto, preço no Pix e aviso de poucas chaves.
- Carrinho que fica salvo no navegador.

**Checkout**
- Pix (5% de desconto) ou cartão, via Stripe Checkout em modo teste.
- Modo simulado quando não há chave do Stripe, para rodar tudo sem conta.
- Confirmação do pagamento por webhook, com a baixa de estoque feita uma única vez.

**Admin** (`/admin`, protegido por senha)
- Indicadores do dia: vendas, pedidos pagos, Pix aguardando e jogos com poucas chaves.
- Criar, editar, publicar e despublicar jogos.
- Lista de pedidos com cliente, itens, forma de pagamento e status.

## Tecnologias

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Prisma + SQLite · Stripe · Zod · Vitest · Playwright · GitHub Actions

## Como rodar

Requisitos: Node 22 ou mais novo.

```bash
npm install
copy .env.example .env      # no Mac/Linux: cp .env.example .env
npm run db:push             # cria o banco SQLite
npm run db:seed             # carrega os 25 jogos
npm run dev                 # http://localhost:3000
```

Antes de subir, edite o `.env` e defina `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` (uma string longa e aleatória). O painel fica em `/admin`.

### Variáveis de ambiente

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Caminho do banco SQLite (`file:./dev.db`) |
| `APP_URL` | Endereço público da loja, usado nos retornos do Stripe |
| `STRIPE_SECRET_KEY` | Chave de **teste** (`sk_test_...`). Vazia = modo simulado |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook (`whsec_...`) |
| `ADMIN_PASSWORD` | Senha do painel admin |
| `ADMIN_SESSION_SECRET` | Segredo que assina o cookie de sessão do admin |

## Pagamentos

- **Sem `STRIPE_SECRET_KEY`** (padrão): modo simulado. Pix e cartão levam à página do pedido, que tem um botão para simular a aprovação.
- **Com chave de teste**: o checkout cria uma Stripe Checkout Session em reais, com o método escolhido. Chaves que não sejam de teste são recusadas pelo código.
  - Cartão de teste: `4242 4242 4242 4242`, qualquer data futura e qualquer CVC.
  - O Pix precisa estar habilitado na sua conta Stripe (Brasil).
  - Webhook local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, e copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`. Sem webhook, a página do pedido confirma o pagamento consultando o Stripe ao abrir.

## Testes

```bash
npm test                      # Vitest: preço e desconto, checkout (API) e confirmação de pagamento
npx playwright install chromium   # só na primeira vez
npm run test:e2e              # Playwright: compra com Pix e cartão, busca e admin no navegador
npm run typecheck && npm run lint
```

Os testes unitários usam um banco descartável (`prisma/test.db`) e o e2e usa `prisma/e2e.db`, em outra porta e outra pasta de build (`.next-e2e`). Nenhum deles toca o `dev.db`, e dá para rodar com o `npm run dev` aberto.

O GitHub Actions (`.github/workflows/ci.yml`) roda lint, tipos, testes, build e o e2e a cada push e pull request.

## Decisões de projeto

- **O preço nunca vem do navegador.** O checkout recebe só o jogo e a quantidade e recalcula tudo no servidor, incluindo o desconto Pix.
- **Pagamento confirmado pelo servidor.** O webhook do Stripe marca o pedido como pago. A página do pedido também confere, para funcionar sem webhook em desenvolvimento.
- **Baixa de estoque idempotente.** `markPaid` roda numa transação e ignora pedidos já pagos, então webhook e página do pedido podem chegar ao mesmo tempo sem baixar o estoque duas vezes. Há testes para isso.
- **Valores em centavos**, como inteiros, para não ter erro de arredondamento.
- **Admin protegido em todas as camadas.** O layout e cada Server Action conferem a sessão, que é um cookie assinado e `httpOnly`.
- **Imagens locais.** As artes ficam em `public/games` e são servidas pelo componente de imagem do Next, que ajusta o tamanho e o formato.

## Estrutura

```
src/app/            páginas, rotas de API e Server Actions
  admin/            painel (login e área protegida)
  api/checkout/     cria o pedido e a sessão de pagamento
  api/webhooks/     webhook do Stripe
src/components/     interface (cartões, carrossel, formulários)
src/lib/            banco, preços, carrinho, autenticação, pedidos
prisma/             schema e seed dos 25 jogos
e2e/                testes de navegador (Playwright)
```

## Limitações conhecidas

- **Estoque sem reserva.** O estoque só baixa quando o pagamento é aprovado. Dois clientes podem comprar a última chave ao mesmo tempo.
- **Pedidos Pix sem expiração.** Um Pix que ninguém paga fica pendente para sempre.
- **Sem limite de tentativas** no login do admin e no checkout.
- **A chave do jogo não é entregue.** O estoque é só um número, e a mensagem de "chave enviada" não corresponde a um envio real de e-mail.
- Não há cupons nem contas de cliente.

## Aviso

Projeto de estudo, sem fins comerciais e sem vendas reais. Nomes, marcas e imagens dos jogos pertencem aos seus donos. As capas vêm da Steam e foram usadas apenas para demonstração. Os preços são valores de exemplo.
