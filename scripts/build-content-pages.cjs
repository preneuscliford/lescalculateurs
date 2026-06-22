"use strict";

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

marked.setOptions({ breaks: true, gfm: true });

const CONTENT_DIR = path.join(__dirname, "..", "content");
const PAGES_DIR = path.join(__dirname, "..", "src", "pages");
const DATA_DIR = path.join(__dirname, "..", "data");

// ─── HTML entities ─────────────────────────────────────────────
const AMP = "&" + "amp;";
const LT = "&" + "lt;";
const GT = "&" + "gt;";
const QUOT = "&" + "quot;";
const APOS = "&" + "#39;";

function esc(str) {
  return String(str || "")
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT)
    .replace(/'/g, APOS);
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ─── Frontmatter Parser ────────────────────────────────────────
function parseFrontmatter(raw) {
  // Normalize Windows CRLF to LF
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Frontmatter introuvable");
  const yamlBlock = match[1];
  const body = match[2];
  const fm = {};
  let currentKey = null;
  let currentArray = [];

  for (const line of yamlBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("- ") && currentKey) {
      currentArray.push(
        trimmed
          .slice(2)
          .trim()
          .replace(/^"(.*)"$/, "$1")
          .replace(/^'(.*)'$/, "$1"),
      );
      continue;
    }
    if (currentKey && currentArray.length > 0) {
      fm[currentKey] = currentArray;
      currentArray = [];
      currentKey = null;
    }
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (!value) {
      currentKey = key;
      currentArray = [];
      continue;
    }
    fm[key] = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  if (currentKey && currentArray.length > 0) fm[currentKey] = currentArray;
  return { frontmatter: fm, body };
}

function loadContentMapping() {
  const mappingPath = path.join(DATA_DIR, "content-mapping.json");
  if (!fs.existsSync(mappingPath)) return { categories: {}, calculateurSlugMap: {} };
  return JSON.parse(fs.readFileSync(mappingPath, "utf8"));
}

// ─── Build related links ───────────────────────────────────────
function buildRelatedLinks(article, allItems, mapping) {
  const relatedCalcSlugs = article.frontmatter.calculateurs || [];
  const relatedGuideSlugs = article.frontmatter.guides || [];
  const relatedActualiteSlugs = article.frontmatter.actualites || [];

  let html = "";

  if (relatedCalcSlugs.length > 0) {
    html +=
      '<div class="mt-8"><h3 class="font-bold text-gray-900 mb-4 text-lg">\u{1F9EE} Calculateurs associ\u00e9s</h3><div class="grid md:grid-cols-2 gap-3">';
    for (const slug of relatedCalcSlugs) {
      const calc = (mapping.calculateurSlugMap || {})[slug];
      if (calc) {
        html +=
          '<a href="' +
          esc(calc.url) +
          '" class="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3">';
        html += '<span class="text-2xl">\u{1F9EE}</span>';
        html +=
          '<div><p class="font-semibold text-blue-600">' +
          esc(calc.name) +
          '</p><p class="text-xs text-gray-500">Calculer \u2192</p></div>';
        html += "</a>";
      }
    }
    html += "</div></div>";
  }

  if (relatedGuideSlugs.length > 0) {
    html +=
      '<div class="mt-8"><h3 class="font-bold text-gray-900 mb-4 text-lg">\u{1F4DA} Guides associ\u00e9s</h3><div class="grid md:grid-cols-2 gap-3">';
    for (const slug of relatedGuideSlugs) {
      const guide = (allItems.guidesBySlug || {})[slug] || (allItems.actualitesBySlug || {})[slug];
      if (guide) {
        html +=
          '<a href="/guides/' +
          esc(slug) +
          '" class="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3">';
        html += '<span class="text-2xl">\u{1F4DA}</span>';
        html +=
          '<div><p class="font-semibold text-blue-600">' +
          esc(guide.frontmatter.title) +
          '</p><p class="text-xs text-gray-500">Lire le guide \u2192</p></div>';
        html += "</a>";
      }
    }
    html += "</div></div>";
  }

  if (relatedActualiteSlugs.length > 0) {
    html +=
      '<div class="mt-8"><h3 class="font-bold text-gray-900 mb-4 text-lg">\u{1F4F0} Actualit\u00e9s associ\u00e9es</h3><div class="grid md:grid-cols-2 gap-3">';
    for (const slug of relatedActualiteSlugs) {
      const actu = (allItems.actualitesBySlug || {})[slug] || (allItems.guidesBySlug || {})[slug];
      if (actu) {
        html +=
          '<a href="/actualites/' +
          esc(slug) +
          '" class="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3">';
        html += '<span class="text-2xl">\u{1F4F0}</span>';
        html +=
          '<div><p class="font-semibold text-blue-600">' +
          esc(actu.frontmatter.title) +
          '</p><p class="text-xs text-gray-500">Lire l\'article \u2192</p></div>';
        html += "</a>";
      }
    }
    html += "</div></div>";
  }

  return html;
}

// ─── Render content page ───────────────────────────────────────
function renderContentPage(article, allItems, mapping) {
  const fm = article.frontmatter;
  const categoryLabel = fm.category || "G\u00e9n\u00e9ral";
  const categorySlug = slugify(categoryLabel);
  const dateFormatted = formatDate(fm.publishedAt || fm.updatedAt);
  const tags = fm.tags || [];
  const isGuide = article.type === "guide";
  const typeLabel = isGuide ? "Guide" : "Actualit\u00e9";
  const breadcrumbLabel = isGuide ? "Guides" : "Actualit\u00e9s";
  const parentUrl = isGuide ? "/guides" : "/actualites";
  const pageType = isGuide ? "guides" : "actualites";
  const pageUrl = "https://www.lescalculateurs.fr/" + pageType + "/" + fm.slug;
  const bodyContent = marked.parse(article.body);
  const relatedLinks = buildRelatedLinks(article, allItems, mapping);

  const articleSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": article.type === "actualite" ? "NewsArticle" : "Article",
      headline: fm.title,
      description: fm.description || fm.title,
      datePublished: fm.publishedAt,
      dateModified: fm.updatedAt || fm.publishedAt,
      author: { "@type": "Organization", name: "LesCalculateurs.fr" },
      publisher: {
        "@type": "Organization",
        name: "LesCalculateurs.fr",
        logo: {
          "@type": "ImageObject",
          url: "https://www.lescalculateurs.fr/assets/lescalculateurs-new-logo.png",
        },
      },
    },
    null,
    2,
  );

  const breadcrumbSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://www.lescalculateurs.fr/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: breadcrumbLabel,
          item: "https://www.lescalculateurs.fr" + parentUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryLabel,
          item: "https://www.lescalculateurs.fr/categorie/" + categorySlug,
        },
        { "@type": "ListItem", position: 4, name: fm.title, item: pageUrl },
      ],
    },
    null,
    2,
  );

  let tagMetas = "";
  for (const t of tags) {
    tagMetas += '<meta property="article:tag" content="' + esc(t) + '" />\n  ';
  }

  let tagSpans = "";
  if (tags.length > 0) {
    tagSpans = '<div class="flex flex-wrap gap-2 mt-4">';
    for (const t of tags) {
      tagSpans +=
        '<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">' + esc(t) + "</span>";
    }
    tagSpans += "</div>";
  }

  return (
    "<!doctype html>\n" +
    '<html lang="fr">\n' +
    "<head>\n" +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    esc(fm.title) +
    " | LesCalculateurs.fr</title>\n" +
    '  <meta name="description" content="' +
    esc(fm.description || fm.title) +
    '" />\n' +
    '  <meta name="keywords" content="' +
    esc(tags.join(", ")) +
    '" />\n' +
    '  <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n' +
    '  <link rel="canonical" href="' +
    pageUrl +
    '" />\n' +
    '  <meta property="og:url" content="' +
    pageUrl +
    '" />\n' +
    '  <meta property="og:type" content="article" />\n' +
    '  <meta property="og:title" content="' +
    esc(fm.title) +
    '" />\n' +
    '  <meta property="og:description" content="' +
    esc(fm.description || fm.title) +
    '" />\n' +
    '  <meta property="article:published_time" content="' +
    esc(fm.publishedAt || "") +
    '" />\n' +
    '  <meta property="article:section" content="' +
    esc(categoryLabel) +
    '" />\n' +
    "  " +
    tagMetas +
    "\n" +
    '  <meta name="twitter:card" content="summary_large_image" />\n' +
    '  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />\n' +
    '  <link rel="manifest" href="/assets/site.webmanifest" />\n' +
    '  <link rel="shortcut icon" href="/assets/favicon.ico" />\n' +
    '  <script type="application/ld+json">\n' +
    articleSchema +
    "\n  </script>\n" +
    '  <script type="application/ld+json">\n' +
    breadcrumbSchema +
    "\n  </script>\n" +
    '  <script defer src="/third-party-loader.js"></script>\n' +
    "</head>\n" +
    '<body class="bg-gray-50">\n' +
    '  <header class="bg-white shadow-sm border-b border-gray-200">\n' +
    '    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">\n' +
    '      <div class="flex justify-between items-center py-4">\n' +
    '        <div class="flex items-center space-x-4">\n' +
    '          <a href="/" class="inline-flex items-center gap-2 font-bold text-gray-900">\n' +
    '            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-8 w-auto" width="160" height="64" loading="eager" decoding="async" />\n' +
    '            <span class="whitespace-nowrap">Les Calculateurs</span>\n' +
    "          </a>\n" +
    "        </div>\n" +
    '        <nav class="flex items-center space-x-4 text-sm">\n' +
    '          <a href="/actualites" class="text-gray-600 hover:text-gray-900">Actualit\u00e9s</a>\n' +
    '          <a href="/guides" class="text-gray-600 hover:text-gray-900">Guides</a>\n' +
    '          <a href="/pages/simulateurs" class="text-gray-600 hover:text-gray-900">Simulateurs</a>\n' +
    "        </nav>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </header>\n" +
    "\n" +
    '  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\n' +
    '    <header class="mb-12">\n' +
    '      <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">\n' +
    '        <a href="' +
    parentUrl +
    '" class="text-blue-600 hover:text-blue-700">\u2190 ' +
    breadcrumbLabel +
    "</a>\n" +
    "        <span>\u2022</span>\n" +
    '        <a href="/categorie/' +
    categorySlug +
    '" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">' +
    esc(categoryLabel) +
    "</a>\n" +
    "        <span>\u2022</span>\n" +
    '        <time datetime="' +
    esc(fm.publishedAt || "") +
    '">' +
    dateFormatted +
    "</time>\n" +
    "        <span>\u2022</span>\n" +
    "        <span>" +
    typeLabel +
    "</span>\n" +
    "      </div>\n" +
    '      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">' +
    esc(fm.title) +
    "</h1>\n" +
    '      <p class="text-xl text-gray-600 leading-relaxed">' +
    esc(fm.description || "") +
    "</p>\n" +
    "      " +
    tagSpans +
    "\n" +
    "    </header>\n" +
    "\n" +
    '    <div class="prose prose-lg max-w-none">\n' +
    "      " +
    bodyContent +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    " +
    relatedLinks +
    "\n" +
    "\n" +
    '    <footer class="mt-16 pt-8 border-t border-gray-200">\n' +
    '      <div class="flex flex-wrap justify-between items-center gap-4">\n' +
    '        <a href="' +
    parentUrl +
    '" class="text-blue-600 hover:text-blue-700 font-semibold">\u2190 Tous les ' +
    breadcrumbLabel.toLowerCase() +
    "</a>\n" +
    '        <a href="/categorie/' +
    categorySlug +
    '" class="text-blue-600 hover:text-blue-700">Plus sur ' +
    esc(categoryLabel) +
    " \u2192</a>\n" +
    "      </div>\n" +
    '      <p class="text-xs text-gray-400 mt-4">Derni\u00e8re mise \u00e0 jour : ' +
    dateFormatted +
    "</p>\n" +
    "    </footer>\n" +
    "  </article>\n" +
    "\n" +
    '  <footer class="bg-gray-900 text-gray-300 mt-20">\n' +
    '    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n' +
    '      <div class="grid md:grid-cols-3 gap-8 mb-8">\n' +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Calculateurs</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/rsa" class="hover:text-white">Simulateur RSA</a></li>\n' +
    '            <li><a href="/pages/prime-activite" class="hover:text-white">Prime d\'activit\u00e9</a></li>\n' +
    '            <li><a href="/pages/apl" class="hover:text-white">Aides au logement (APL)</a></li>\n' +
    '            <li><a href="/pages/salaire" class="hover:text-white">Salaire brut/net</a></li>\n' +
    '            <li><a href="/pages/impot" class="hover:text-white">Imp\u00f4t sur le revenu</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Contenus</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/actualites" class="hover:text-white">Actualit\u00e9s</a></li>\n' +
    '            <li><a href="/guides" class="hover:text-white">Guides</a></li>\n' +
    '            <li><a href="/pages/simulateurs" class="hover:text-white">Simulateurs</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">\u00c0 propos</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/a-propos" class="hover:text-white">\u00c0 propos</a></li>\n' +
    '            <li><a href="/pages/methodologie" class="hover:text-white">M\u00e9thodologie</a></li>\n' +
    '            <li><a href="/pages/sources" class="hover:text-white">Sources</a></li>\n' +
    '            <li><a href="/pages/contact" class="hover:text-white">Contact</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "      </div>\n" +
    '      <div class="border-t border-gray-700 pt-4 text-center text-sm">\n' +
    "        <p>\u00a9 2026 LesCalculateurs.fr - Tous droits r\u00e9serv\u00e9s</p>\n" +
    '        <div class="mt-2 space-x-4">\n' +
    '          <a href="/pages/mentions-legales" class="hover:text-white">Mentions l\u00e9gales</a>\n' +
    '          <a href="/pages/politique-confidentialite" class="hover:text-white">Politique de confidentialit\u00e9</a>\n' +
    '          <a href="/pages/politique-cookies" class="hover:text-white">Cookies</a>\n' +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </footer>\n" +
    "\n" +
    '  <script type="module" src="/content.ts"></script>\n' +
    "</body>\n" +
    "</html>\n"
  );
}

