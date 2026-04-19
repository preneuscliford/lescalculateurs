#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith("--")) continue;
    const [key, ...rest] = raw.slice(2).split("=");
    args.set(key, rest.length ? rest.join("=") : "true");
  }

  return {
    googleInput:
      args.get("google-input") || "seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-04-18 (1).xlsx",
    bingInput:
      args.get("bing-input") || "seach-console-perf/www.lescalculateurs.fr_KeywordReport_4_19_2026.csv",
    top: Number.parseInt(args.get("top") || "25", 10),
    googleMinImpressions: Number.parseInt(args.get("google-min-impressions") || "150", 10),
    googleMaxPosition: Number.parseFloat(args.get("google-max-position") || "12"),
    googleMinPosition: Number.parseFloat(args.get("google-min-position") || "1"),
    bingMinImpressions: Number.parseInt(args.get("bing-min-impressions") || "80", 10),
    bingMaxPosition: Number.parseFloat(args.get("bing-max-position") || "12"),
    output: args.get("output") || "",
    exclude:
      (args.get("exclude") ||
        [
          "/pages/apl",
          "/pages/are",
          "/pages/rsa",
          "/pages/prime-activite",
          "/pages/apl-zones",
          "/pages/pret",
          "/pages/notaire",
        ].join(","))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
  };
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current);
  return out;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
}

function decodeMojibakeLight(text) {
  return String(text || "")
    .replace(/Ã´/g, "ô")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ãª/g, "ê")
    .replace(/Ã /g, "à")
    .replace(/Ã¢/g, "â")
    .replace(/Ã§/g, "ç")
    .replace(/Ã¹/g, "ù")
    .replace(/Ã«/g, "ë")
    .replace(/Ã¯/g, "ï")
    .replace(/â€™/g, "’")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—");
}

function normalizeKeyword(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parsePct(value) {
  const cleaned = String(value || "")
    .replace("%", "")
    .replace(",", ".")
    .trim();
  return cleaned ? Number.parseFloat(cleaned) / 100 : 0;
}

function scoreFromMetrics(impressions, ctr, position) {
  return impressions * (1 - Math.min(Math.max(ctr, 0), 1)) * (1 / Math.max(position, 1));
}

function isPseoPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] === "pages" && parts.length >= 3;
}

function inferPageType(pathname) {
  if (isPseoPath(pathname)) return "pseo";
  return "hub_or_pillar";
}

function classifyKeyword(keyword) {
  const text = normalizeKeyword(keyword);

  const rules = [
    { cluster: "impot", targetPage: "/pages/impot", terms: ["impot", "impots", "decote", "quotient familial", "bareme impot", "tranches d impot"] },
    { cluster: "apl", targetPage: "/pages/apl", terms: ["apl", "caf simulation apl", "simulation caf apl"] },
    { cluster: "prime-activite", targetPage: "/pages/prime-activite", terms: ["prime activite", "prime d'activite", "prime d activite"] },
    { cluster: "rsa", targetPage: "/pages/rsa", terms: ["rsa"] },
    { cluster: "are", targetPage: "/pages/are", terms: ["chomage", "allocation retour emploi", "simulateur chomage", "simulation chomage", "are"] },
    { cluster: "notaire", targetPage: "/pages/notaire", terms: ["frais de notaire", "notaire"] },
    { cluster: "pret", targetPage: "/pages/pret", terms: ["pret", "emprunt", "taux d'endettement", "mensualite"] },
    { cluster: "salaire", targetPage: "/pages/salaire-brut-net-calcul-2026", terms: ["brut en net", "salaire brut", "salaire net"] },
    { cluster: "aah", targetPage: "/pages/aah", terms: ["aah"] },
    { cluster: "asf", targetPage: "/pages/asf", terms: ["asf", "allocation de soutien familial"] },
    { cluster: "taxe", targetPage: "/pages/taxe", terms: ["taxe fonciere", "taxe habitation", "taxe"] },
    { cluster: "charges", targetPage: "/pages/charges", terms: ["charges", "charges sociales"] },
    { cluster: "crypto-bourse", targetPage: "/pages/crypto-bourse", terms: ["crypto", "bourse"] },
    { cluster: "caf", targetPage: "/pages/apl", terms: ["simulation caf", "caf simulation", "simulateur caf"] },
  ];

  for (const rule of rules) {
    if (rule.terms.some((term) => text.includes(term))) {
      return rule;
    }
  }

  return { cluster: "autres", targetPage: null };
}

function resolveLocalFile(pathname) {
  const srcRoot = path.resolve(process.cwd(), "src");
  const direct = path.join(srcRoot, `${pathname}.html`);
  if (fs.existsSync(direct)) return path.relative(process.cwd(), direct);

  const index = path.join(srcRoot, pathname, "index.html");
  if (fs.existsSync(index)) return path.relative(process.cwd(), index);

  return null;
}

