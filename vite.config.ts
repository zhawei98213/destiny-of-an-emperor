import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/game/src",
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup/phaser.ts"],
  },
});
