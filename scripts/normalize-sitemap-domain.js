import fs from "fs";
import path from "path";

/**
 * Remplace toutes les occurrences du domaine avec www
 * par le domaine apex sans www dans public/sitemap.xml.
 */
function normalizeSitemapDomain(filePath) {
  const xml = fs.readFileSync(filePath, "utf-8");
  const updated = xml.replace(/https:\/\/www\.lescalculateurs\.fr/g, "https://lescalculateurs.fr");
  if (updated !== xml) {
    fs.writeFileSync(filePath, updated, "utf-8");
    return true;
  }
  return false;
}

/**
 * Point d'entrée: normalise les URLs de public/sitemap.xml.
 */
function main() {
  const sitemapPath = path.resolve("public", "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Fichier introuvable: ${sitemapPath}`);
    process.exit(1);
  }
  const changed = normalizeSitemapDomain(sitemapPath);
  if (changed) {
    console.log("✅ sitemap.xml normalisé: URLs sans www");
  } else {
    console.log("ℹ️ sitemap.xml déjà normalisé (aucune modification)");
  }
}

main();