const fs = require("fs");
const path = require("path");

function main() {
  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  const srcPagesDir = path.resolve(__dirname, "../src/pages");
  const domain = "https://www.lescalculateurs.fr";
  const today = new Date().toISOString().slice(0, 10);

  const pillars = [
    "apl",
    "rsa",
    "pret",
    "taxe-fonciere",
    "plusvalue",
    "simulateurs",
    "aide",
    "impot",
    "salaire",
  ];

  const urls = new Set();

  if (fs.existsSync(path.join(srcPagesDir, "aide", "index.html"))) {
    urls.add(`${domain}/pages/aide`);
  }

  for (const pillar of pillars) {
    const dir = path.join(srcPagesDir, pillar);
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const slug = ent.name;
      const indexPath = path.join(dir, slug, "index.html");
      if (!fs.existsSync(indexPath)) continue;
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

  if (xml.includes(start) && xml.includes(end)) {
    const re = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
    xml = xml.replace(re, replacement);
  } else {
    xml = xml.replace(/<\/urlset>\s*$/i, `${replacement}\n</urlset>`);
  }

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Sitemap mis à jour: ${sortedUrls.length} URLs satellites`);
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main();
