#!/usr/bin/env node
/**
 * Corrige le sitemap en supprimant les .html des URLs
 * et en créant un sitemap correct sans redirects
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");

function fixSitemap() {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found: ${sitemapPath}`);
    process.exit(1);
  }

  let xml = fs.readFileSync(sitemapPath, "utf-8");

  // Supprimer tous les .html des URLs du sitemap
  // Remplacer les patterns comme:
  // https://www.lescalculateurs.fr/pages/charges.html
  // par https://www.lescalculateurs.fr/pages/charges
  const fixed = xml.replace(/(<loc>.*?)(\.html)(<\/loc>)/g, "$1$3");

  if (fixed === xml) {
    console.log("✅ Sitemap déjà correct (aucun .html trouvé)");
    return;
  }

  fs.writeFileSync(sitemapPath, fixed, "utf-8");

  // Compter les changements
  const htmlCount = (xml.match(/\.html<\/loc>/g) || []).length;
  console.log(
    `✅ Sitemap corrigé: ${htmlCount} URLs fixes (suppression de .html)`
  );
}

fixSitemap();
