#!/usr/bin/env node
/**
 * Convertit les <loc> du sitemap en URLs propres:
 * - Domaine: https://www.lescalculateurs.fr
 * - Supprime l'extension .html
 */
const fs = require('fs');
const path = require('path');

function main() {
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');

  xml = xml.replace(/<loc>https:\/\/lescalculateurs\.fr\/([^<]+?)<\/loc>/g, (m, p) => {
    const clean = p.replace(/\.html\b/gi, '');
    return `<loc>https://www.lescalculateurs.fr/${clean}</loc>`;
  });

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('Sitemap loc normalisés vers domaine www et sans .html');
}

main();