// ─── Render listing page ───────────────────────────────────────
function renderListingPage(type, items, categories, mapping) {
  const isGuide = type === "guide";
  const label = isGuide ? "Guides" : "Actualit\u00e9s";
  const description = isGuide
    ? "Guides pratiques pour comprendre vos droits, calculer vos aides et ma\u00eetriser vos finances."
    : "Toute l'actualit\u00e9 sur les aides sociales, les salaires, les imp\u00f4ts et le logement.";
  const pathPrefix = isGuide ? "guides" : "actualites";

  let itemsHtml = "";
  for (const item of items) {
    const catSlug = slugify(item.frontmatter.category || "general");
    const dateFormatted = formatDate(item.frontmatter.publishedAt || item.frontmatter.updatedAt);
    itemsHtml +=
      '<div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">\n' +
      '      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">\n' +
      '        <a href="/categorie/' +
      catSlug +
      '" class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">' +
      esc(item.frontmatter.category || "G\u00e9n\u00e9ral") +
      "</a>\n" +
      "        <span>\u2022</span>\n" +
      '        <time datetime="' +
      esc(item.frontmatter.publishedAt || "") +
      '">' +
      dateFormatted +
      "</time>\n" +
      "      </div>\n" +
      '      <h3 class="text-xl font-bold text-gray-900 mb-2">\n' +
      '        <a href="/' +
      pathPrefix +
      "/" +
      esc(item.frontmatter.slug) +
      '" class="hover:text-blue-600">' +
      esc(item.frontmatter.title) +
      "</a>\n" +
      "      </h3>\n" +
      '      <p class="text-gray-600 text-sm mb-3">' +
      esc(item.frontmatter.description || "") +
      "</p>\n" +
      '      <a href="/' +
      pathPrefix +
      "/" +
      esc(item.frontmatter.slug) +
      '" class="text-blue-600 hover:text-blue-700 font-medium text-sm">Lire ' +
      (isGuide ? "le guide" : "l'article") +
      " \u2192</a>\n" +
      "    </div>";
  }

  let categoryLinks = "";
  for (const catSlug of Object.keys(categories || {})) {
    const cat = categories[catSlug];
    categoryLinks +=
      '          <a href="/categorie/' +
      catSlug +
      '" class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">' +
      esc(cat.name) +
      "</a>\n";
  }

  const listingSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: label,
      description: description,
      url: "https://www.lescalculateurs.fr/" + pathPrefix,
    },
    null,
    2,
  );

  return (
    "<!doctype html>\n" +
    '<html lang="fr">\n' +
    "<head>\n" +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    label +
    " - Aides sociales, salaires, imp\u00f4ts | LesCalculateurs.fr</title>\n" +
    '  <meta name="description" content="' +
    esc(description) +
    '" />\n' +
    '  <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n' +
    '  <link rel="canonical" href="https://www.lescalculateurs.fr/' +
    pathPrefix +
    '" />\n' +
    '  <meta property="og:type" content="website" />\n' +
    '  <meta property="og:title" content="' +
    label +
    ' | LesCalculateurs.fr" />\n' +
    '  <meta property="og:description" content="' +
    esc(description) +
    '" />\n' +
    '  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />\n' +
    '  <link rel="manifest" href="/assets/site.webmanifest" />\n' +
    '  <link rel="shortcut icon" href="/assets/favicon.ico" />\n' +
    '  <script type="application/ld+json">\n' +
    listingSchema +
    "\n  </script>\n" +
    "</head>\n" +
    '<body class="bg-gray-50">\n' +
    '  <header class="bg-white shadow-sm border-b border-gray-200">\n' +
    '    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">\n' +
    '      <div class="flex justify-between items-center py-4">\n' +
    '        <div class="flex items-center space-x-4">\n' +
    '          <a href="/" class="inline-flex items-center gap-2 font-bold text-gray-900">\n' +
    '            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-8 w-auto" width="160" height="64" loading="eager" decoding="async" />\n' +
    '            <span class="whitespace-nowrap">Les Calculateurs</span>\n' +
    "          </a>\n" +
    "        </div>\n" +
    '        <nav class="flex items-center space-x-4 text-sm">\n' +
    '          <a href="/actualites" class="text-gray-600 hover:text-gray-900' +
    (type === "actualite" ? " font-bold" : "") +
    '">Actualit\u00e9s</a>\n' +
    '          <a href="/guides" class="text-gray-600 hover:text-gray-900' +
    (type === "guide" ? " font-bold" : "") +
    '">Guides</a>\n' +
    '          <a href="/pages/simulateurs" class="text-gray-600 hover:text-gray-900">Simulateurs</a>\n' +
    "        </nav>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </header>\n" +
    "\n" +
    '  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\n' +
    '    <h1 class="text-4xl font-bold text-gray-900 mb-4">' +
    label +
    "</h1>\n" +
    '    <p class="text-lg text-gray-600 mb-8">' +
    esc(description) +
    "</p>\n" +
    "\n" +
    '    <div class="flex flex-wrap gap-2 mb-8">\n' +
    "      " +
    (categoryLinks || "") +
    "\n" +
    "    </div>\n" +
    "\n" +
    '    <div class="grid md:grid-cols-2 gap-6">\n' +
    "      " +
    (itemsHtml ||
      '<p class="text-gray-500 col-span-2 text-center py-12">Aucun contenu pour le moment. Revenez bient\u00f4t !</p>') +
    "\n" +
    "    </div>\n" +
    "  </main>\n" +
    "\n" +
    '  <footer class="bg-gray-900 text-gray-300 mt-20">\n' +
    '    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n' +
    '      <div class="grid md:grid-cols-3 gap-8 mb-8">\n' +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Calculateurs</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/rsa" class="hover:text-white">Simulateur RSA</a></li>\n' +
    '            <li><a href="/pages/prime-activite" class="hover:text-white">Prime d\'activit\u00e9</a></li>\n' +
    '            <li><a href="/pages/apl" class="hover:text-white">Aides au logement (APL)</a></li>\n' +
    '            <li><a href="/pages/salaire" class="hover:text-white">Salaire brut/net</a></li>\n' +
    '            <li><a href="/pages/impot" class="hover:text-white">Imp\u00f4t sur le revenu</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Contenus</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/actualites" class="hover:text-white">Actualit\u00e9s</a></li>\n' +
    '            <li><a href="/guides" class="hover:text-white">Guides</a></li>\n' +
    '            <li><a href="/pages/simulateurs" class="hover:text-white">Simulateurs</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">\u00c0 propos</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/a-propos" class="hover:text-white">\u00c0 propos</a></li>\n' +
    '            <li><a href="/pages/methodologie" class="hover:text-white">M\u00e9thodologie</a></li>\n' +
    '            <li><a href="/pages/sources" class="hover:text-white">Sources</a></li>\n' +
    '            <li><a href="/pages/contact" class="hover:text-white">Contact</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "      </div>\n" +
    '      <div class="border-t border-gray-700 pt-4 text-center text-sm">\n' +
    "        <p>\u00a9 2026 LesCalculateurs.fr - Tous droits r\u00e9serv\u00e9s</p>\n" +
    '        <div class="mt-2 space-x-4">\n' +
    '          <a href="/pages/mentions-legales" class="hover:text-white">Mentions l\u00e9gales</a>\n' +
    '          <a href="/pages/politique-confidentialite" class="hover:text-white">Politique de confidentialit\u00e9</a>\n' +
    '          <a href="/pages/politique-cookies" class="hover:text-white">Cookies</a>\n' +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </footer>\n" +
    "\n" +
    '  <script type="module" src="/content.ts"></script>\n' +
    "</body>\n" +
    "</html>\n"
  );
}

