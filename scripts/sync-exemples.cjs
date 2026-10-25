#!/usr/bin/env node
/**
 * Recalcule les exemples chiffrés des pages (marqueurs data-exemple) depuis les moteurs,
 * puis régénère les FAQ JSON-LD (data-faq) à partir de la FAQ visible.
 *   node scripts/sync-exemples.cjs          -> réécrit les pages
 *   node scripts/sync-exemples.cjs --check  -> échoue si une page n'est pas à jour
 * Voir src/utils/exemplesChiffres.ts.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const check = process.argv.includes("--check");

const bundle = path.join(os.tmpdir(), `exemples-chiffres-${process.pid}.cjs`);
esbuild.buildSync({
  entryPoints: [path.join(root, "src/utils/exemplesChiffres.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: bundle,
  logLevel: "error",
});
const { synchroniserExemples, synchroniserFaqJsonLd } = require(bundle);
fs.unlinkSync(bundle);

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pages(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

let ecartsTotal = 0;
let modifiees = 0;
for (const fichier of pages(path.join(root, "src/pages"))) {
  const html = fs.readFileSync(fichier, "utf8");
  if (!html.includes("data-exemple=") && !html.includes("data-faq=")) continue;
  const { html: avecExemples, ecarts } = synchroniserExemples(html);
  const { html: regenere, ecarts: faqs } = synchroniserFaqJsonLd(avecExemples);
  // Conserver les fins de ligne du fichier (CRLF sous Windows) : sinon chaque build réécrit la page
  const nouveau = html.includes("\r\n") ? regenere.replace(/\r?\n/g, "\r\n") : regenere;
  for (const g of faqs) console.log(`${path.relative(root, fichier)} : FAQ JSON-LD "${g}" à régénérer`);
  for (const e of ecarts) {
    console.log(`${path.relative(root, fichier)} : ${e.calcul} ${e.params} -> affiché ${e.affiche}, moteur ${e.attendu}`);
  }
  ecartsTotal += ecarts.length + faqs.length;
  if (!check && nouveau !== html) {
    fs.writeFileSync(fichier, nouveau, "utf8");
    modifiees++;
  }
}

if (check && ecartsTotal > 0) {
  console.error(`${ecartsTotal} exemple(s) chiffré(s) à mettre à jour : lancez npm run exemples:sync`);
  process.exit(1);
}
console.log(check ? "Exemples chiffrés à jour." : `${modifiees} page(s) mise(s) à jour, ${ecartsTotal} exemple(s) recalculé(s).`);
