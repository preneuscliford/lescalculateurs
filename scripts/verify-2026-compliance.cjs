#!/usr/bin/env node
/**
 * Vérifie la conformité 2026:
 * - SEO (title, meta desc/keywords, og/title/desc, twitter/title/desc)
 * - JSON-LD (name, headline, description)
 * - Textes visibles (h1–h6, p, li, span, a, strong, em, small, summary)
 * Signale toute occurrence de "2025" hors contexte officiel.
 */
const fs = require("fs");
const path = require("path");

const OFFICIAL_GUARDS = [
  "barème", "barèmes", "officiel", "officiels",
  "bofip", "impots.gouv.fr", "bofip.impots.gouv.fr",
  "legifrance.gouv.fr", "service-public.fr", "notaires.fr", "chambre des notaires",
  "data.gouv.fr", "dvf", "cgi", "code général des impôts", "urssaf", "urssaf.fr", "dmto",
  "barème ir", "tranches", "impôt sur le revenu"
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

function scanMeta(content) {
  const issues = [];
  const patterns = [
    { label: "title", regex: /<title>([\s\S]*?)<\/title>/gi },
    { label: "meta-desc", regex: /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "meta-keywords", regex: /<meta[^>]+name=["']keywords["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "og-title", regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "og-desc", regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "tw-title", regex: /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
    { label: "tw-desc", regex: /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi },
  ];
  patterns.forEach(({ label, regex }) => {
    let m;
    while ((m = regex.exec(content)) !== null) {
      const inner = m[1] || "";
      if (inner.includes("2025")) {
        if (label === "meta-keywords") {
          const segs = inner.split(",").map((s) => s.trim());
          const offending = segs.filter((s) => s.includes("2025") && !isOfficial(s));
          if (offending.length) issues.push({ label, value: offending.join(", ") });
        } else {
          if (!isOfficial(inner)) issues.push({ label, value: inner });
        }
      }
    }
  });
  return issues;
}

function scanJsonLd(content) {
  const issues = [];
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = jsonLdRegex.exec(content)) !== null) {
    const jsonText = m[1] || "";
    try {
      const data = JSON.parse(jsonText);
      const arr = Array.isArray(data) ? data : [data];
      arr.forEach((node) => {
        ["name", "headline", "description"].forEach((key) => {
          const val = node && typeof node[key] === "string" ? node[key] : null;
          if (val && val.includes("2025") && !isOfficial(val)) {
            issues.push({ label: `jsonld:${key}`, value: val });
          }
        });
      });
    } catch {
      const extract = (re, lbl) => {
        const mm = re.exec(jsonText);
        if (mm && mm[2] && mm[2].includes("2025") && !isOfficial(mm[2])) {
          issues.push({ label: `jsonld:${lbl}`, value: mm[2] });
        }
      };
      extract(/("name"\s*:\s*")([\s\S]*?)(")/i, "name");
      extract(/("headline"\s*:\s*")([\s\S]*?)(")/i, "headline");
      extract(/("description"\s*:\s*")([\s\S]*?)(")/i, "description");
    }
  }
  return issues;
}

function scanVisible(content) {
  const issues = [];
  const tagPatterns = [
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    /<h5[^>]*>([\s\S]*?)<\/h5>/gi,
    /<h6[^>]*>([\s\S]*?)<\/h6>/gi,
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    /<span[^>]*>([\s\S]*?)<\/span>/gi,
    /<a[^>]*>([\s\S]*?)<\/a>/gi,
    /<strong[^>]*>([\s\S]*?)<\/strong>/gi,
    /<em[^>]*>([\s\S]*?)<\/em>/gi,
    /<small[^>]*>([\s\S]*?)<\/small>/gi,
    /<summary[^>]*>([\s\S]*?)<\/summary>/gi,
  ];
  tagPatterns.forEach((regex) => {
    let m;
    while ((m = regex.exec(content)) !== null) {
      const inner = m[1] || "";
      if (inner.includes("2025")) {
        const range = /2024[-–]2025|2025[-–]2026/.test(inner);
        if (!range && !isOfficial(inner)) {
          issues.push({ label: "visible", value: inner.slice(0, 160) });
        }
      }
    }
  });
  return issues;
}

const pagesDir = path.resolve(process.cwd(), "src/pages");
const indexFile = path.resolve(process.cwd(), "src/index.html");
const files = fs.existsSync(pagesDir) ? getAllHtmlFiles(pagesDir) : [];
if (fs.existsSync(indexFile)) files.push(indexFile);

const report = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const metaIssues = scanMeta(content);
  const jsonIssues = scanJsonLd(content);
  const visIssues = scanVisible(content);
  const all = [...metaIssues, ...jsonIssues, ...visIssues];
  if (all.length) {
    report.push({
      file: path.relative(process.cwd(), filePath),
      issues: all,
    });
  }
});

if (!report.length) {
  console.log("✅ Conformité 2026: Aucune occurrence non‑officielle de '2025' détectée.");
} else {
  console.log("⚠️ Occurrences non‑officielles à corriger:\n");
  report.forEach((entry) => {
    console.log(`• ${entry.file}`);
    entry.issues.forEach((i) => {
      console.log(`   - [${i.label}] ${i.value}`);
    });
  });
  console.log(`\nTotal fichiers avec occurrences: ${report.length}`);
}
