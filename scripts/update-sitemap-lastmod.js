import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Formatte une date JS en chaîne YYYY-MM-DD pour sitemap.
 */
function formatDateYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Met à jour <lastmod> des entrées <url> ciblées dans un sitemap.xml.
 * Cible par défaut: toutes les pages départementales.
 * Cibles additionnelles: pages calculateur (notaire, pret, plusvalue, taxe, ik).
 */
function updateSitemapLastmod(xmlContent, newDate, extraLocs = []) {
  const targets = [
    "/pages/blog/departements/", // toutes les pages départementales
    "/pages/notaire.html",
    "/pages/pret.html",
    "/pages/plusvalue.html",
    "/pages/taxe.html",
    "/pages/ik.html",
    ...extraLocs,
  ];

  const urlBlockRegex = /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g;
  let changed = 0;
  const updated = xmlContent.replace(urlBlockRegex, (block, loc) => {
    const matchTarget = targets.some((t) => loc.includes(t));
    if (!matchTarget) return block;
    const newBlock = block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${newDate}<\/lastmod>`);
    changed += 1;
    return newBlock;
  });
  return { updated, changed };
}

/**
 * Point d'entrée: met à jour public/sitemap.xml avec la date du jour sur les pages ciblées.
 */
async function main() {
  const today = new Date();
  const newDate = formatDateYYYYMMDD(today);
  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Fichier introuvable: ${sitemapPath}`);
    process.exit(1);
  }
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const { updated, changed } = updateSitemapLastmod(xml, newDate);
  fs.writeFileSync(sitemapPath, updated, "utf-8");
  console.log(`✅ sitemap.xml mis à jour: ${changed} entrées modifiées → ${newDate}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});