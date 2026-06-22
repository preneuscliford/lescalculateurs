"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const CONTENT_DIR = path.join(repoRoot, "content");
const PUBLIC_DIR = path.join(repoRoot, "public");
const DOMAIN = "https://www.lescalculateurs.fr";

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const yaml = match[1];
  const fm = {};
  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed
      .slice(colonIdx + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1");
    fm[key] = value;
  }
  return fm;
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function generateUrlEntry(loc, lastmod, changefreq, priority) {
  return (
    "  <url>\n" +
    "    <loc>" +
    loc +
    "</loc>\n" +
    "    <lastmod>" +
    lastmod +
    "</lastmod>\n" +
    "    <changefreq>" +
    changefreq +
    "</changefreq>\n" +
    "    <priority>" +
    priority +
    "</priority>\n" +
    "  </url>"
  );
}

function generateSitemapXml(urls) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n" +
    "</urlset>"
  );
}

function collectContentUrls() {
  const urls = [];

  // Actualites listing
  urls.push({
    loc: DOMAIN + "/actualites",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "daily",
    priority: "0.8",
  });

  // Guides listing
  urls.push({
    loc: DOMAIN + "/guides",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "weekly",
    priority: "0.8",
  });

  // Actualites items
  const actualitesDir = path.join(CONTENT_DIR, "actualites");
  if (fs.existsSync(actualitesDir)) {
    for (const file of fs.readdirSync(actualitesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(actualitesDir, file), "utf8");
      const fm = parseFrontmatter(raw);
      const slug = fm.slug || file.replace(".md", "");
      urls.push({
        loc: DOMAIN + "/actualites/" + slug,
        lastmod: formatDate(fm.updatedAt || fm.publishedAt),
        changefreq: "daily",
        priority: "0.7",
      });
    }
  }

  // Guides items
  const guidesDir = path.join(CONTENT_DIR, "guides");
  if (fs.existsSync(guidesDir)) {
    for (const file of fs.readdirSync(guidesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(guidesDir, file), "utf8");
      const fm = parseFrontmatter(raw);
      const slug = fm.slug || file.replace(".md", "");
      urls.push({
        loc: DOMAIN + "/guides/" + slug,
        lastmod: formatDate(fm.updatedAt || fm.publishedAt),
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  }

  // Category pages
  const mappingPath = path.join(repoRoot, "data", "content-mapping.json");
  const mapping = fs.existsSync(mappingPath)
    ? JSON.parse(fs.readFileSync(mappingPath, "utf8"))
    : {};
  const categories = mapping.categories || {};

  // Collect actual used categories from content
  const usedCats = new Set(Object.keys(categories));
  if (fs.existsSync(actualitesDir)) {
    for (const file of fs.readdirSync(actualitesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(actualitesDir, file), "utf8");
      const fm = parseFrontmatter(raw);
      const cat = (fm.category || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (cat) usedCats.add(cat);
    }
  }
  if (fs.existsSync(guidesDir)) {
    for (const file of fs.readdirSync(guidesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(guidesDir, file), "utf8");
      const fm = parseFrontmatter(raw);
      const cat = (fm.category || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (cat) usedCats.add(cat);
    }
  }

  for (const catSlug of usedCats) {
    urls.push({
      loc: DOMAIN + "/categorie/" + catSlug,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  return urls;
}

function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const contentUrls = collectContentUrls();

  // Generate separate sitemaps
  const actualitesUrls = contentUrls.filter((u) => u.loc.includes("/actualites/"));
  const guidesUrls = contentUrls.filter((u) => u.loc.includes("/guides/"));
  const categoriesUrls = contentUrls.filter((u) => u.loc.includes("/categorie/"));

  // Add listing pages
  actualitesUrls.unshift({
    loc: DOMAIN + "/actualites",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "daily",
    priority: "0.8",
  });

  guidesUrls.unshift({
    loc: DOMAIN + "/guides",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "weekly",
    priority: "0.8",
  });

  // Sitemap actualites
  const sitemapActualites = generateSitemapXml(
    actualitesUrls.map((u) => generateUrlEntry(u.loc, u.lastmod, u.changefreq, u.priority)),
  );
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-actualites.xml"), sitemapActualites, "utf8");

  // Sitemap guides
  const sitemapGuides = generateSitemapXml(
    guidesUrls.map((u) => generateUrlEntry(u.loc, u.lastmod, u.changefreq, u.priority)),
  );
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-guides.xml"), sitemapGuides, "utf8");

  // Sitemap categories
  const sitemapCategories = generateSitemapXml(
    categoriesUrls.map((u) => generateUrlEntry(u.loc, u.lastmod, u.changefreq, u.priority)),
  );
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-categories.xml"), sitemapCategories, "utf8");

  console.log("✅ sitemap-actualites.xml : " + actualitesUrls.length + " URLs");
  console.log("✅ sitemap-guides.xml : " + guidesUrls.length + " URLs");
  console.log("✅ sitemap-categories.xml : " + categoriesUrls.length + " URLs");
}

main();
