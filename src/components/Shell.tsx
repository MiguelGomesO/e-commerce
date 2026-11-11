import Link from "next/link";
import { CartButton } from "./CartButton";

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Switch"];

export function Shell({ children, platform }: { children: React.ReactNode; platform?: string }) {
  return (
    <>
      <div className="promo">5% de desconto no Pix · chave digital entregue por e-mail</div>
      <header className="header">
        <Link href="/" className="logo">PIXELVAULT</Link>
        <form className="search" action="/" role="search">
          <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>Buscar jogos</label>
          <input id="q" name="q" placeholder="Buscar jogos, gêneros, plataformas" />
        </form>
        <CartButton />
      </header>
      <nav className="nav" aria-label="Plataformas">
        <Link href="/" aria-current={!platform ? "page" : undefined}>Todos</Link>
        {PLATFORMS.map((p) => (
          <Link key={p} href={`/?plataforma=${encodeURIComponent(p)}`} aria-current={platform === p ? "page" : undefined}>
            {p}
          </Link>
        ))}
      </nav>
      {children}
      <footer className="footer">
        <div><strong>Pagamento seguro</strong><span>Pix e cartão (Stripe). Ambiente de testes.</span></div>
        <div><strong>Entrega digital</strong><span>A chave chega por e-mail após a aprovação do pagamento.</span></div>
        <div><strong>Lojista</strong><Link href="/admin">Área do lojista</Link></div>
      </footer>
    </>
  );
}
