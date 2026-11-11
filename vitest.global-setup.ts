import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Recria o banco de teste do zero (prisma/test.db, arquivo descartável) com o schema atual.
// Apagar o arquivo evita precisar de flags destrutivas do Prisma, e nunca toca o dev.db.
export default function setup() {
  for (const f of ["test.db", "test.db-journal"]) rmSync(`prisma/${f}`, { force: true });
  execSync("npx prisma db push --skip-generate", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
