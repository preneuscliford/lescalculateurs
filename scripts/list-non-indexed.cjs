#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function readSitemapUrls(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const out = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

function normalizeUrl(u) {
  let s = u.trim();
  s = s.replace("https://www.lescalculateurs.fr", "https://lescalculateurs.fr");
  if (/^https:\/\/lescalculateurs\.fr\/pages\/blog\/departements\/frais-notaire-[^\.]+$/.test(s)) {
    s += ".html";
  }
  return s;
}

function readIndexedList(p) {
  const raw = fs.readFileSync(p, "utf-8");
  const urls = Array.from(raw.matchAll(/https?:\/\/[^\s`]+/g)).map((m) => m[0]);
  const canon = urls.map(normalizeUrl)
    .filter((u) => u.includes("/pages/blog/departements/frais-notaire-"));
  return Array.from(new Set(canon));
}

function main() {
  const root = path.resolve(__dirname, "..");
  const sitemapPath = path.join(root, "public", "sitemap.xml");
  const indexedPath = path.join(root, "reports", "indexed-urls.txt");
  if (!fs.existsSync(sitemapPath)) {
    console.error("Sitemap introuvable:", sitemapPath);
    process.exit(1);
  }
  if (!fs.existsSync(indexedPath)) {
    console.error("Liste indexée introuvable:", indexedPath);
    process.exit(1);
  }
  const all = readSitemapUrls(sitemapPath)
    .filter((u) => u.includes("/pages/blog/departements/frais-notaire-"));
  const indexed = readIndexedList(indexedPath);
  const setIndexed = new Set(indexed);
  const nonIndexed = all.filter((u) => !setIndexed.has(u)).sort();
  console.log(`Non indexées (${nonIndexed.length}):`);
  for (const u of nonIndexed) console.log(u);
  const outPath = path.join(root, "reports", "non-indexed-urls.txt");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, nonIndexed.join("\n") + "\n", "utf-8");
  console.log("\nRapport écrit:", outPath);
}

main();