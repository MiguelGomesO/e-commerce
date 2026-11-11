"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveGame } from "@/app/admin/actions";

type G = {
  id?: number; name?: string; platform?: string; genre?: string; description?: string;
  priceCents?: number; oldPriceCents?: number | null; stock?: number; published?: boolean;
};

const reais = (c?: number | null) => (c == null ? "" : (c / 100).toFixed(2));

export function GameForm({ game }: { game?: G }) {
  const [state, action, pending] = useActionState(saveGame, null);
  return (
    <form action={action} className="card stack" style={{ maxWidth: 640 }}>
      {game?.id && <input type="hidden" name="id" value={game.id} />}
      <div className="field"><label htmlFor="name">Título</label><input id="name" name="name" className="input" required defaultValue={game?.name} /></div>
      <div className="methods">
        <div className="field"><label htmlFor="platform">Plataforma</label><input id="platform" name="platform" className="input" required defaultValue={game?.platform ?? "PC"} /></div>
        <div className="field"><label htmlFor="genre">Gênero</label><input id="genre" name="genre" className="input" required defaultValue={game?.genre} /></div>
      </div>
      <div className="methods">
        <div className="field"><label htmlFor="price">Preço (R$)</label><input id="price" name="price" inputMode="decimal" className="input" required defaultValue={reais(game?.priceCents)} /></div>
        <div className="field"><label htmlFor="oldPrice">Preço antigo (opcional)</label><input id="oldPrice" name="oldPrice" inputMode="decimal" className="input" defaultValue={reais(game?.oldPriceCents)} /></div>
      </div>
      <div className="field"><label htmlFor="stock">Chaves em estoque</label><input id="stock" name="stock" type="number" min={0} className="input" required defaultValue={game?.stock ?? 0} /></div>
      <div className="field"><label htmlFor="description">Descrição</label><textarea id="description" name="description" className="input" defaultValue={game?.description} /></div>
      <label className="row" style={{ gap: 8 }}><input type="checkbox" name="published" defaultChecked={game?.published ?? true} /> Publicado na loja</label>
      {state?.error && <div className="notice bad" role="alert">{state.error}</div>}
      <div className="row"><button className="btn primary" disabled={pending}>Salvar</button><Link href="/admin" className="btn">Cancelar</Link></div>
    </form>
  );
}
