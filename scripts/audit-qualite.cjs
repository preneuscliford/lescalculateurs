#!/usr/bin/env node

/**
 * Audit qualité global — toutes les pages HTML du site
 * Vérifie : H1, meta title/description, canonical, liens cassés, slugs, données, dates
 * Score /100 par page pour identifier les priorités de correction
 */

const fs = require("fs");
const path = require("path");

const SRC_PAGES = path.resolve(__dirname, "..", "src", "pages");
const CONTENT_SAFE = path.resolve(__dirname, "..", "content_SAFE");
const BASE_URL = "https://www.lescalculateurs.fr";

// ─── Collecte des fichiers HTML ─────────────────────────────
function collectHtmlFiles(dir, base = "") {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "scripts" && !e.name.startsWith(".")) {
      results.push(...collectHtmlFiles(full, base + e.name + "/"));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      results.push({ filePath: full, relativePath: base + e.name });
    }
  }
  return results;
}

// ─── Extraction ────────────────────────────────────────────
function extractTag(content, tag) {
  const m = content.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  return m
    ? m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : null;
}

function extractMeta(content, name) {
  const m = content.match(
    new RegExp(`<meta\\s[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
  );
  if (m) return m[1];
  const m2 = content.match(
    new RegExp(`<meta\\s[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, "i"),
  );
  return m2 ? m2[1] : null;
}

function extractHrefs(content) {
  const hrefs = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    hrefs.push(m[1]);
  }
  return hrefs;
}

