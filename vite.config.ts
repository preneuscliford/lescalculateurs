import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import path from "path";
import { aplPilotScenarios } from "./data/pseo/apl-pilot-scenarios.js";
import { aplAbsenceRevenuScenarios } from "./data/pseo/apl-absence-revenu-scenarios.js";
import { rsaPilotScenarios } from "./data/pseo/rsa-pilot-scenarios.js";
import { rsaAbsenceRevenuScenarios } from "./data/pseo/rsa-absence-revenu-scenarios.js";
import { arePilotScenarios } from "./data/pseo/are-pilot-scenarios.js";
import { areAbsenceRevenuScenarios } from "./data/pseo/are-absence-revenu-scenarios.js";
import { asfAbsenceRevenuScenarios } from "./data/pseo/asf-absence-revenu-scenarios.js";
import { primeAbsenceRevenuScenarios } from "./data/pseo/prime-absence-revenu-scenarios.js";
import { simulateursAbsenceRevenuScenarios } from "./data/pseo/simulateurs-absence-revenu-scenarios.js";
import { impotPilotScenarios } from "./data/pseo/impot-pilot-scenarios.js";

const allAplPilotScenarios = [...aplPilotScenarios, ...aplAbsenceRevenuScenarios];
const allRsaPilotScenarios = [...rsaPilotScenarios, ...rsaAbsenceRevenuScenarios];
const allArePilotScenarios = [...arePilotScenarios, ...areAbsenceRevenuScenarios];
const allImpotPilotScenarios = [...impotPilotScenarios];

function collectNestedAplInputs() {
  const aplDir = resolve(__dirname, "src/pages/apl");
  if (!fs.existsSync(aplDir)) return {};
  const pilotSlugs = new Set(allAplPilotScenarios.map((scenario) => String(scenario.slug || "").trim()));

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(aplDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (pilotSlugs.has(entry.name)) continue;
    const indexPath = path.join(aplDir, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) continue;
    inputs[`pages/apl/${entry.name}`] = indexPath;
  }

  return inputs;
}

function collectAplPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of allAplPilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/apl", slug, "index.html");
    if (!fs.existsSync(indexPath)) continue;

    inputs[`pages/apl/${slug}`] = indexPath;
  }

  return inputs;
}

function collectStaticPageInputs() {
  return {
    main: resolve(__dirname, "src/index.html"),
    "404": resolve(__dirname, "src/404.html"),
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
    "pages/aides/cumul-aides-rsa-apl-prime-activite/index": resolve(
      __dirname,
      "src/pages/aides/cumul-aides-rsa-apl-prime-activite.html",
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
    "pages/impot/impot-couple-ou-separe/index": resolve(
      __dirname,
      "src/pages/impot/impot-couple-ou-separe.html",
    ),
    rsa: resolve(__dirname, "src/pages/rsa.html"),
    "rsa-vs-smic": resolve(__dirname, "src/pages/rsa-vs-smic.html"),
    "prime-activite": resolve(__dirname, "src/pages/prime-activite.html"),
    aah: resolve(__dirname, "src/pages/aah.html"),
    "apl-etudiant": resolve(__dirname, "src/pages/apl-etudiant.html"),
    are: resolve(__dirname, "src/pages/are.html"),
    asf: resolve(__dirname, "src/pages/asf.html"),
    "pages/notaire/frais-notaire-ancien-2026/index": resolve(
      __dirname,
      "src/pages/notaire/frais-notaire-ancien-2026.html",
    ),
    "pages/notaire/frais-notaire-neuf-2026/index": resolve(
      __dirname,
      "src/pages/notaire/frais-notaire-neuf-2026.html",
    ),
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
  };
}

function collectLegacySeoAliasInputs() {
  const aliasEntries: Array<[string, string]> = [
    ["pages/prime-activite/montant-prime-activite-2026", "src/pages/prime-activite/montant-prime-activite-2026.html"],
    ["pages/blog/departements/frais-notaire-11", "src/pages/blog/departements/frais-notaire-11.html"],
    ["pages/blog/departements/frais-notaire-28", "src/pages/blog/departements/frais-notaire-28.html"],

    // Alias historiques toujours explores dans Search Console
    ["pages/salaire/smic-net-2026", "src/pages/salaire-brut-net-calcul-2026.html"],
    ["pages/pret/taux-endettement-35-pourcent-explication", "src/pages/pret.html"],
    ["pages/rsa/rsa-fin-de-droits-chomage", "src/pages/rsa/rsa-chomage-fin-de-droits.html"],
    ["pages/crypto-plus-value", "src/pages/crypto-bourse.html"],
    ["pages/taxe-habitation", "src/pages/taxe.html"],
    ["pages/calculateur-travail", "src/pages/travail.html"],
    ["pages/plus-value-immobiliere", "src/pages/plusvalue.html"],
    ["pages/blog/frais-notaire-35", "src/pages/blog/departements/frais-notaire-35.html"],
    ["pages/blog/frais-notaire-34", "src/pages/blog/departements/frais-notaire-34.html"],
    ["pages/blog/frais-notaire-18", "src/pages/blog/departements/frais-notaire-18.html"],
    ["pages/blog/frais-notaire-02", "src/pages/blog/departements/frais-notaire-02.html"],
    ["pages/blog/frais-notaire-33", "src/pages/blog/departements/frais-notaire-33.html"],
    ["pages/blog/frais-notaire-47", "src/pages/blog/departements/frais-notaire-47.html"],
    ["pages/blog/frais-notaire-89", "src/pages/blog/departements/frais-notaire-89.html"],
    ["pages/blog/frais-notaire-24", "src/pages/blog/departements/frais-notaire-24.html"],

    // Variantes historiques .html encore crawlees
    ["pages/blog/frais-notaire-35.html", "src/pages/blog/departements/frais-notaire-35.html"],
    ["pages/blog/frais-notaire-34.html", "src/pages/blog/departements/frais-notaire-34.html"],
    ["pages/blog/frais-notaire-18.html", "src/pages/blog/departements/frais-notaire-18.html"],
    ["pages/blog/frais-notaire-02.html", "src/pages/blog/departements/frais-notaire-02.html"],
    ["pages/blog/frais-notaire-33.html", "src/pages/blog/departements/frais-notaire-33.html"],
    ["pages/blog/frais-notaire-47.html", "src/pages/blog/departements/frais-notaire-47.html"],
    ["pages/blog/frais-notaire-89.html", "src/pages/blog/departements/frais-notaire-89.html"],
    ["pages/blog/frais-notaire-24.html", "src/pages/blog/departements/frais-notaire-24.html"],
  ];

  return Object.fromEntries(
    aliasEntries
      .map(([slug, relativeFilePath]) => [slug, resolve(__dirname, relativeFilePath)] as const)
      .filter(([, absolutePath]) => fs.existsSync(absolutePath)),
  );
}

function collectRsaPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of allRsaPilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/rsa", slug, "index.html");
    if (!fs.existsSync(indexPath)) continue;

    inputs[`pages/rsa/${slug}`] = indexPath;
  }

  return inputs;
}

function collectArePilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of allArePilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/are", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/are", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/are/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/are/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

function collectAsfPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of asfAbsenceRevenuScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/asf", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/asf", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/asf/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/asf/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

function collectPrimePilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of primeAbsenceRevenuScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/prime-activite", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/prime-activite", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/prime-activite/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/prime-activite/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

function collectSimulateursPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of simulateursAbsenceRevenuScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/simulateurs", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/simulateurs", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/simulateurs/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/simulateurs/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

function collectNestedImpotInputs() {
  const impotDir = resolve(__dirname, "src/pages/impot");
  if (!fs.existsSync(impotDir)) return {};
  const pilotSlugs = new Set(allImpotPilotScenarios.map((scenario) => String(scenario.slug || "").trim()));

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(impotDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (pilotSlugs.has(entry.name)) continue;
    const indexPath = path.join(impotDir, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) continue;
    inputs[`pages/impot/${entry.name}`] = indexPath;
  }

  return inputs;
}

function collectNestedPlusvalueInputs() {
  const plusvalueDir = resolve(__dirname, "src/pages/plusvalue");
  if (!fs.existsSync(plusvalueDir)) return {};

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(plusvalueDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(plusvalueDir, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) continue;
    inputs[`pages/plusvalue/${entry.name}`] = indexPath;
  }

  return inputs;
}

function collectVdfIncomeInputs() {
  const revenusDir = resolve(__dirname, "src/pages/revenus");
  const inputs: Record<string, string> = {};

  const pillarPath = resolve(__dirname, "src/pages/revenu-median-commune.html");
  if (fs.existsSync(pillarPath)) {
    inputs["pages/revenu-median-commune"] = pillarPath;
  }

  if (!fs.existsSync(revenusDir)) return inputs;

  const entries = fs.readdirSync(revenusDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      const slug = entry.name.replace(/\.html$/, "");
      inputs[`pages/revenus/${slug}`] = path.join(revenusDir, entry.name);
    }
  }

  return inputs;
}

function collectImpotPilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of impotPilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/impot", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/impot", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/impot/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/impot/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

export default defineConfig(() => {
  const aplNestedInputs = collectNestedAplInputs();
  const impotNestedInputs = collectNestedImpotInputs();
  const plusvalueNestedInputs = collectNestedPlusvalueInputs();
  const aplPilotInputs = collectAplPilotInputs();
  const legacySeoAliasInputs = collectLegacySeoAliasInputs();
  const rsaPilotInputs = collectRsaPilotInputs();
  const arePilotInputs = collectArePilotInputs();
  const asfPilotInputs = collectAsfPilotInputs();
  const primePilotInputs = collectPrimePilotInputs();
  const simulateursPilotInputs = collectSimulateursPilotInputs();
  const impotPilotInputs = collectImpotPilotInputs();
  const vdfIncomeInputs = collectVdfIncomeInputs();

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
          ...collectStaticPageInputs(),

          // Pages APL imbriquees presentes sous src/pages/apl/**/index.html
          ...aplNestedInputs,

          // Pages pSEO APL du pilote declarees explicitement pour la prod
          ...aplPilotInputs,

          // Pages Impot imbriquees presentes sous src/pages/impot/**/index.html
          ...impotNestedInputs,

          // Pages Plus-value imbriquees presentes sous src/pages/plusvalue/**/index.html
          ...plusvalueNestedInputs,

          // Pages revenu par commune generees depuis les donnees VDF
          ...vdfIncomeInputs,

          // Pages pSEO RSA du pilote declarees explicitement pour la prod
          ...rsaPilotInputs,

          // Pages pSEO ARE du pilote declarees explicitement pour la prod
          ...arePilotInputs,

          // Pages pSEO ASF du pilote declarees explicitement pour la prod
          ...asfPilotInputs,

          // Pages pSEO Prime du pilote declarees explicitement pour la prod
          ...primePilotInputs,

          // Pages pSEO Simulateurs du pilote declarees explicitement pour la prod
          ...simulateursPilotInputs,

          // Pages pSEO Impot du pilote declarees explicitement pour la prod
          ...impotPilotInputs,

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
