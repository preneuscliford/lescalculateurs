import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  base: "/",
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
        ik: resolve(__dirname, "src/pages/ik.html"),
        ponts: resolve(__dirname, "src/pages/ponts.html"),
        taxe: resolve(__dirname, "src/pages/taxe.html"),
        travail: resolve(__dirname, "src/pages/travail.html"),
        financement: resolve(__dirname, "src/pages/financement.html"),
        "crypto-bourse": resolve(__dirname, "src/pages/crypto-bourse.html"),
        blog: resolve(__dirname, "src/pages/blog.html"),
        "blog-export-pdf": resolve(
          __dirname,
          "src/pages/blog/export-pdf-calculateurs.html"
        ),
        "blog-frais-notaire": resolve(
          __dirname,
          "src/pages/blog/frais-notaire-ancien-neuf-2025.html"
        ),
        "blog-departements": resolve(
          __dirname,
          "src/pages/blog/frais-notaire-departements.html"
        ),
      },
      output: {
        manualChunks: {
          vendor: ["jspdf", "html2canvas"],
        },
      },
    },
  },
});
