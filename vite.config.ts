import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { aplPilotScenarios } from "./data/pseo/apl-pilot-scenarios.js";

function generateAplPseoPages() {
  execFileSync(process.execPath, [resolve(__dirname, "scripts/generate-pseo-apl.js")], {
    cwd: __dirname,
    stdio: "pipe",
  });
}

function collectNestedAplInputs() {
  const aplDir = resolve(__dirname, "src/pages/apl");
  if (!fs.existsSync(aplDir)) return {};
  const pilotSlugs = new Set(aplPilotScenarios.map((scenario) => String(scenario.slug || "").trim()));

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(aplDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (pilotSlugs.has(entry.name)) continue;
    const indexPath = path.join(aplDir, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) continue;
    inputs[`apl-${entry.name}`] = indexPath;
  }

  return inputs;
}

function collectAplPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of aplPilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/apl", slug, "index.html");
    if (!fs.existsSync(indexPath)) continue;

    inputs[`apl-pilot-${slug}`] = indexPath;
  }

  return inputs;
}

function collectLegacySeoAliasInputs() {
  const legacyAliases: Record<string, string> = {
    "prime-activite-montant-prime-activite-2026": "src/pages/prime-activite/montant-prime-activite-2026.html",
    "simulateurs-aide-sociale-simulation-globale": "src/pages/simulateurs/aide-sociale-simulation-globale.html",
    "simulateurs-aides-retraites": "src/pages/simulateurs/aides-retraites.html",
    "simulateurs-aide-financiere-famille": "src/pages/simulateurs/aide-financiere-famille.html",
    "blog-departements-frais-notaire-11": "src/pages/blog/departements/frais-notaire-11.html",
    "blog-departements-frais-notaire-28": "src/pages/blog/departements/frais-notaire-28.html",
    "salaire-smic-net-2026": "src/pages/salaire/smic-net-2026.html",
    "pret-taux-endettement-35-pourcent-explication": "src/pages/pret/taux-endettement-35-pourcent-explication.html",
    "rsa-fin-de-droits-chomage": "src/pages/rsa/rsa-fin-de-droits-chomage.html",
    "crypto-plus-value": "src/pages/crypto-plus-value.html",
    "taxe-habitation": "src/pages/taxe-habitation.html",
    "calculateur-travail": "src/pages/calculateur-travail.html",
    "plus-value-immobiliere": "src/pages/plus-value-immobiliere.html",
    "blog-frais-notaire-02": "src/pages/blog/frais-notaire-02.html",
    "blog-frais-notaire-18": "src/pages/blog/frais-notaire-18.html",
    "blog-frais-notaire-24": "src/pages/blog/frais-notaire-24.html",
    "blog-frais-notaire-33": "src/pages/blog/frais-notaire-33.html",
    "blog-frais-notaire-34": "src/pages/blog/frais-notaire-34.html",
    "blog-frais-notaire-35": "src/pages/blog/frais-notaire-35.html",
    "blog-frais-notaire-47": "src/pages/blog/frais-notaire-47.html",
    "blog-frais-notaire-89": "src/pages/blog/frais-notaire-89.html",
  };

  const inputs: Record<string, string> = {};
  for (const [key, relativePath] of Object.entries(legacyAliases)) {
    const resolvedPath = resolve(__dirname, relativePath);
    if (fs.existsSync(resolvedPath)) {
      inputs[key] = resolvedPath;
    }
  }

  return inputs;
}

export default defineConfig(({ command }) => {
  if (command === "serve" || command === "build") {
    generateAplPseoPages();
  }

  const aplNestedInputs = collectNestedAplInputs();
  const aplPilotInputs = collectAplPilotInputs();
  const legacySeoAliasInputs = collectLegacySeoAliasInputs();

  return {
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
          "simulateurs-quelle-aide-selon-mon-profil-2026": resolve(
            __dirname,
            "src/pages/simulateurs/quelle-aide-selon-mon-profil-2026.html",
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
          "frais-notaire-75": resolve(__dirname, "src/pages/blog/departements/frais-notaire-75.html"),
          "frais-notaire-13": resolve(__dirname, "src/pages/blog/departements/frais-notaire-13.html"),
          "frais-notaire-69": resolve(__dirname, "src/pages/blog/departements/frais-notaire-69.html"),
          "frais-notaire-31": resolve(__dirname, "src/pages/blog/departements/frais-notaire-31.html"),
          "frais-notaire-06": resolve(__dirname, "src/pages/blog/departements/frais-notaire-06.html"),
          methodologie: resolve(__dirname, "src/pages/methodologie.html"),
          "a-propos": resolve(__dirname, "src/pages/a-propos.html"),
          sources: resolve(__dirname, "src/pages/sources.html"),
          "mentions-legales": resolve(__dirname, "src/pages/mentions-legales.html"),
          "politique-confidentialite": resolve(__dirname, "src/pages/politique-confidentialite.html"),
          "politique-cookies": resolve(__dirname, "src/pages/politique-cookies.html"),
          contact: resolve(__dirname, "src/pages/contact.html"),
          "guide-complet-impot-revenu-2026": resolve(__dirname, "src/pages/guide-complet-impot-revenu-2026.html"),
          "salaire-brut-net-calcul-2026": resolve(__dirname, "src/pages/salaire-brut-net-calcul-2026.html"),
          "historique-mises-a-jour": resolve(__dirname, "src/pages/historique-mises-a-jour.html"),

          // Pages APL imbriquees presentes sous src/pages/apl/**/index.html
          ...aplNestedInputs,

          // Pages pSEO APL du pilote declarees explicitement pour la prod
          ...aplPilotInputs,

          // Alias SEO historiques pour eviter les 404 sur des URLs encore explorees
          ...legacySeoAliasInputs,

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
  };
});
