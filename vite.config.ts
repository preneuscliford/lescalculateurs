import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import path from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  base: "/",
  plugins: [
    {
      name: "clean-urls-html",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url || "/";
          const [pathname, search] = url.split("?");

          if (!pathname || pathname === "/") return next();
          if (pathname.startsWith("/@")) return next();
          if (pathname.startsWith("/assets/")) return next();
          if (pathname.includes(".")) return next();

          const cleanPath = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
          const rootDir = server.config.root;

          const candidateHtml = path.join(rootDir, `${cleanPath}.html`);
          const candidateIndex = path.join(rootDir, cleanPath, "index.html");

          if (fs.existsSync(candidateHtml)) {
            req.url = `/${cleanPath}.html${search ? `?${search}` : ""}`;
            return next();
          }

          if (fs.existsSync(candidateIndex)) {
            req.url = `/${cleanPath}/index.html${search ? `?${search}` : ""}`;
            return next();
          }

          return next();
        });
      },
    },
  ],
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
          "src/pages/blog/export-pdf-calculateurs.html",
        ),
        "blog-revalorisation-smic-2026": resolve(
          __dirname,
          "src/pages/blog/revalorisation-smic-2026.html",
        ),
        "blog-inflation-cout-vie-2026": resolve(
          __dirname,
          "src/pages/blog/inflation-cout-vie-2026.html",
        ),
        "blog-salarie-ou-auto-entrepreneur-2026": resolve(
          __dirname,
          "src/pages/blog/salarie-ou-auto-entrepreneur-2026.html",
        ),
        "blog-frais-notaire": resolve(
          __dirname,
          "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
        ),
        "frais-notaire-ancien-neuf": resolve(
          __dirname,
          "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
        ),
        "blog-departements": resolve(
          __dirname,
          "src/pages/blog/frais-notaire-departements.html",
        ),
        "comment-calculer-frais-notaire": resolve(
          __dirname,
          "src/pages/comment-calculer-frais-notaire.html",
        ),
        "comment-calculer-plus-value": resolve(
          __dirname,
          "src/pages/comment-calculer-plus-value.html",
        ),
        rsa: resolve(__dirname, "src/pages/rsa.html"),
        "prime-activite": resolve(__dirname, "src/pages/prime-activite.html"),
        aah: resolve(__dirname, "src/pages/aah.html"),
        "apl-etudiant": resolve(__dirname, "src/pages/apl-etudiant.html"),
        are: resolve(__dirname, "src/pages/are.html"),
        asf: resolve(__dirname, "src/pages/asf.html"),
        "frais-notaire-75": resolve(__dirname, "src/pages/blog/departements/frais-notaire-75.html"),
        "frais-notaire-13": resolve(__dirname, "src/pages/blog/departements/frais-notaire-13.html"),
        "frais-notaire-69": resolve(__dirname, "src/pages/blog/departements/frais-notaire-69.html"),
        "frais-notaire-31": resolve(__dirname, "src/pages/blog/departements/frais-notaire-31.html"),
        "frais-notaire-06": resolve(__dirname, "src/pages/blog/departements/frais-notaire-06.html"),
        methodologie: resolve(__dirname, "src/pages/methodologie.html"),
        "a-propos": resolve(__dirname, "src/pages/a-propos.html"),
        sources: resolve(__dirname, "src/pages/sources.html"),
        "guide-complet-impot-revenu-2026": resolve(__dirname, "src/pages/guide-complet-impot-revenu-2026.html"),
        "salaire-brut-net-calcul-2026": resolve(__dirname, "src/pages/salaire-brut-net-calcul-2026.html"),
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
