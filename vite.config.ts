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
import { notaireScenarios } from "./data/pseo/notaire-scenarios.js";
import { salairePilotScenarios } from "./data/pseo/salaire-pilot-scenarios.js";

// Date du dernier audit des barèmes, affichée en haut de chaque page au build.
const siteUpdate = JSON.parse(
  fs.readFileSync(resolve(__dirname, "src/data/site-update.json"), "utf8"),
) as { lastVerified: string; label: string };

// Liens officiels par famille de pages : source unique, injectée au build en bas de page.
type SourceOfficielle = { label: string; url: string };
const sourcesOfficielles = JSON.parse(
  fs.readFileSync(resolve(__dirname, "src/data/sources-officielles.json"), "utf8"),
) as { families: Record<string, { prefixes: string[]; sources: SourceOfficielle[] }> };

function sourcesPourPage(filename: string): SourceOfficielle[] {
  const rel = filename.replace(/\\/g, "/").split("/src/pages/")[1] || "";
  if (!rel) return [];
  for (const famille of Object.values(sourcesOfficielles.families)) {
    for (const prefix of famille.prefixes) {
      if (rel === prefix || new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[./-]|$)`).test(rel)) {
        return famille.sources;
      }
    }
  }
  return [];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sourcesBlock(sources: SourceOfficielle[]): string {
  const items = sources
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="color:#1d4ed8;text-decoration:underline">${escapeHtml(s.label)}</a></li>`,
    )
    .join("");
  return `<section data-lc-sources aria-labelledby="lc-sources-titre" style="max-width:56rem;margin:2.5rem auto;padding:1rem 1.25rem;border:1px solid #cfe3ff;border-radius:.5rem;background:#f5f9ff;color:#1e3a5f;font-size:14px;line-height:1.6"><h2 id="lc-sources-titre" style="font-size:16px;font-weight:700;margin:0 0 .5rem">📚 Sources officielles</h2><ul style="margin:0;padding-left:1.1rem;list-style:disc">${items}</ul><p style="margin:.5rem 0 0;font-size:12px;color:#475569">Liens vérifiés le <time datetime="${siteUpdate.lastVerified}">${siteUpdate.label}</time>. Estimation indicative : seul l'organisme concerné fixe le montant définitif. Contenu rédigé et maintenu par LesCalculateurs.fr, outil indépendant non affilié aux organismes cités.</p></section>`;
}

function addSources(html: string, filename: string): string {
  if (html.includes("data-lc-sources")) return html;
  const sources = sourcesPourPage(filename);
  if (!sources.length) return html;
  const block = sourcesBlock(sources);
  if (/<footer[\s>]/i.test(html)) return html.replace(/<footer[\s>]/i, (m) => `${block}\n    ${m}`);
  return html.replace(/<\/body>/i, `${block}\n  </body>`);
}

// Pages juridiques : elles gardent leur propre date de révision, pas de bandeau.
const PAGES_SANS_BANDEAU = /(mentions-legales|politique-|contact|404)/;

function lastUpdatedBanner(): string {
  const historique =
    '<a href="/pages/historique-mises-a-jour" style="color:#1d4ed8;text-decoration:underline">Historique</a>';
  return `<div class="lc-maj" data-lc-maj style="background:#eef6ff;border-bottom:1px solid #cfe3ff;color:#1e3a5f;font-size:13px;line-height:1.4;padding:6px 16px;text-align:center">📅 Mis à jour le <time datetime="${siteUpdate.lastVerified}">${siteUpdate.label}</time> · Barèmes et chiffres vérifiés sur les sources officielles · ${historique}</div>`;
}

const MOIS_FR =
  "janvier|f(?:é|&eacute;|&#233;)vrier|mars|avril|mai|juin|juillet|ao(?:û|&ucirc;|&#251;)t|septembre|octobre|novembre|d(?:é|&eacute;|&#233;)cembre";
const DATE_FR = `\\d{1,2}(?:er)?\\s+(?:${MOIS_FR})\\s+20\\d{2}`;

// Types schema.org dont la date de modification doit suivre le dernier audit.
const TYPES_DATE_MODIFIEE = new Set([
  "Article",
  "BlogPosting",
  "NewsArticle",
  "WebPage",
  "FAQPage",
  "AboutPage",
  "CollectionPage",
  "ItemPage",
  "HowTo",
  "SoftwareApplication",
  "WebApplication",
]);

function majDatesJsonLd(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(majDatesJsonLd);
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const types = ([] as unknown[]).concat(obj["@type"] ?? []);
  if (types.some((t) => TYPES_DATE_MODIFIEE.has(String(t))) || "dateModified" in obj) {
    obj.dateModified = siteUpdate.lastVerified;
  }
  Object.values(obj).forEach(majDatesJsonLd);
}

/**
 * Dates SEO alignées sur site-update.json : JSON-LD (dateModified ajouté ou remplacé),
 * balises meta de modification, et dates <time> affichées dans les pages.
 * La date de publication (datePublished, article:published_time) est conservée.
 */
function alignSeoDates(html: string): string {
  let out = html.replace(
    /(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (bloc, open: string, json: string, close: string) => {
      try {
        const data = JSON.parse(json);
        majDatesJsonLd(data);
        return `${open}${JSON.stringify(data)}${close}`;
      } catch {
        return bloc;
      }
    },
  );
  // Dates <time> visibles : une date précédée d'un libellé (« Dernière mise à jour… »)
  // est alignée sur le dernier audit ; une date seule (ligne d'auteur d'article) est
  // retirée, le bandeau du haut de page étant la seule date affichée.
  out = out.replace(
    /(<time\b[^>]*datetime=")[^"]*("[^>]*>)[^<]*(<\/time>)(\s*<span>\s*•\s*<\/span>)?/gi,
    (_m, a: string, b: string, c: string, sep: string | undefined, offset: number, str: string) => {
      const avant = str
        .slice(Math.max(0, offset - 120), offset)
        .replace(/<[^>]*>/g, " ")
        .trim();
      if (/(jour|revue|effectu\S*|v(?:é|&eacute;)rifi\S*|le)\s*:?$/i.test(avant)) {
        return `${a}${siteUpdate.lastVerified}${b}${siteUpdate.label}${c}${sep ?? ""}`;
      }
      return "";
    },
  );
  const meta = (prop: string) =>
    `<meta property="${prop}" content="${siteUpdate.lastVerified}" />`;
  for (const prop of ["article:modified_time", "og:updated_time"]) {
    if (!new RegExp(`property="${prop}"`).test(out)) {
      out = out.replace(/<\/head>/i, `  ${meta(prop)}\n  </head>`);
    }
  }
  out = out.replace(
    /(<meta\s+property="og:updated_time"\s+content=")[^"]*(")/g,
    `$1${siteUpdate.lastVerified}$2`,
  );
  return out;
}

function addLastUpdated(html: string, filename: string): string {
  // La page d'historique garde ses dates réelles (journal des mises à jour).
  if (/historique-mises-a-jour/.test(filename)) return html;
  if (html.includes("data-lc-maj") || PAGES_SANS_BANDEAU.test(filename)) return html;
  let out = html
    // Ancienne date figée dans le bandeau "Estimation indicative"
    .replace(
      /barèmes [^<—]*applicables\s*—\s*Mise à jour le\s*<time[^>]*>[^<]*<\/time>\s*—?\s*/g,
      "",
    )
    // Dates « Vérifié le … » écrites à la main dans les pages : la seule date affichée
    // est celle du bandeau global (site-update.json), pour éviter les doublons.
    .replace(
      /(?:[✓✅]\s*)?V(?:é|&eacute;|&#233;)rifi(?:é|&eacute;|&#233;)e?\s+le\s+\d{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+\d{4}\s*(?:[—–-]|&mdash;|&ndash;|\.)?\s*/gu,
      "",
    )
    // Toute autre date de mise à jour / vérification écrite à la main est alignée sur
    // la date unique de site-update.json (aucune date en dur à maintenir dans les pages).
    .replace(
      new RegExp(
        `((?:mis(?:e)?\\s+(?:à|&agrave;|&#224;)\\s+jour|v(?:é|&eacute;|&#233;)rifi(?:é|&eacute;|&#233;)e?s?|actualis(?:é|&eacute;|&#233;)e?s?)(?:\\s+(?:le|au))?\\s*:?\\s*)${DATE_FR}`,
        "giu",
      ),
      `$1${siteUpdate.label}`,
    )
    // Libellé court de la navigation (« 🔄 Mise à jour 12/10 »)
    .replace(
      /(Mise (?:à|&agrave;) jour\s+)\d{2}\/\d{2}(?!\/)/g,
      `$1${siteUpdate.lastVerified.slice(8, 10)}/${siteUpdate.lastVerified.slice(5, 7)}`,
    )
    // « Dernière modification : JJ-MM-AAAA » des pages pSEO générées
    .replace(
      /(Derni(?:è|&egrave;|&#232;)re modification\s*(?::|<\/p>\s*<p[^>]*>)\s*)\d{2}-\d{2}-\d{4}/g,
      `$1${siteUpdate.label}`,
    )
    // Données structurées : date de modification = date du dernier audit
    .replace(/("dateModified"\s*:\s*")[^"]*(")/g, `$1${siteUpdate.lastVerified}$2`)
    .replace(
      /(<meta\s+property="article:modified_time"\s+content=")[^"]*(")/g,
      `$1${siteUpdate.lastVerified}$2`,
    );
  out = alignSeoDates(out);
  // Page avec le bandeau "Estimation indicative" : la date y est intégrée pour
  // n'avoir qu'une seule barre en haut de page.
  const stickyBanner = /<div[^>]*class="sticky-ymyl"[^>]*>/;
  if (stickyBanner.test(out)) {
    return out.replace(
      stickyBanner,
      (open) =>
        `${open}\n      <span data-lc-maj style="white-space:nowrap">📅 Mis à jour le <time datetime="${siteUpdate.lastVerified}">${siteUpdate.label}</time> ·</span>`,
    );
  }
  return out.replace(/<body[^>]*>/i, (body) => `${body}\n    ${lastUpdatedBanner()}`);
}

function lastUpdatedPlugin() {
  let outDir = "";
  return {
    name: "lc-last-updated",
    configResolved(config: { root: string; build: { outDir: string } }) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html: string, ctx: { filename: string }) {
      return addSources(addLastUpdated(html, ctx.filename), ctx.filename);
    },
    // Les pages HTML copiées telles quelles depuis public/ (ex. /scenarios) ne passent
    // pas par transformIndexHtml : on leur ajoute la date une fois le build écrit.
    closeBundle() {
      const scenariosDir = path.join(outDir, "scenarios");
      if (!outDir || !fs.existsSync(scenariosDir)) return;
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name.endsWith(".html")) {
            const html = fs.readFileSync(full, "utf8");
            const updated = addSources(addLastUpdated(html, full), full);
            if (updated !== html) fs.writeFileSync(full, updated, "utf8");
          }
        }
      };
      walk(scenariosDir);
    },
  };
}

const allAplPilotScenarios = [...aplPilotScenarios, ...aplAbsenceRevenuScenarios];
const allRsaPilotScenarios = [...rsaPilotScenarios, ...rsaAbsenceRevenuScenarios];
const allArePilotScenarios = [...arePilotScenarios, ...areAbsenceRevenuScenarios];
const allImpotPilotScenarios = [...impotPilotScenarios];

function collectNestedAplInputs() {
  const aplDir = resolve(__dirname, "src/pages/apl");
  if (!fs.existsSync(aplDir)) return {};
  const pilotSlugs = new Set(
    allAplPilotScenarios.map((scenario) => String(scenario.slug || "").trim()),
  );

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

function collectContentPageInputs() {
  const inputs: Record<string, string> = {};
  const contentPagesDir = resolve(__dirname, "src/pages");

  // Actualites
  const actualitesDir = path.join(contentPagesDir, "actualites");
  if (fs.existsSync(actualitesDir)) {
    const entries = fs.readdirSync(actualitesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.join(actualitesDir, entry.name, "index.html");
        if (fs.existsSync(indexPath)) {
          inputs[`pages/actualites/${entry.name}`] = indexPath;
        }
      } else if (entry.name.endsWith(".html") && entry.name !== "index.html") {
        const slug = entry.name.replace(/\.html$/, "");
        inputs[`pages/actualites/${slug}`] = path.join(actualitesDir, entry.name);
      }
    }
  }
  // Actualites listing
  const actualitesListingIndex = path.join(actualitesDir, "index.html");
  if (fs.existsSync(actualitesListingIndex)) {
    inputs["pages/actualites"] = actualitesListingIndex;
  }

  // Guides
  const guidesDir = path.join(contentPagesDir, "guides");
  if (fs.existsSync(guidesDir)) {
    const entries = fs.readdirSync(guidesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.join(guidesDir, entry.name, "index.html");
        if (fs.existsSync(indexPath)) {
          inputs[`pages/guides/${entry.name}`] = indexPath;
        }
      } else if (entry.name.endsWith(".html") && entry.name !== "index.html") {
        const slug = entry.name.replace(/\.html$/, "");
        inputs[`pages/guides/${slug}`] = path.join(guidesDir, entry.name);
      }
    }
  }
  // Guides listing
  const guidesListingIndex = path.join(guidesDir, "index.html");
  if (fs.existsSync(guidesListingIndex)) {
    inputs["pages/guides"] = guidesListingIndex;
  }

  // Categories
  const categoriesDir = path.join(contentPagesDir, "categorie");
  if (fs.existsSync(categoriesDir)) {
    const entries = fs.readdirSync(categoriesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.join(categoriesDir, entry.name, "index.html");
        if (fs.existsSync(indexPath)) {
          inputs[`pages/categorie/${entry.name}`] = indexPath;
        }
      } else if (entry.name.endsWith(".html") && entry.name !== "index.html") {
        const slug = entry.name.replace(/\.html$/, "");
        inputs[`pages/categorie/${slug}`] = path.join(categoriesDir, entry.name);
      }
    }
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
    "consommation-electrique-temps-reel": resolve(
      __dirname,
      "src/pages/consommation-electrique-temps-reel.html",
    ),
    "prix-carburant-temps-reel": resolve(__dirname, "src/pages/prix-carburant-temps-reel.html"),
    "prix-immobilier-m2-commune": resolve(__dirname, "src/pages/prix-immobilier-m2-commune.html"),
    outils: resolve(__dirname, "src/pages/outils.html"),
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
    "blog-export-pdf": resolve(__dirname, "src/pages/blog/export-pdf-calculateurs.html"),
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
    "blog-frais-notaire": resolve(__dirname, "src/pages/blog/frais-notaire-ancien-neuf-2026.html"),
    "frais-notaire-ancien-neuf": resolve(
      __dirname,
      "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
    ),
    "blog-departements": resolve(__dirname, "src/pages/blog/frais-notaire-departements.html"),
    "comment-calculer-frais-notaire": resolve(
      __dirname,
      "src/pages/comment-calculer-frais-notaire.html",
    ),
    "comment-calculer-plus-value": resolve(__dirname, "src/pages/comment-calculer-plus-value.html"),
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
    retraite: resolve(__dirname, "src/pages/retraite.html"),
    "indemnite-licenciement": resolve(__dirname, "src/pages/indemnite-licenciement.html"),
    ptz: resolve(__dirname, "src/pages/ptz.html"),
    "rupture-conventionnelle": resolve(__dirname, "src/pages/rupture-conventionnelle.html"),
    "perte-emploi-are-rsa": resolve(__dirname, "src/pages/perte-emploi-are-rsa.html"),
    "rsa-apl-combines": resolve(__dirname, "src/pages/rsa-apl-combines.html"),
    api: resolve(__dirname, "src/pages/api.html"),
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
    "guide-complet-impot-revenu-2026": resolve(
      __dirname,
      "src/pages/guide-complet-impot-revenu-2026.html",
    ),
    "salaire-brut-net-calcul-2026": resolve(
      __dirname,
      "src/pages/salaire-brut-net-calcul-2026.html",
    ),
    "historique-mises-a-jour": resolve(__dirname, "src/pages/historique-mises-a-jour.html"),
    // Pages HUB VDF (classements comparatifs)
    "inegalites-revenu-ville-france-2026": resolve(
      __dirname,
      "src/pages/inegalites-revenu-ville-france-2026.html",
    ),
    "top-40-villes-revenu-complet-2026": resolve(
      __dirname,
      "src/pages/top-40-villes-revenu-complet-2026.html",
    ),
    // Money pages (simulateurs principaux)
    "pages/salaire-net-apres-impot": resolve(__dirname, "src/pages/salaire-net-apres-impot.html"),
    "pages/reste-a-vivre": resolve(__dirname, "src/pages/reste-a-vivre.html"),
    "pages/cout-reel-voiture": resolve(__dirname, "src/pages/cout-reel-voiture.html"),
    // Nouvelles pages SEMrush (juin 2026)
    "allocation-familiale": resolve(__dirname, "src/pages/allocation-familiale.html"),
    aspa: resolve(__dirname, "src/pages/aspa.html"),
    "carte-famille-nombreuse": resolve(__dirname, "src/pages/carte-famille-nombreuse.html"),
    "garantie-visale": resolve(__dirname, "src/pages/garantie-visale.html"),
    // Actualités
    "actualites-prime-activite-2026": resolve(
      __dirname,
      "src/pages/actualites/prime-activite-nouvelles-regles-2026.html",
    ),
    "actualites-prime-activite-2000-euros": resolve(
      __dirname,
      "src/pages/actualites/prime-activite-2000-euros-net-droit.html",
    ),
    // Nouvelles pages satellites ARE (juillet 2026 - basées sur les données de performance)
    "pages/are/are-apres-demission": resolve(__dirname, "src/pages/are/are-apres-demission.html"),
    "pages/are/are-calcul-montant-net-2026": resolve(
      __dirname,
      "src/pages/are/are-calcul-montant-net-2026.html",
    ),
  };
}

function collectLegacySeoAliasInputs() {
  const aliasEntries: Array<[string, string]> = [
    [
      "pages/blog/departements/frais-notaire-11",
      "src/pages/blog/departements/frais-notaire-11.html",
    ],
    [
      "pages/blog/departements/frais-notaire-28",
      "src/pages/blog/departements/frais-notaire-28.html",
    ],

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

function collectNotairePilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of notaireScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/notaire", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/notaire", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/notaire/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/notaire/${slug}`] = htmlPath;
    }
  }

  return inputs;
}

function collectNotaireComparisonInputs() {
  const notaireDir = resolve(__dirname, "src/pages/notaire");
  if (!fs.existsSync(notaireDir)) return {};

  const pilotSlugs = new Set(
    notaireScenarios.map((scenario) => String(scenario.slug || "").trim()),
  );

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(notaireDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (pilotSlugs.has(entry.name)) continue;

    const indexPath = path.join(notaireDir, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) continue;

    inputs[`pages/notaire/${entry.name}`] = indexPath;
  }

  return inputs;
}

function collectNotaireDepartmentInputs() {
  const departementsDir = resolve(__dirname, "src/pages/blog/departements");
  if (!fs.existsSync(departementsDir)) return {};

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(departementsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    inputs[`pages/blog/departements/${slug}`] = path.join(departementsDir, entry.name);
  }

  return inputs;
}

function collectOutilsInputs() {
  const outilsDir = resolve(__dirname, "src/pages/outils");
  if (!fs.existsSync(outilsDir)) return {};

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(outilsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    inputs[`pages/outils/${slug}`] = path.join(outilsDir, entry.name);
  }

  return inputs;
}

function collectAideInputs() {
  const aideDir = resolve(__dirname, "src/pages/aide");
  if (!fs.existsSync(aideDir)) return {};

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(aideDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/i, "");
    inputs[`pages/aide/${slug}`] = path.join(aideDir, entry.name);
  }

  return inputs;
}

function collectTaxeFonciereInputs() {
  const taxeFonciereDir = resolve(__dirname, "src/pages/taxe-fonciere");
  if (!fs.existsSync(taxeFonciereDir)) return {};

  const inputs: Record<string, string> = {};
  const entries = fs.readdirSync(taxeFonciereDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    if (entry.name === "index.html") continue;
    const slug = entry.name.replace(/\.html$/i, "");
    inputs[`pages/taxe-fonciere/${slug}`] = path.join(taxeFonciereDir, entry.name);
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
  const pilotSlugs = new Set(
    allImpotPilotScenarios.map((scenario) => String(scenario.slug || "").trim()),
  );

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

function collectSalairePilotInputs() {
  const inputs: Record<string, string> = {};

  for (const scenario of salairePilotScenarios) {
    const slug = String(scenario.slug || "").trim();
    if (!slug) continue;

    const indexPath = resolve(__dirname, "src/pages/salaire", slug, "index.html");
    const htmlPath = resolve(__dirname, "src/pages/salaire", `${slug}.html`);

    if (fs.existsSync(indexPath)) {
      inputs[`pages/salaire/${slug}`] = indexPath;
      continue;
    }

    if (fs.existsSync(htmlPath)) {
      inputs[`pages/salaire/${slug}`] = htmlPath;
    }
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
  const notairePilotInputs = collectNotairePilotInputs();
  const notaireComparisonInputs = collectNotaireComparisonInputs();
  const notaireDepartmentInputs = collectNotaireDepartmentInputs();
  const salairePilotInputsResult = collectSalairePilotInputs();
  const aideInputs = collectAideInputs();
  const outilsInputs = collectOutilsInputs();
  const taxeFonciereInputs = collectTaxeFonciereInputs();

  return {
    root: "src",
    publicDir: "../public",
    base: "/",
    resolve: {
      alias: {
        // html2canvas 1.x ne sait pas lire les couleurs oklch (Tailwind v4) et fait
        // échouer tous les exports PDF/PNG : on le remplace par son fork maintenu.
        html2canvas: "html2canvas-pro",
      },
    },
    plugins: [
      lastUpdatedPlugin(),
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

          // Pages pSEO Notaire du pilote declarees explicitement pour la prod
          ...notairePilotInputs,

          // Pages pSEO Notaire de comparaison declarees explicitement pour la prod
          ...notaireComparisonInputs,

          // Pages departementales notaire presentes sous src/pages/blog/departements/*.html
          ...notaireDepartmentInputs,

          // Pages aide presentes sous src/pages/aide/*.html
          ...aideInputs,

          // Pages outils presentes sous src/pages/outils/*.html
          ...outilsInputs,

          // Pages pSEO Salaire du pilote declarees explicitement pour la prod
          ...salairePilotInputsResult,

          // Pages taxe fonciere presentes sous src/pages/taxe-fonciere/*.html
          ...taxeFonciereInputs,

          // Alias SEO historiques pour eviter les 404 sur des URLs encore explorees
          ...legacySeoAliasInputs,

          // Pages de contenu editoriaux (actualites, guides, categories)
          ...collectContentPageInputs(),
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
