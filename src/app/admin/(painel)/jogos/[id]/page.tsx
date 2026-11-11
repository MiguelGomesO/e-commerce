import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GameForm } from "@/components/GameForm";

export default async function EditGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "novo") {
    return (<><h1 style={{ fontSize: 36 }}>Novo jogo</h1><GameForm /></>);
  }
  const game = await db.game.findUnique({ where: { id: Number(id) || 0 } });
  if (!game) notFound();
  return (<><h1 style={{ fontSize: 36 }}>Editar: {game.name}</h1><GameForm game={game} /></>);
}
