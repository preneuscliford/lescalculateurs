import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        notaire: resolve(__dirname, "src/pages/notaire.html"),
        pret: resolve(__dirname, "src/pages/pret.html"),
        plusvalue: resolve(__dirname, "src/pages/plusvalue.html"),
        charges: resolve(__dirname, "src/pages/charges.html"),
      },
    },
  },
  assetsInclude: ["**/*.json"],
});
