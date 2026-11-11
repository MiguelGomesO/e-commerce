"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

export function AdminNav() {
  const path = usePathname();
  const item = (href: string, label: string, active: boolean) => (
    <Link href={href} aria-current={active ? "page" : undefined}>{label}</Link>
  );
  return (
    <nav aria-label="Admin">
      <Link href="/" className="logo" style={{ marginBottom: 20 }}>PIXELVAULT</Link>
      <span className="muted" style={{ fontSize: 12, letterSpacing: "0.08em" }}>ADMIN</span>
      {item("/admin", "Jogos", path === "/admin" || path.startsWith("/admin/jogos"))}
      {item("/admin/pedidos", "Pedidos", path.startsWith("/admin/pedidos"))}
      <div style={{ marginTop: "auto" }} className="stack">
        <Link href="/" className="muted">← Ver loja</Link>
        <form action={logout}><button className="btn" style={{ width: "100%" }}>Sair</button></form>
      </div>
    </nav>
  );
}
