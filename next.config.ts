import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os testes e2e usam uma pasta de build própria para não conflitar com `npm run dev`.
  distDir: process.env.E2E ? ".next-e2e" : ".next",
};

export default nextConfig;