// ─── Vérifications ─────────────────────────────────────────
function auditPage(filePath, relativePath) {
  const issues = [];
  const warnings = [];
  let score = 100;

  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    return {
      score: 0,
      issues: [`Lecture impossible: ${e.message}`],
      warnings: [],
      h1: null,
      title: null,
      desc: null,
    };
  }

  // 1. H1
  const h1 = extractTag(content, "h1");
  if (!h1) {
    issues.push("H1 absent");
    score -= 30;
  } else if (h1.length < 10) {
    issues.push("H1 trop court (<10 chars)");
    score -= 10;
  } else if (h1.length > 120) {
    warnings.push("H1 long (>120 chars)");
    score -= 5;
  }

  // 2. Title
  const title = extractTag(content, "title");
  if (!title) {
    issues.push("Title absent");
    score -= 30;
  } else if (title.length < 20) {
    issues.push("Title trop court (<20 chars)");
    score -= 15;
  } else if (title.length > 70) {
    warnings.push("Title long (>70 chars)");
    score -= 5;
  } else if (!title.includes("2026") && !title.includes("2025")) {
    warnings.push("Title sans année (2025/2026)");
    score -= 5;
  }

  // 3. Meta description
  const desc = extractMeta(content, "description");
  if (!desc) {
    issues.push("Meta description absente");
    score -= 15;
  } else if (desc.length < 50) {
    issues.push("Meta description trop courte (<50)");
    score -= 8;
  } else if (desc.length > 160) {
    warnings.push("Meta description longue (>160)");
    score -= 3;
  }

  // 4. Canonical
  const canonical = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (!canonical) {
    warnings.push("Canonical absent");
    score -= 5;
  } else {
    const cUrl = canonical[1];
    // Vérifier que le canonical correspond à l'URL attendue
    // L'URL canonique doit correspondre à /pages/xxx (structure réelle du site)
    const cleanPath = relativePath
      .replace(/\\/g, "/")
      .replace(/index\.html$/, "")
      .replace(/\.html$/, "");
    const expectedUrl = BASE_URL + "/pages/" + cleanPath;
    const normalizedCanonical = cUrl.replace(/\/$/, "");
    const normalizedExpected = expectedUrl.replace(/\/$/, "");
    if (normalizedCanonical !== normalizedExpected) {
      warnings.push(
        `Canonical mismatch: attendu ${normalizedExpected}, trouvé ${normalizedCanonical}`,
      );
      score -= 5;
    }
  }

  // 5. Robots (noindex)
  const robots = extractMeta(content, "robots");
  if (robots && robots.includes("noindex")) {
    issues.push("NOINDEX actif");
    score -= 50;
  }

  // 6. Données structurées (JSON-LD basique)
  const jsonld = content.includes("application/ld+json");
  if (!jsonld) {
    warnings.push("Pas de JSON-LD");
    score -= 3;
  }

  // 7. Liens internes cassés (chemins relatifs vers fichiers inexistants)
  const hrefs = extractHrefs(content);
  for (const href of hrefs) {
    if (href.startsWith("/pages/") || href.startsWith("/")) {
      const targetPath = path.join(SRC_PAGES, href.replace(/^\//, "").replace(/\/$/, "") + ".html");
      const targetPath2 = path.join(
        SRC_PAGES,
        href.replace(/^\//, "").replace(/\/$/, ""),
        "index.html",
      );
      if (
        !fs.existsSync(targetPath) &&
        !fs.existsSync(targetPath2) &&
        !href.startsWith("/pages/scripts/") &&
        !href.startsWith("/assets/") &&
        !href.includes(".")
      ) {
        // Ignorer les cas où le fichier existe dans content_SAFE
        const targetCS = path.join(
          CONTENT_SAFE,
          href.replace(/^\//, "").replace(/\/$/, "") + ".html",
        );
        const targetCS2 = path.join(
          CONTENT_SAFE,
          href.replace(/^\//, "").replace(/\/$/, ""),
          "index.html",
        );
        if (!fs.existsSync(targetCS) && !fs.existsSync(targetCS2)) {
          warnings.push(`Lien potentiellement cassé: ${href}`);
          score -= 2;
        }
      }
    }
  }

  // 8. Date de mise à jour
  const hasDateUpdate =
    content.includes("Dernière mise à jour") || content.includes("dateModified");
  if (!hasDateUpdate) {
    warnings.push("Pas de date de mise à jour visible");
    score -= 2;
  }

  // 9. Images sans alt
  const imgsWithoutAlt = (content.match(/<img[^>]*>/gi) || []).filter(
    (img) => !/alt=["'][^"']*["']/i.test(img),
  );
  if (imgsWithoutAlt.length > 0) {
    warnings.push(`${imgsWithoutAlt.length} image(s) sans alt`);
    score -= imgsWithoutAlt.length;
  }

  // 10. Vérifier les entités HTML mal formées
  const badEntities = (content.match(/&[a-zA-Z]+[^;]/g) || []).filter((e) => !e.endsWith(";"));
  if (badEntities.length > 0) {
    warnings.push(`${badEntities.length} entité(s) HTML suspecte(s)`);
    score -= Math.min(badEntities.length, 5);
  }

  score = Math.max(0, score);

  return {
    score,
    issues,
    warnings,
    h1,
    title,
    desc,
    relativePath:
      "/" +
      relativePath
        .replace(/\\/g, "/")
        .replace(/index\.html$/, "")
        .replace(/\.html$/, ""),
  };
}

// ─── MAIN ───────────────────────────────────────────────────
console.log("=".repeat(90));
console.log("  AUDIT QUALITÉ GLOBAL — lescalculateurs.fr");
console.log("=".repeat(90));
console.log("");

const allFiles = [...collectHtmlFiles(SRC_PAGES, ""), ...collectHtmlFiles(CONTENT_SAFE, "")];

// Dédupliquer
const seen = new Set();
const uniqueFiles = allFiles.filter((f) => {
  const key = f.relativePath;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.log(`  Pages scannées: ${uniqueFiles.length}`);
console.log("");
console.log(
  "  Vérifications: H1, Title, Meta desc, Canonical, Noindex, Liens, Dates, Images, JSON-LD, Entités HTML",
);
console.log("");
console.log("=".repeat(90));
console.log("");

// Auditer toutes les pages
const results = uniqueFiles.map((f) => auditPage(f.filePath, f.relativePath));
results.sort((a, b) => a.score - b.score); // Prioriser les pires

// Stats
const criticals = results.filter((r) => r.score <= 50);
const warnings_list = results.filter((r) => r.score > 50 && r.score <= 75);
const goods = results.filter((r) => r.score > 75);

console.log(`  📊 DISTRIBUTION`);
console.log(`     🔴 Critique (≤50):  ${criticals.length}`);
console.log(`     🟡 Warning  (51-75): ${warnings_list.length}`);
console.log(`     🟢 OK       (>75):  ${goods.length}`);
console.log("");
console.log("=".repeat(90));
console.log("");

// Afficher les 20 pires
console.log("  🔴 TOP 20 PAGES À CORRIGER EN PRIORITÉ");
console.log("─".repeat(90));
console.log("");

for (let i = 0; i < Math.min(20, results.length); i++) {
  const r = results[i];
  if (r.score >= 80) break;

  const icon = r.score <= 30 ? "🔴" : r.score <= 50 ? "🟠" : r.score <= 75 ? "🟡" : "🟢";
  const pagePath = (r.relativePath || "").padEnd(50);
  console.log(`  ${icon} [${String(r.score).padStart(3)}] ${pagePath}`);
  console.log(`      H1: ${(r.h1 || "ABSENT").slice(0, 70)}`);
  console.log(`      Title: ${(r.title || "ABSENT").slice(0, 70)}`);
  for (const issue of r.issues) {
    console.log(`      ❌ ${issue}`);
  }
  for (const w of r.warnings.slice(0, 3)) {
    console.log(`      ⚠ ${w}`);
  }
  if (r.warnings.length > 3) {
    console.log(`      ... et ${r.warnings.length - 3} autres warnings`);
  }
  console.log("");
}

// Résumé par type d'issue
console.log("─".repeat(90));
console.log("  📋 RÉCAPITULATIF PAR TYPE D'ISSUE");
console.log("─".repeat(90));
console.log("");

const issueCounts = {};
for (const r of results) {
  for (const issue of r.issues) {
    const key = issue.split(":")[0].trim();
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  }
  for (const w of r.warnings) {
    const key = w.split(":")[0].trim();
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  }
}

const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
for (const [issue, count] of sortedIssues.slice(0, 15)) {
  console.log(`  ${String(count).padStart(4)} pages — ${issue}`);
}

console.log("");
console.log("=".repeat(90));
console.log(
  `  Score moyen: ${(results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)}/100`,
);
console.log("=".repeat(90));
