#!/usr/bin/env node
/**
 * Migration SEO 2025 → 2026 sur toutes les pages HTML.
 * - Met à jour title/og/twitter/meta description/keywords s'ils contiennent "2025" (hors contexte officiel).
 * - Met à jour les blocs JSON-LD (name/headline/description) s'ils contiennent "2025" (hors contexte officiel).
 * - Ne touche pas les dates (datePublished/dateModified) ni les mentions explicitement officielles (barème, BOFiP, impots.gouv, legifrance, service-public, notaires).
 */
const fs = require("fs");
const path = require("path");

const OFFICIAL_GUARDS = [
  "barème", "barèmes", "officiel", "officiels",
  "bofip", "impots.gouv.fr", "bofip.impots.gouv.fr",
  "legifrance.gouv.fr", "service-public.fr", "notaires.fr", "chambre des notaires"
];

function isOfficial(text) {
  const t = (text || "").toLowerCase();
  return OFFICIAL_GUARDS.some((kw) => t.includes(kw));
}

function getAllHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) getAllHtmlFiles(p, acc);
    else if (e.isFile() && p.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function updateMetaTags(content) {
  const tagPatterns = [
    { label: "title", regex: /<title>([\s\S]*?)<\/title>/gi },
    { label: "meta-desc", regex: /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "meta-keywords", regex: /<meta[^>]+name=["']keywords["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "og-title", regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "og-desc", regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "tw-title", regex: /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "tw-desc", regex: /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
  ];
  let applied = 0;
  tagPatterns.forEach(({ label, regex }) => {
    content = content.replace(regex, (whole, inner) => {
      if (!inner || !inner.includes("2025")) return whole;
      if (label === "meta-keywords") {
        const segments = inner.split(",").map((s) => s.trim());
        const updated = segments.map((seg) => (isOfficial(seg) ? seg : seg.replace(/2025/g, "2026"))).join(", ");
        if (updated !== inner) {
          applied++;
          return whole.replace(inner, updated);
        }
        return whole;
      } else {
        if (isOfficial(inner)) return whole;
        const replaced = inner.replace(/2025/g, "2026");
        if (replaced !== inner) {
          applied++;
          return whole.replace(inner, replaced);
        }
        return whole;
      }
    });
  });
  return { content, applied };
}

function updateJsonLd(content) {
  // Capture les blocs JSON-LD
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let applied = 0;
  content = content.replace(jsonLdRegex, (whole, jsonText) => {
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      // Fallback simple: remplacer "2025" par "2026" dans champs texte courants hors officiels
      const fallback = jsonText.replace(/("name"\s*:\s*")([\s\S]*?)(")/gi, (m, a, b, c) => {
        return isOfficial(b) ? m : a + b.replace(/2025/g, "2026") + c;
      }).replace(/("headline"\s*:\s*")([\s\S]*?)(")/gi, (m, a, b, c) => {
        return isOfficial(b) ? m : a + b.replace(/2025/g, "2026") + c;
      }).replace(/("description"\s*:\s*")([\s\S]*?)(")/gi, (m, a, b, c) => {
        return isOfficial(b) ? m : a + b.replace(/2025/g, "2026") + c;
      });
      if (fallback !== jsonText) {
        applied++;
        return whole.replace(jsonText, fallback);
      }
      return whole;
    }
    // Normaliser en tableau
    const arr = Array.isArray(data) ? data : [data];
    let changed = false;
    arr.forEach((node) => {
      ["name", "headline", "description"].forEach((key) => {
        const val = node && typeof node[key] === "string" ? node[key] : null;
        if (val && val.includes("2025") && !isOfficial(val)) {
          node[key] = val.replace(/2025/g, "2026");
          changed = true;
        }
      });
      // Ne pas modifier datePublished/dateModified
    });
    if (changed) {
      applied++;
      const updated = JSON.stringify(arr.length === 1 ? arr[0] : arr, null, 2);
      return whole.replace(jsonText, updated);
    }
    return whole;
  });
  return { content, applied };
}

const pagesDir = path.resolve(process.cwd(), "src/pages");
const indexFile = path.resolve(process.cwd(), "src/index.html");
const htmlFiles = fs.existsSync(pagesDir) ? getAllHtmlFiles(pagesDir) : [];
if (fs.existsSync(indexFile)) htmlFiles.push(indexFile);

let totalMeta = 0;
let totalJsonLd = 0;
let filesTouched = 0;

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const before = content;
  const m = updateMetaTags(content);
  content = m.content;
  totalMeta += m.applied;
  const j = updateJsonLd(content);
  content = j.content;
  totalJsonLd += j.applied;
  if (content !== before) {
    fs.writeFileSync(filePath, content, "utf-8");
    filesTouched++;
    console.log(`✔ ${path.relative(process.cwd(), filePath)} (meta:${m.applied}, jsonld:${j.applied})`);
  }
});

console.log(`\n✅ Migration SEO 2026 terminée`);
console.log(`   Fichiers modifiés: ${filesTouched}`);
console.log(`   Mises à jour meta: ${totalMeta}`);
console.log(`   Mises à jour JSON-LD: ${totalJsonLd}`);