// ─── Render category page ──────────────────────────────────────
function renderCategoryPage(slug, catData, actualites, guides, mapping) {
  const categoryName = catData.name || slug.toUpperCase();
  const description = catData.description || "Tous nos contenus sur " + categoryName + ".";

  let actualitesHtml = "";
  for (const item of actualites) {
    const dateFormatted = formatDate(item.frontmatter.publishedAt || item.frontmatter.updatedAt);
    actualitesHtml +=
      '<div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">\n' +
      '      <h4 class="font-bold text-gray-900 mb-1">\n' +
      '        <a href="/actualites/' +
      esc(item.frontmatter.slug) +
      '" class="hover:text-blue-600">' +
      esc(item.frontmatter.title) +
      "</a>\n" +
      "      </h4>\n" +
      '      <p class="text-sm text-gray-600 mb-2">' +
      esc(item.frontmatter.description || "") +
      "</p>\n" +
      '      <time datetime="' +
      esc(item.frontmatter.publishedAt || "") +
      '" class="text-xs text-gray-400">' +
      dateFormatted +
      "</time>\n" +
      "    </div>";
  }

  let guidesHtml = "";
  for (const item of guides) {
    const dateFormatted = formatDate(item.frontmatter.publishedAt || item.frontmatter.updatedAt);
    guidesHtml +=
      '<div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">\n' +
      '      <h4 class="font-bold text-gray-900 mb-1">\n' +
      '        <a href="/guides/' +
      esc(item.frontmatter.slug) +
      '" class="hover:text-blue-600">' +
      esc(item.frontmatter.title) +
      "</a>\n" +
      "      </h4>\n" +
      '      <p class="text-sm text-gray-600 mb-2">' +
      esc(item.frontmatter.description || "") +
      "</p>\n" +
      '      <time datetime="' +
      esc(item.frontmatter.publishedAt || "") +
      '" class="text-xs text-gray-400">' +
      dateFormatted +
      "</time>\n" +
      "    </div>";
  }

  const calculateurs = catData.calculateurs || [];
  let calculateursHtml = "";
  for (const calc of calculateurs) {
    calculateursHtml +=
      '<a href="' +
      esc(calc.url) +
      '" class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">\n' +
      '      <div class="text-3xl mb-2">\u{1F9EE}</div>\n' +
      '      <p class="font-semibold text-blue-600">' +
      esc(calc.name) +
      "</p>\n" +
      '      <p class="text-xs text-gray-500">' +
      esc(calc.description || "") +
      "</p>\n" +
      "    </a>";
  }

  const catSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: categoryName,
      description: description,
      url: "https://www.lescalculateurs.fr/categorie/" + slug,
    },
    null,
    2,
  );

  let simulatorsSection = "";
  if (calculateurs.length > 0) {
    simulatorsSection =
      '    <section class="mb-12">\n' +
      '      <h2 class="text-2xl font-bold text-gray-900 mb-4">\u{1F9EE} Simulateurs ' +
      esc(categoryName) +
      "</h2>\n" +
      '      <div class="grid md:grid-cols-3 gap-4">\n' +
      "        " +
      calculateursHtml +
      "\n" +
      "      </div>\n" +
      "    </section>\n";
  }

  return (
    "<!doctype html>\n" +
    '<html lang="fr">\n' +
    "<head>\n" +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    categoryName +
    " - Actualit\u00e9s, Guides et Simulateurs | LesCalculateurs.fr</title>\n" +
    '  <meta name="description" content="' +
    esc(description) +
    '" />\n' +
    '  <meta name="google-adsense-account" content="ca-pub-2209781252231399" />\n' +
    '  <link rel="canonical" href="https://www.lescalculateurs.fr/categorie/' +
    slug +
    '" />\n' +
    '  <meta property="og:type" content="website" />\n' +
    '  <meta property="og:title" content="' +
    categoryName +
    ' | LesCalculateurs.fr" />\n' +
    '  <meta property="og:description" content="' +
    esc(description) +
    '" />\n' +
    '  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />\n' +
    '  <link rel="manifest" href="/assets/site.webmanifest" />\n' +
    '  <link rel="shortcut icon" href="/assets/favicon.ico" />\n' +
    '  <script type="application/ld+json">\n' +
    catSchema +
    "\n  </script>\n" +
    "</head>\n" +
    '<body class="bg-gray-50">\n' +
    '  <header class="bg-white shadow-sm border-b border-gray-200">\n' +
    '    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">\n' +
    '      <div class="flex justify-between items-center py-4">\n' +
    '        <div class="flex items-center space-x-4">\n' +
    '          <a href="/" class="inline-flex items-center gap-2 font-bold text-gray-900">\n' +
    '            <img src="/assets/lescalculateurs-new-logo.png" alt="LesCalculateurs.fr" class="h-8 w-auto" width="160" height="64" loading="eager" decoding="async" />\n' +
    '            <span class="whitespace-nowrap">Les Calculateurs</span>\n' +
    "          </a>\n" +
    "        </div>\n" +
    '        <nav class="flex items-center space-x-4 text-sm">\n' +
    '          <a href="/actualites" class="text-gray-600 hover:text-gray-900">Actualit\u00e9s</a>\n' +
    '          <a href="/guides" class="text-gray-600 hover:text-gray-900">Guides</a>\n' +
    '          <a href="/pages/simulateurs" class="text-gray-600 hover:text-gray-900">Simulateurs</a>\n' +
    "        </nav>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </header>\n" +
    "\n" +
    '  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\n' +
    '    <h1 class="text-4xl font-bold text-gray-900 mb-4">' +
    esc(categoryName) +
    "</h1>\n" +
    '    <p class="text-lg text-gray-600 mb-8">' +
    esc(description) +
    "</p>\n" +
    "\n" +
    "    " +
    simulatorsSection +
    "\n" +
    "\n" +
    '    <div class="grid md:grid-cols-2 gap-8">\n' +
    "      <section>\n" +
    '        <h2 class="text-2xl font-bold text-gray-900 mb-4">\u{1F4F0} Actualit\u00e9s</h2>\n' +
    '        <div class="space-y-4">\n' +
    "          " +
    (actualitesHtml ||
      '<p class="text-gray-500 text-sm">Aucune actualit\u00e9 pour le moment.</p>') +
    "\n" +
    "        </div>\n" +
    "      </section>\n" +
    "      <section>\n" +
    '        <h2 class="text-2xl font-bold text-gray-900 mb-4">\u{1F4DA} Guides</h2>\n' +
    '        <div class="space-y-4">\n' +
    "          " +
    (guidesHtml || '<p class="text-gray-500 text-sm">Aucun guide pour le moment.</p>') +
    "\n" +
    "        </div>\n" +
    "      </section>\n" +
    "    </div>\n" +
    "  </main>\n" +
    "\n" +
    '  <footer class="bg-gray-900 text-gray-300 mt-20">\n' +
    '    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n' +
    '      <div class="grid md:grid-cols-3 gap-8 mb-8">\n' +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Calculateurs</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/rsa" class="hover:text-white">Simulateur RSA</a></li>\n' +
    '            <li><a href="/pages/prime-activite" class="hover:text-white">Prime d\'activit\u00e9</a></li>\n' +
    '            <li><a href="/pages/apl" class="hover:text-white">Aides au logement (APL)</a></li>\n' +
    '            <li><a href="/pages/salaire" class="hover:text-white">Salaire brut/net</a></li>\n' +
    '            <li><a href="/pages/impot" class="hover:text-white">Imp\u00f4t sur le revenu</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">Contenus</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/actualites" class="hover:text-white">Actualit\u00e9s</a></li>\n' +
    '            <li><a href="/guides" class="hover:text-white">Guides</a></li>\n' +
    '            <li><a href="/pages/simulateurs" class="hover:text-white">Simulateurs</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div>\n" +
    '          <h3 class="text-white font-bold mb-3">\u00c0 propos</h3>\n' +
    '          <ul class="space-y-2 text-sm">\n' +
    '            <li><a href="/pages/a-propos" class="hover:text-white">\u00c0 propos</a></li>\n' +
    '            <li><a href="/pages/methodologie" class="hover:text-white">M\u00e9thodologie</a></li>\n' +
    '            <li><a href="/pages/sources" class="hover:text-white">Sources</a></li>\n' +
    '            <li><a href="/pages/contact" class="hover:text-white">Contact</a></li>\n' +
    "          </ul>\n" +
    "        </div>\n" +
    "      </div>\n" +
    '      <div class="border-t border-gray-700 pt-4 text-center text-sm">\n' +
    "        <p>\u00a9 2026 LesCalculateurs.fr - Tous droits r\u00e9serv\u00e9s</p>\n" +
    '        <div class="mt-2 space-x-4">\n' +
    '          <a href="/pages/mentions-legales" class="hover:text-white">Mentions l\u00e9gales</a>\n' +
    '          <a href="/pages/politique-confidentialite" class="hover:text-white">Politique de confidentialit\u00e9</a>\n' +
    '          <a href="/pages/politique-cookies" class="hover:text-white">Cookies</a>\n' +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </footer>\n" +
    "\n" +
    '  <script type="module" src="/content.ts"></script>\n' +
    "</body>\n" +
    "</html>\n"
  );
}