function loadGooglePages(filePath, options) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets.Pages;
  if (!sheet) {
    throw new Error(`Onglet Pages introuvable dans ${filePath}`);
  }

  const excluded = new Set(options.exclude);
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  const items = [];

  for (const row of rows) {
    const rawUrl = row["Pages les plus populaires"] || row["Page"] || row["URL"] || row["Pages"];
    if (!rawUrl || typeof rawUrl !== "string") continue;

    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      continue;
    }

    const pathname = url.pathname.endsWith("/") && url.pathname !== "/" ? url.pathname.slice(0, -1) : url.pathname;
    if (!pathname.startsWith("/pages/")) continue;
    if (excluded.has(pathname)) continue;

    const impressions = Number(row.Impressions || 0);
    const clicks = Number(row.Clics || 0);
    const ctr = Number(row.CTR || 0);
    const position = Number(row.Position || 0);

    if (impressions < options.googleMinImpressions) continue;
    if (position < options.googleMinPosition || position > options.googleMaxPosition) continue;

    items.push({
      source: "google",
      page: pathname,
      filePath: resolveLocalFile(pathname),
      pageType: inferPageType(pathname),
      impressions,
      clicks,
      ctr,
      position,
      score: scoreFromMetrics(impressions, ctr, position),
      notes: [],
    });
  }

  return items.sort((a, b) => b.score - a.score);
}

function loadBingKeywords(filePath, options) {
  const excluded = new Set(options.exclude);
  const rows = readCsv(filePath);
  const keywordItems = [];

  for (const row of rows) {
    const keyword = decodeMojibakeLight(row.Keyword || "");
    const impressions = Number.parseInt(String(row.Impressions || "0").replace(/\s+/g, ""), 10) || 0;
    const clicks = Number.parseInt(String(row.Clicks || "0").replace(/\s+/g, ""), 10) || 0;
    const ctr = parsePct(row.CTR);
    const position = Number.parseFloat(String(row["Avg. Position"] || "0").replace(",", ".")) || 0;
    const classification = classifyKeyword(keyword);

    if (impressions < options.bingMinImpressions) continue;
    if (position <= 0 || position > options.bingMaxPosition) continue;
    if (classification.targetPage && excluded.has(classification.targetPage)) continue;

    keywordItems.push({
      keyword,
      impressions,
      clicks,
      ctr,
      position,
      score: scoreFromMetrics(impressions, ctr, position),
      cluster: classification.cluster,
      targetPage: classification.targetPage,
    });
  }

  const byTarget = new Map();
  for (const item of keywordItems) {
    const key = item.targetPage || `cluster:${item.cluster}`;
    if (!byTarget.has(key)) {
      byTarget.set(key, {
        source: "bing",
        page: item.targetPage,
        filePath: item.targetPage ? resolveLocalFile(item.targetPage) : null,
        pageType: item.targetPage ? inferPageType(item.targetPage) : "hub_or_pillar",
        cluster: item.cluster,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        position: 0,
        score: 0,
        notes: [],
        keywords: [],
      });
    }

    const bucket = byTarget.get(key);
    bucket.impressions += item.impressions;
    bucket.clicks += item.clicks;
    bucket.score += item.score;
    bucket.keywords.push(item);
  }

  const merged = [...byTarget.values()].map((bucket) => {
    const weightedPositionBase = bucket.keywords.reduce((sum, item) => sum + item.position * item.impressions, 0);
    const ctr = bucket.impressions ? bucket.clicks / bucket.impressions : 0;
    const position = bucket.impressions ? weightedPositionBase / bucket.impressions : 0;

    return {
      ...bucket,
      ctr,
      position,
      keywords: bucket.keywords.sort((a, b) => b.score - a.score).slice(0, 8),
    };
  });

  return merged.sort((a, b) => b.score - a.score);
}

function mergeSources(googlePages, bingTargets, top) {
  const byPage = new Map();

  for (const item of googlePages) {
    const key = item.page;
    byPage.set(key, {
      page: item.page,
      filePath: item.filePath,
      pageType: item.pageType,
      google: item,
      bing: null,
      mergedScore: item.score,
      rationale: [],
    });
  }

  for (const item of bingTargets) {
    const key = item.page || `bing:${item.cluster}`;
    if (!byPage.has(key)) {
      byPage.set(key, {
        page: item.page,
        filePath: item.filePath,
        pageType: item.pageType,
        google: null,
        bing: item,
        mergedScore: item.score,
        rationale: [],
      });
      continue;
    }

    const current = byPage.get(key);
    current.bing = item;
    current.mergedScore += item.score;
  }

  const merged = [...byPage.values()].map((item) => {
    const rationale = [];
    if (item.google) {
      rationale.push(
        `Google: ${item.google.impressions} impressions, CTR ${(item.google.ctr * 100).toFixed(2)}%, position ${item.google.position.toFixed(2)}`,
      );
    }
    if (item.bing) {
      rationale.push(
        `Bing: ${item.bing.impressions} impressions cumulees, CTR ${(item.bing.ctr * 100).toFixed(2)}%, position moyenne ${item.bing.position.toFixed(2)}`,
      );
    }

    return {
      ...item,
      rationale,
    };
  });

  return merged.sort((a, b) => b.mergedScore - a.mergedScore).slice(0, top);
}

