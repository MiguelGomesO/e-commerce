import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    fileParallelism: false, // todos os arquivos compartilham o mesmo banco de teste
    env: {
      DATABASE_URL: "file:./test.db",
      STRIPE_SECRET_KEY: "", // força o modo simulado
    },
  },
});
