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
        salaire: resolve(__dirname, "src/pages/salaire.html"),
        impot: resolve(__dirname, "src/pages/impot.html"),
        charges: resolve(__dirname, "src/pages/charges.html"),
        ik: resolve(__dirname, "src/pages/ik.html"),
        ponts: resolve(__dirname, "src/pages/ponts.html"),
        taxe: resolve(__dirname, "src/pages/taxe.html"),
        travail: resolve(__dirname, "src/pages/travail.html"),
        financement: resolve(__dirname, "src/pages/financement.html"),
        "crypto-bourse": resolve(__dirname, "src/pages/crypto-bourse.html"),
        simulateurs: resolve(__dirname, "src/pages/simulateurs.html"),
        apl: resolve(__dirname, "src/pages/apl.html"),
        "apl-zones": resolve(__dirname, "src/pages/apl-zones.html"),
        "apl-dom-tom": resolve(__dirname, "src/pages/apl-dom-tom.html"),
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
        "comment-calculer-frais-notaire": resolve(
          __dirname,
          "src/pages/comment-calculer-frais-notaire.html"
        ),
        "comment-calculer-plus-value": resolve(
          __dirname,
          "src/pages/comment-calculer-plus-value.html"
        ),
        methodologie: resolve(__dirname, "src/pages/methodologie.html"),
        sources: resolve(__dirname, "src/pages/sources.html"),
      },
      output: {
        manualChunks: {
          "chunk-jspdf": ["jspdf"],
          "chunk-html2canvas": ["html2canvas"],
          "chunk-chart": ["chart.js"],
        },
      },
    },
  },
});