function buildMarkdown(report) {
  const lines = [];
  lines.push(`# Priorites fusionnees Google + Bing (${report.generatedAt})`);
  lines.push("");
  lines.push("## Parametres");
  lines.push(`- Google source: \`${report.inputs.google}\``);
  lines.push(`- Bing source: \`${report.inputs.bing}\``);
  lines.push(`- Pages exclues: \`${report.excluded.join(", ")}\``);
  lines.push(`- Top opportunites: \`${report.summary.totalMerged}\``);
  lines.push("");
  lines.push("## Shortlist pour Claude");
  lines.push("| Cible | Type | Score fusionne | Google | Bing | Fichier local |");
  lines.push("|---|---|---:|---|---|---|");

  for (const item of report.merged) {
    const googleLabel = item.google
      ? `${item.google.impressions} impr / ${(item.google.ctr * 100).toFixed(2)}% / pos ${item.google.position.toFixed(2)}`
      : "-";
    const bingLabel = item.bing
      ? `${item.bing.impressions} impr / ${(item.bing.ctr * 100).toFixed(2)}% / pos ${item.bing.position.toFixed(2)}`
      : "-";
    lines.push(`| ${item.page || `(cluster ${item.bing.cluster})`} | ${item.pageType} | ${item.mergedScore.toFixed(2)} | ${googleLabel} | ${bingLabel} | ${item.filePath || "-"} |`);
  }

  for (const item of report.merged) {
    lines.push("");
    lines.push(`## ${item.page || `cluster ${item.bing.cluster}`}`);
    lines.push(`- Type: ${item.pageType}`);
    lines.push(`- Fichier local: ${item.filePath || "introuvable"}`);
    lines.push(`- Score fusionne: ${item.mergedScore.toFixed(2)}`);
    for (const note of item.rationale) {
      lines.push(`- ${note}`);
    }
    if (item.google) {
      lines.push("- Signal Google:");
      lines.push(`  ${item.google.impressions} impressions, ${item.google.clicks} clics, CTR ${(item.google.ctr * 100).toFixed(2)}%, position ${item.google.position.toFixed(2)}`);
    }
    if (item.bing) {
      lines.push("- Signal Bing:");
      lines.push(`  ${item.bing.impressions} impressions, ${item.bing.clicks} clics, CTR ${(item.bing.ctr * 100).toFixed(2)}%, position moyenne ${item.bing.position.toFixed(2)}`);
      lines.push("- Keywords Bing a injecter dans le brief Claude:");
      for (const keyword of item.bing.keywords) {
        lines.push(
          `  - ${keyword.keyword} | ${keyword.impressions} impr | ${(keyword.ctr * 100).toFixed(2)}% CTR | pos ${keyword.position.toFixed(2)}`,
        );
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

function main() {
  const options = parseArgs(process.argv);
  const googleInput = path.resolve(process.cwd(), options.googleInput);
  const bingInput = path.resolve(process.cwd(), options.bingInput);

  const googlePages = loadGooglePages(googleInput, options);
  const bingTargets = loadBingKeywords(bingInput, options);
  const merged = mergeSources(googlePages, bingTargets, options.top);

  const report = {
    generatedAt: new Date().toISOString(),
    inputs: {
      google: path.relative(process.cwd(), googleInput),
      bing: path.relative(process.cwd(), bingInput),
    },
    excluded: options.exclude,
    summary: {
      googleCandidates: googlePages.length,
      bingTargets: bingTargets.length,
      totalMerged: merged.length,
    },
    merged,
    googlePages,
    bingTargets,
  };

  const reportsDir = path.resolve(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const baseName = options.output || `google-bing-merged-priority-${new Date().toISOString().slice(0, 10)}`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const mdPath = path.join(reportsDir, `${baseName}.md`);
  const latestJsonPath = path.join(reportsDir, "google-bing-merged-priority-latest.json");
  const latestMdPath = path.join(reportsDir, "google-bing-merged-priority-latest.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${buildMarkdown(report)}\n`, "utf8");
  fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestMdPath, `${buildMarkdown(report)}\n`, "utf8");

  console.log(`Rapport JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Rapport Markdown: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Rapport latest JSON: ${path.relative(process.cwd(), latestJsonPath)}`);
  console.log(`Rapport latest Markdown: ${path.relative(process.cwd(), latestMdPath)}`);
  console.log(`Opportunites fusionnees: ${report.summary.totalMerged}`);
}

main();
