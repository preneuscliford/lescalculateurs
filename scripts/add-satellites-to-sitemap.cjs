const fs = require("fs");
const path = require("path");

function loadSatelliteKeepMap() {
  const filePath = path.resolve(__dirname, "../data/pseo/satellite-keep-slugs.json");
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function main() {
  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  const srcPagesDir = path.resolve(__dirname, "../src/pages");
  const domain = "https://www.lescalculateurs.fr";
  const today = new Date().toISOString().slice(0, 10);
  const satelliteKeepMap = loadSatelliteKeepMap();
  const managedPillars = new Set(Object.keys(satelliteKeepMap));
  const dedupedSatelliteBlockUrls = new Set(["simulateurs/quelle-aide-selon-mon-profil-2026"]);

  const urls = new Set();

  if (fs.existsSync(path.join(srcPagesDir, "aide", "index.html"))) {
    urls.add(`${domain}/pages/aide`);
  }

  for (const [pillar, rawSlugs] of Object.entries(satelliteKeepMap)) {
    const dir = path.join(srcPagesDir, pillar);
    for (const rawSlug of rawSlugs) {
      const slug = String(rawSlug || "").trim();
      if (!slug) continue;
      const indexPath = path.join(dir, slug, "index.html");
      const htmlPath = path.join(dir, `${slug}.html`);
      if (!fs.existsSync(indexPath) && !fs.existsSync(htmlPath)) continue;
      urls.add(`${domain}/pages/${pillar}/${slug}`);
    }
  }

  const sortedUrls = Array.from(urls).sort((a, b) => a.localeCompare(b, "fr"));
  const block = sortedUrls
    .map(
      (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join("\n");

  const start = "<!-- SATELLITES:START -->";
  const end = "<!-- SATELLITES:END -->";
  const replacement = `${start}\n${block}\n${end}`;

  let xml = fs.readFileSync(sitemapPath, "utf8");
  xml = xml.replace(/\s*<url>\s*<loc>(.*?)<\/loc>[\s\S]*?<\/url>\s*/g, (block, loc) => {
    const normalizedLoc = String(loc || "").trim();
    const match = normalizedLoc.match(/^https:\/\/www\.lescalculateurs\.fr\/pages\/([^/]+)\/([^/]+)$/);
    if (!match) return block;

    const [, pillar, slug] = match;
    if (!managedPillars.has(pillar)) return block;
    if (dedupedSatelliteBlockUrls.has(`${pillar}/${slug}`)) return "";

    const keptSlugs = new Set((satelliteKeepMap[pillar] || []).map((item) => String(item || "").trim()).filter(Boolean));
    return keptSlugs.has(slug) ? block : "";
  });

  if (xml.includes(start) && xml.includes(end)) {
    const re = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
    xml = xml.replace(re, replacement);
  } else {
    xml = xml.replace(/<\/urlset>\s*$/i, `${replacement}\n</urlset>`);
  }

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Sitemap mis a jour: ${sortedUrls.length} URLs satellites`);
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