// ─── Main ──────────────────────────────────────────────────────
function main() {
  const mapping = loadContentMapping();
  const actualitesDir = path.join(CONTENT_DIR, "actualites");
  const guidesDir = path.join(CONTENT_DIR, "guides");

  const actualites = [];
  const guides = [];
  const actualitesBySlug = {};
  const guidesBySlug = {};

  if (fs.existsSync(actualitesDir)) {
    for (const file of fs.readdirSync(actualitesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(actualitesDir, file), "utf8");
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = frontmatter.slug || file.replace(".md", "");
      const article = { frontmatter, body, slug, type: "actualite" };
      actualites.push(article);
      actualitesBySlug[slug] = article;
    }
  }

  if (fs.existsSync(guidesDir)) {
    for (const file of fs.readdirSync(guidesDir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(guidesDir, file), "utf8");
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = frontmatter.slug || file.replace(".md", "");
      const article = { frontmatter, body, slug, type: "guide" };
      guides.push(article);
      guidesBySlug[slug] = article;
    }
  }

  const allItems = { actualitesBySlug, guidesBySlug };

  actualites.sort((a, b) =>
    (b.frontmatter.publishedAt || "").localeCompare(a.frontmatter.publishedAt || ""),
  );
  guides.sort((a, b) =>
    (b.frontmatter.publishedAt || "").localeCompare(a.frontmatter.publishedAt || ""),
  );

  const outputActualitesDir = path.join(PAGES_DIR, "actualites");
  const outputGuidesDir = path.join(PAGES_DIR, "guides");
  fs.mkdirSync(outputActualitesDir, { recursive: true });
  fs.mkdirSync(outputGuidesDir, { recursive: true });

  for (const article of actualites) {
    const html = renderContentPage(article, allItems, mapping);
    const slug = article.frontmatter.slug || article.slug;
    fs.writeFileSync(path.join(outputActualitesDir, slug + ".html"), html, "utf8");
    const nestedDir = path.join(outputActualitesDir, slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  for (const article of guides) {
    const html = renderContentPage(article, allItems, mapping);
    const slug = article.frontmatter.slug || article.slug;
    fs.writeFileSync(path.join(outputGuidesDir, slug + ".html"), html, "utf8");
    const nestedDir = path.join(outputGuidesDir, slug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  // Listing pages
  const actualitesListing = renderListingPage(
    "actualite",
    actualites,
    mapping.categories || {},
    mapping,
  );
  fs.writeFileSync(path.join(outputActualitesDir, "index.html"), actualitesListing, "utf8");

  // Root-level pages/actualites/index.html for clean URL "/actualites/"
  const rootActualitesDir = path.join(PAGES_DIR, "actualites");
  fs.mkdirSync(rootActualitesDir, { recursive: true });

  const guidesListing = renderListingPage("guide", guides, mapping.categories || {}, mapping);
  const rootGuidesDir = path.join(PAGES_DIR, "guides");
  fs.mkdirSync(rootGuidesDir, { recursive: true });
  fs.writeFileSync(path.join(rootGuidesDir, "index.html"), guidesListing, "utf8");

  // Category pages
  const categoriesDir = path.join(PAGES_DIR, "categorie");
  fs.mkdirSync(categoriesDir, { recursive: true });

  const usedCategories = new Set();
  for (const article of [...actualites, ...guides]) {
    usedCategories.add(slugify(article.frontmatter.category || "general"));
  }
  for (const catSlug of Object.keys(mapping.categories || {})) {
    usedCategories.add(catSlug);
  }

  for (const catSlug of usedCategories) {
    const catData = mapping.categories?.[catSlug] || {
      name: catSlug.toUpperCase(),
      description: "Tous nos contenus sur " + catSlug + ".",
      calculateurs: [],
    };

    const catActualites = actualites.filter(
      (a) => slugify(a.frontmatter.category || "") === catSlug,
    );
    const catGuides = guides.filter((g) => slugify(g.frontmatter.category || "") === catSlug);

    const html = renderCategoryPage(catSlug, catData, catActualites, catGuides, mapping);
    fs.writeFileSync(path.join(categoriesDir, catSlug + ".html"), html, "utf8");
    const nestedDir = path.join(categoriesDir, catSlug);
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "index.html"), html, "utf8");
  }

  console.log("✅ " + actualites.length + " actualit\u00e9s g\u00e9n\u00e9r\u00e9es");
  console.log("✅ " + guides.length + " guides g\u00e9n\u00e9r\u00e9s");
  console.log("✅ Pages listing /actualites/ et /guides/ g\u00e9n\u00e9r\u00e9es");
  console.log("✅ " + usedCategories.size + " pages cat\u00e9gories g\u00e9n\u00e9r\u00e9es");
}

main();
