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
        "simulateurs/index": resolve(__dirname, "src/simulateurs/index.html"),
        "simulateurs-aide-financiere-famille": resolve(
          __dirname,
          "src/pages/simulateurs/aide-financiere-famille.html",
        ),
        "simulateurs-aide-sociale-simulation-globale": resolve(
          __dirname,
          "src/pages/simulateurs/aide-sociale-simulation-globale.html",
        ),
        "simulateurs-aides-jeunes-actifs": resolve(
          __dirname,
          "src/pages/simulateurs/aides-jeunes-actifs.html",
        ),
        "simulateurs-aides-retraites": resolve(
          __dirname,
          "src/pages/simulateurs/aides-retraites.html",
        ),
        "simulateurs-cumul-aides-sociales": resolve(
          __dirname,
          "src/pages/simulateurs/cumul-aides-sociales.html",
        ),
        "simulateurs-quelles-aides-ai-je-droit": resolve(
          __dirname,
          "src/pages/simulateurs/quelles-aides-ai-je-droit.html",
        ),
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
        "rsa-vs-smic": resolve(__dirname, "src/pages/rsa-vs-smic.html"),
        "prime-activite": resolve(__dirname, "src/pages/prime-activite.html"),
        aah: resolve(__dirname, "src/pages/aah.html"),
        "apl-etudiant": resolve(__dirname, "src/pages/apl-etudiant.html"),
        are: resolve(__dirname, "src/pages/are.html"),
        asf: resolve(__dirname, "src/pages/asf.html"),
        "rsa-montant-2026": resolve(
          __dirname,
          "src/pages/rsa/montant-rsa-2026.html",
        ),
        "rsa-fin-de-droits-chomage": resolve(
          __dirname,
          "src/pages/rsa/rsa-fin-de-droits-chomage.html",
        ),
        "are-montant-2026": resolve(
          __dirname,
          "src/pages/are/montant-are-2026.html",
        ),
        "are-fin-de-droits-aides": resolve(
          __dirname,
          "src/pages/are/are-fin-de-droits-aides.html",
        ),
        "apl-plafond-ressources-2026": resolve(
          __dirname,
          "src/pages/apl/plafond-ressources-apl-2026.html",
        ),
        "apl-ressources-prises-en-compte": resolve(
          __dirname,
          "src/pages/apl/quelles-ressources-sont-prises-en-compte.html",
        ),
        "prime-activite-plafond-2026": resolve(
          __dirname,
          "src/pages/prime-activite/plafond-prime-activite-2026.html",
        ),
        "prime-activite-montant-2026": resolve(
          __dirname,
          "src/pages/prime-activite/montant-prime-activite-2026.html",
        ),
        "salaire-2500-brut-en-net-2026": resolve(
          __dirname,
          "src/pages/salaire/2500-brut-en-net-2026.html",
        ),
        "salaire-3000-brut-en-net-2026": resolve(
          __dirname,
          "src/pages/salaire/3000-brut-en-net-2026.html",
        ),
        "smic-net-2026": resolve(
          __dirname,
          "src/pages/salaire/smic-net-2026.html",
        ),
        "pret-quel-salaire-150000": resolve(
          __dirname,
          "src/pages/pret/quel-salaire-pour-emprunter-150000.html",
        ),
        "pret-quel-salaire-400000": resolve(
          __dirname,
          "src/pages/pret/quel-salaire-pour-emprunter-400000.html",
        ),
        "pret-taux-endettement-35": resolve(
          __dirname,
          "src/pages/pret/taux-endettement-35-pourcent-explication.html",
        ),
        "notaire-neuf-2026": resolve(
          __dirname,
          "src/pages/notaire/frais-notaire-neuf-2026.html",
        ),
        "notaire-ancien-2026": resolve(
          __dirname,
          "src/pages/notaire/frais-notaire-ancien-2026.html",
        ),
        "impot-tranches-2026-tableau": resolve(
          __dirname,
          "src/pages/impot/tranches-impot-2026-tableau.html",
        ),
        "impot-rfr-2026": resolve(
          __dirname,
          "src/pages/impot/revenu-fiscal-reference-2026.html",
        ),
        "aides-cumul-rsa-apl-prime-activite": resolve(
          __dirname,
          "src/pages/aides/cumul-aides-rsa-apl-prime-activite.html",
        ),
        "simulateurs-aide-profil-2026": resolve(
          __dirname,
          "src/pages/simulateurs/quelle-aide-selon-mon-profil-2026.html",
        ),
        "simulateurs/quelle-aide-selon-mon-profil-2026": resolve(
          __dirname,
          "src/simulateurs/quelle-aide-selon-mon-profil-2026.html",
        ),
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
        "historique-mises-a-jour": resolve(__dirname, "src/pages/historique-mises-a-jour.html"),
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
