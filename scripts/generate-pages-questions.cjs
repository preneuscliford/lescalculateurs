#!/usr/bin/env node
/**
 * Génère les pages de questions depuis src/data/questions-validees.json (entrées « valide ») :
 * - une page par situation et le sommaire de l'aide (src/pages/<slug>/index.html), montants calculés
 *   par les moteurs (data-exemple) et FAQ JSON-LD régénérée depuis la FAQ visible ;
 * - le sitemap (public/sitemap.xml) : pages ajoutées, pages redirigées et URL /r/ retirées ;
 * - les redirections 301 des pages remplacées (vercel.json).
 *
 * Lancé au build avant sync-exemples. --check : échoue si un fichier n'est pas à jour, sans écrire.
 * Voir src/utils/questions/pagesQuestions.ts.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const check = process.argv.includes("--check");

const entree = path.join(os.tmpdir(), `pages-questions-entree-${process.pid}.ts`);
const bundle = path.join(os.tmpdir(), `pages-questions-${process.pid}.cjs`);
fs.writeFileSync(
  entree,
  `export * from ${JSON.stringify(path.join(root, "src/utils/questions/pagesQuestions.ts"))};\n` +
    `export { synchroniserExemples, synchroniserFaqJsonLd } from ${JSON.stringify(path.join(root, "src/utils/exemplesChiffres.ts"))};\n`,
);
esbuild.buildSync({ entryPoints: [entree], bundle: true, platform: "node", format: "cjs", outfile: bundle, logLevel: "error" });
const Q = require(bundle);
fs.unlinkSync(entree);
fs.unlinkSync(bundle);

const siteUpdate = JSON.parse(fs.readFileSync(path.join(root, "src/data/site-update.json"), "utf8"));
const aMettreAJour = [];

/** Écrit le fichier s'il change (en gardant ses fins de ligne), ou le signale en mode --check */
function ecrire(relatif, contenu) {
  const fichier = path.join(root, relatif);
  const actuel = fs.existsSync(fichier) ? fs.readFileSync(fichier, "utf8") : null;
  const final = actuel && actuel.includes("\r\n") ? contenu.replace(/\r?\n/g, "\r\n") : contenu;
  if (actuel === final) return;
  aMettreAJour.push(relatif);
  if (check) return;
  fs.mkdirSync(path.dirname(fichier), { recursive: true });
  fs.writeFileSync(fichier, final, "utf8");
}

/** Montants et FAQ JSON-LD calculés comme le fait sync-exemples */
function finaliser(html) {
  return Q.synchroniserFaqJsonLd(Q.synchroniserExemples(html).html).html;
}

/** Titre (h1) d'une page existante, pour les liens */
function lireTitre(slug) {
  const fichier = path.join(root, "src/pages", slug, "index.html");
  if (!fs.existsSync(fichier)) return null;
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(fs.readFileSync(fichier, "utf8"));
  if (!h1) return null;
  return h1[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/\s+/g, " ")
    .trim();
}

for (const q of Q.QUESTIONS) {
  if (q.simulateur !== "apl") throw new Error(`Pas encore de modèle de page pour le simulateur ${q.simulateur} (${q.id})`);
  ecrire(path.join("src/pages", q.slug, "index.html"), finaliser(Q.pageApl(q, lireTitre)));
}
for (const s of Q.SOMMAIRES) {
  if (s.simulateur !== "apl") throw new Error(`Pas encore de modèle de sommaire pour ${s.simulateur}`);
  ecrire(path.join("src/pages", s.slug, "index.html"), finaliser(Q.sommaireApl(s)));
}

// Sitemap
const sitemap = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
ecrire("public/sitemap.xml", Q.majSitemap(sitemap.replace(/\r\n/g, "\n"), siteUpdate.lastVerified));

// Redirections 301 des pages remplacées
const vercelTexte = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
const vercel = JSON.parse(vercelTexte);
const existantes = new Set(vercel.redirects.map((r) => r.source));
const nouvelles = Q.redirectionsVercel().filter((r) => !existantes.has(r.source));
if (nouvelles.length) {
  vercel.redirects.push(...nouvelles);
  ecrire("vercel.json", JSON.stringify(vercel, null, 2) + "\n");
}

if (check && aMettreAJour.length) {
  console.error(`Pages de questions à régénérer (npm run questions:generate) :\n  ${aMettreAJour.join("\n  ")}`);
  process.exit(1);
}
console.log(
  check
    ? "Pages de questions à jour."
    : `${Q.QUESTIONS.length} page(s) de questions, ${Q.SOMMAIRES.length} sommaire(s) ; ${aMettreAJour.length} fichier(s) mis à jour${aMettreAJour.length ? ` : ${aMettreAJour.join(", ")}` : ""}.`,
);
