#!/usr/bin/env node
/**
 * Produit la liste des URLs du sitemap dont <lastmod> est différent de la valeur spécifiée.
 * Usage: node scripts/list-remaining-indexing.cjs --lastmod=YYYY-MM-DD
 * Écrit: reports/remaining-urls.txt
 */
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const arg = process.argv.find((a) => a.startsWith('--lastmod='));
  const lastmod = arg ? arg.split('=')[1] : undefined;
  return { lastmod };
}

function readUrlBlocks(xml) {
  const blocks = [];
  const re = /<url>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<lastmod>\s*([^<\s]+)\s*<\/lastmod>[\s\S]*?<\/url>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    blocks.push({ loc: m[1].trim(), lastmod: m[2].trim() });
  }
  return blocks;
}

function main() {
  const { lastmod } = parseArgs();
  if (!lastmod) {
    console.error('Veuillez fournir --lastmod=YYYY-MM-DD');
    process.exit(1);
  }
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const blocks = readUrlBlocks(xml);
  const remaining = blocks.filter(b => b.lastmod !== lastmod).map(b => b.loc);
  const outPath = path.resolve(__dirname, '../reports/remaining-urls.txt');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, remaining.join('\n') + '\n', 'utf8');
  console.log(`Restantes: ${remaining.length}`);
  console.log(`Écrit: ${outPath}`);
}

main();
