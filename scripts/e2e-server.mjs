// Sobe um servidor isolado para os testes e2e: banco próprio (prisma/e2e.db), recriado a cada
// execução, e pasta de build própria (.next-e2e) para não brigar com o `npm run dev`.
import { rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";

const PORT = 3200;
for (const f of ["e2e.db", "e2e.db-journal"]) rmSync(`prisma/${f}`, { force: true });

const run = (cmd) => {
  const r = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (r.status) process.exit(r.status);
};
run("npx prisma db push --skip-generate");
run("node prisma/seed.mjs");

const server = spawn(`npx next dev -p ${PORT}`, { shell: true, stdio: "inherit", env: { ...process.env, E2E: "1" } });
server.on("exit", (code) => process.exit(code ?? 0));
