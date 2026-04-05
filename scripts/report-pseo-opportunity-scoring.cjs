#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

let xlsx;
try {
  xlsx = require("xlsx");
} catch (error) {
  console.error("Le module xlsx est requis pour lire l'export Search Console.");
  process.exit(1);
}

const DEFAULT_OUTPUT_PATH = "reports/pseo-opportunity-scoring.json";
const DEFAULT_QUALITY_PATH = "reports/pseo-quality-report.json";
const DEFAULT_TRIAGE_PATH = "reports/languagetool-triage-site.json";
const PSEO_CLUSTERS = new Set(["apl", "rsa", "are", "asf", "prime-activite", "simulateurs"]);
const STOPWORDS = new Set([
  "a",
  "ai",
  "ainsi",
  "alors",
  "apres",
  "au",
  "aucun",
  "aucune",
  "aux",
  "avec",
  "calcul",
  "comment",
  "dans",
  "de",
  "des",
  "droit",
  "droits",
  "du",
  "elle",
  "en",
  "est",
  "et",
  "etre",
  "faire",
  "guide",
  "gratuite",
  "gratuit",
  "les",
  "leur",
  "ma",
  "mes",
  "montant",
  "nous",
  "ou",
  "par",
  "pas",
  "pages",
  "pour",
  "quelles",
  "quoi",
  "sans",
  "selon",
  "seul",
  "seule",
  "simulateur",
  "simulateurs",
  "simulation",
  "sur",
  "tous",
  "tout",
  "une",
  "vos",
  "votre",
  "2025",
  "2026",
  "2027",
  "apl",
  "rsa",
  "are",
  "asf",
  "prime",
  "activite",
]);

function parseArgs() {
  return new Map(
    process.argv.slice(2).map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeHeader(value) {
  return normalizeText(value).replace(/\s+/g, " ").trim();
}

function normalizeRoute(value) {
  if (!value) return null;
  let route = String(value).trim();

  if (/^https?:\/\//i.test(route)) {
    try {
      route = new URL(route).pathname;
    } catch (error) {
      return null;
    }
  }

  route = route.replace(/\\/g, "/");
  route = route.replace(/\/index\.html$/i, "");
  route = route.replace(/\.html$/i, "");
  route = route.replace(/\/+$/, "");

  if (!route.startsWith("/")) route = `/${route}`;
  return route === "/" ? "/" : route;
}

function buildPublicUrl(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (!normalized.startsWith("src/pages/")) return null;

  let route = normalized.slice("src/pages/".length);
  if (route.endsWith("/index.html")) {
    route = route.slice(0, -"/index.html".length);
  } else if (route.endsWith(".html")) {
    route = route.slice(0, -".html".length);
  }

  return normalizeRoute(`/pages/${route}`);
}

function getMetricValue(row, metricLabel) {
  const keys = Object.keys(row || {});
  const metric = normalizeHeader(metricLabel);
  const candidates = keys.filter((item) => normalizeHeader(item).includes(metric));
  if (candidates.length === 0) return 0;

  const dated = candidates.find((item) => normalizeHeader(item).includes("les 28 derniers jours"));
  const key = dated || candidates[0];
  return Number(row[key]) || 0;
}

function getFirstCellValue(row) {
  const firstKey = Object.keys(row || {})[0];
  return firstKey ? row[firstKey] : "";
}

function logScore(value, reference) {
  if (!value || value <= 0 || !reference || reference <= 0) return 0;
  return clamp((Math.log1p(value) / Math.log1p(reference)) * 100);
}

function positionScore(position) {
  const value = Number(position) || 0;
  if (!value) return 0;
  if (value <= 3) return 95;
  if (value <= 6) return 100 - (value - 3) * 4;
  if (value <= 10) return 88 - (value - 6) * 5;
  if (value <= 20) return 68 - (value - 10) * 3.5;
  return clamp(33 - (value - 20));
}

function ctrScore(value, reference) {
  if (!reference || reference <= 0) return 0;
  return clamp(((Number(value) || 0) / reference) * 100);
}

function languageScore(actionableCount) {
  return clamp(100 - (Number(actionableCount) || 0) * 12);
}

function resolveWorkbookPath(inputPath) {
  if (inputPath) {
    const absolute = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Fichier introuvable: ${absolute}`);
    }
    return absolute;
  }

  const roots = [process.cwd(), path.join(os.homedir(), "Downloads")];
  const candidates = [];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".xlsx")) continue;
      if (!/performance-on-search/i.test(entry.name)) continue;
      const filePath = path.join(root, entry.name);
      const stats = fs.statSync(filePath);
      candidates.push({ filePath, mtimeMs: stats.mtimeMs });
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (candidates.length === 0) {
    throw new Error("Aucun export Search Console .xlsx trouve. Utilisez --input=...");
  }

  return candidates[0].filePath;
}

function loadWorkbookPages(workbookPath) {
  const workbook = xlsx.readFile(workbookPath);
  const rows = workbook.SheetNames.includes("Pages")
    ? xlsx.utils.sheet_to_json(workbook.Sheets.Pages, { defval: null })
    : [];

  return {
    sheets: workbook.SheetNames,
    pages: rows,
  };
}

function loadJson(filePath) {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`JSON introuvable: ${absolute}`);
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

function buildQualityIndex(qualityReport) {
  const byUrl = new Map();

  for (const item of qualityReport.files || []) {
    if (!item.url) continue;
    const route = normalizeRoute(item.url);
    if (!route) continue;
    const cluster = route.split("/")[2];
    if (!PSEO_CLUSTERS.has(cluster)) continue;

    const existing = byUrl.get(route);
    if (!existing || (Number(item.score) || 0) >= (Number(existing.score) || 0)) {
      byUrl.set(route, {
        route,
        cluster,
        title: item.title || "",
        qualityScore: Number(item.score) || 0,
        subscores: item.subscores || {},
        filePath: item.filePath || "",
        visibleLength: Number(item.visibleLength) || 0,
      });
    }
  }

  return byUrl;
}

function buildLanguageIndex(triageReport) {
  const byUrl = new Map();

  for (const item of triageReport.actionableFiles || []) {
    const route = buildPublicUrl(item.filePath);
    if (!route) continue;
    const cluster = route.split("/")[2];
    if (!PSEO_CLUSTERS.has(cluster)) continue;
    byUrl.set(route, Math.max(byUrl.get(route) || 0, Number(item.actionableCount) || 0));
  }

  return byUrl;
}

function getClusterFromRoute(route) {
  const parts = String(route || "").split("/");
  return parts[2] || "";
}

function getSlugFromRoute(route) {
  const parts = String(route || "").split("/");
  return parts.slice(3).join("-");
}

function getRouteBaseTokens(route) {
  return normalizeText(getSlugFromRoute(route))
    .split(/[^a-z0-9]+/)
    .filter((token) => token && token.length >= 3 && !STOPWORDS.has(token));
}

function extractIntentFeatures(route) {
  const baseTokens = getRouteBaseTokens(route);
  const features = new Set(baseTokens);

  for (let index = 0; index < baseTokens.length - 1; index += 1) {
    features.add(`${baseTokens[index]}-${baseTokens[index + 1]}`);
  }

  return Array.from(features);
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function buildObservedPages(rows) {
  const allPages = rows
    .map((row) => {
      const rawUrl = String(getFirstCellValue(row) || "");
      const route = normalizeRoute(rawUrl);
      const cluster = getClusterFromRoute(route);
      if (!route || !PSEO_CLUSTERS.has(cluster) || route.split("/").length < 4) return null;

      return {
        route,
        cluster,
        clicks: getMetricValue(row, "clics"),
        impressions: getMetricValue(row, "impressions"),
        ctr: getMetricValue(row, "ctr"),
        position: getMetricValue(row, "position"),
      };
    })
    .filter(Boolean);

  const deduped = uniqueBy(allPages, (item) => item.route);
  const maxClicks = Math.max(...deduped.map((item) => item.clicks), 1);
  const maxImpressions = Math.max(...deduped.map((item) => item.impressions), 1);
  const sortedCtr = deduped.map((item) => item.ctr).sort((a, b) => a - b);
  const ctrReference = sortedCtr[Math.max(0, Math.floor(sortedCtr.length * 0.9) - 1)] || 0.05;

  return deduped
    .map((item) => {
      const observedTrafficScore = clamp(
        logScore(item.clicks, maxClicks) * 0.4 +
          logScore(item.impressions, maxImpressions) * 0.3 +
          ctrScore(item.ctr, ctrReference) * 0.15 +
          positionScore(item.position) * 0.15,
      );

      return {
        ...item,
        observedTrafficScore: round(observedTrafficScore),
      };
    })
    .sort((a, b) => b.observedTrafficScore - a.observedTrafficScore || b.clicks - a.clicks);
}

function buildClusterStats(observedPages) {
  const stats = new Map();

  for (const page of observedPages) {
    const current = stats.get(page.cluster) || {
      cluster: page.cluster,
      pages: 0,
      clicks: 0,
      impressions: 0,
      trafficScoreSum: 0,
      weightedPosition: 0,
    };

    current.pages += 1;
    current.clicks += page.clicks;
    current.impressions += page.impressions;
    current.trafficScoreSum += page.observedTrafficScore;
    current.weightedPosition += page.position * Math.max(1, page.impressions);
    stats.set(page.cluster, current);
  }

  return Array.from(stats.values())
    .map((item) => ({
      ...item,
      avgTrafficScore: round(item.trafficScoreSum / item.pages),
      avgPosition: round(item.weightedPosition / Math.max(1, item.impressions), 2),
    }))
    .sort((a, b) => b.avgTrafficScore - a.avgTrafficScore || b.clicks - a.clicks);
}

function buildTokenStats(observedPages) {
  const stats = new Map();
  const overallAvgTraffic =
    observedPages.length > 0
      ? observedPages.reduce((sum, item) => sum + item.observedTrafficScore, 0) / observedPages.length
      : 0;

  for (const page of observedPages) {
    const features = extractIntentFeatures(page.route);
    for (const feature of features) {
      const current = stats.get(feature) || {
        token: feature,
        pages: 0,
        clicks: 0,
        impressions: 0,
        trafficScoreSum: 0,
        weightedPosition: 0,
      };

      current.pages += 1;
      current.clicks += page.clicks;
      current.impressions += page.impressions;
      current.trafficScoreSum += page.observedTrafficScore;
      current.weightedPosition += page.position * Math.max(1, page.impressions);
      stats.set(feature, current);
    }
  }

  return Array.from(stats.values())
    .filter((item) => item.pages >= 2)
    .map((item) => {
      const avgTrafficScore = item.trafficScoreSum / item.pages;
      const supportScore = clamp((Math.log1p(item.pages) / Math.log1p(10)) * 100);
      const tokenScore = clamp(avgTrafficScore * 0.75 + supportScore * 0.25);

      return {
        token: item.token,
        pages: item.pages,
        clicks: item.clicks,
        impressions: item.impressions,
        avgPosition: round(item.weightedPosition / Math.max(1, item.impressions), 2),
        avgTrafficScore: round(avgTrafficScore),
        liftVsAverage: round(avgTrafficScore - overallAvgTraffic),
        tokenScore: round(tokenScore),
      };
    })
    .sort((a, b) => b.tokenScore - a.tokenScore || b.clicks - a.clicks);
}

function indexBy(list, key) {
  return new Map(list.map((item) => [item[key], item]));
}

function buildExplainability(route, tokenIndex) {
  const features = extractIntentFeatures(route);
  const drivers = features
    .map((token) => tokenIndex.get(token))
    .filter(Boolean)
    .sort((a, b) => b.tokenScore - a.tokenScore)
    .slice(0, 3)
    .map((item) => ({
      token: item.token,
      tokenScore: item.tokenScore,
      liftVsAverage: item.liftVsAverage,
      pages: item.pages,
    }));

  const weakSignals = features
    .filter((token) => !tokenIndex.has(token))
    .slice(0, 3);

  return { tokens: features, drivers, weakSignals };
}

function computePageOpportunity(page, observedIndex, tokenIndex, clusterIndex, languageIndex) {
  const observed = observedIndex.get(page.route);
  const cluster = clusterIndex.get(page.cluster);
  const actionableCount = languageIndex.get(page.route) || 0;
  const langScore = languageScore(actionableCount);
  const explainability = buildExplainability(page.route, tokenIndex);
  const tokenScores = explainability.drivers.map((item) => item.tokenScore);
  const tokenIntentScore =
    tokenScores.length > 0 ? tokenScores.reduce((sum, item) => sum + item, 0) / tokenScores.length : 35;
  const clusterIntentScore = cluster ? cluster.avgTrafficScore : 35;
  const readinessScore = clamp(page.qualityScore * 0.75 + langScore * 0.25);
  const proofScore = observed ? observed.observedTrafficScore : 0;

  const opportunityScore = observed
    ? clamp(
        proofScore * 0.4 +
          tokenIntentScore * 0.2 +
          clusterIntentScore * 0.1 +
          readinessScore * 0.2 +
          positionScore(observed.position) * 0.1,
      )
    : clamp(tokenIntentScore * 0.45 + clusterIntentScore * 0.2 + readinessScore * 0.35);

  return {
    route: page.route,
    cluster: page.cluster,
    title: page.title,
    qualityScore: page.qualityScore,
    actionableCount,
    languageScore: round(langScore),
    readinessScore: round(readinessScore),
    tokenIntentScore: round(tokenIntentScore),
    clusterIntentScore: round(clusterIntentScore),
    proofScore: round(proofScore),
    opportunityScore: round(opportunityScore),
    observedClicks: observed ? observed.clicks : 0,
    observedImpressions: observed ? observed.impressions : 0,
    observedCtr: observed ? observed.ctr : 0,
    observedPosition: observed ? observed.position : 0,
    explainability,
  };
}

function buildRecommendations(scoredPages, tokenStats, clusterStats) {
  const recommendations = [];
  const observedWinners = scoredPages.filter((item) => item.proofScore > 0).slice(0, 3);
  const nextCandidates = scoredPages.filter((item) => item.proofScore === 0).slice(0, 3);
  const topTokens = tokenStats.slice(0, 5).map((item) => item.token);
  const topCluster = clusterStats[0];

  if (topCluster) {
    recommendations.push(
      `Le cluster le plus fertile aujourd'hui est ${topCluster.cluster}, avec ${topCluster.clicks} clics et un traffic score moyen de ${topCluster.avgTrafficScore}/100.`,
    );
  }

  if (topTokens.length > 0) {
    recommendations.push(
      `Les intentions qui portent le mieux la demande actuelle sont ${topTokens.join(", ")}. Le scoring futur doit d'abord reproduire ces motifs avant de s'eloigner.`,
    );
  }

  if (observedWinners.length > 0) {
    recommendations.push(
      `Vos pages de preuve sont ${observedWinners.map((item) => item.route).join(", ")}. Elles doivent servir de seed pages et de reference de maillage.`,
    );
  }

  if (nextCandidates.length > 0) {
    recommendations.push(
      `Les prochaines pages a pousser sans intuition naive sont ${nextCandidates.map((item) => item.route).join(", ")} car elles combinent tokens gagnants et readiness elevee.`,
    );
  }

  return recommendations;
}

function renderHtml(report) {
  const observedRows = report.topObservedPages
    .map(
      (item) => `<tr>
  <td><a href="https://www.lescalculateurs.fr${item.route}" target="_blank" rel="noreferrer">${item.route}</a></td>
  <td><strong>${item.opportunityScore}</strong></td>
  <td>${item.observedClicks}</td>
  <td>${item.observedImpressions}</td>
  <td>${round(item.observedCtr * 100, 2)}%</td>
  <td>${round(item.observedPosition, 2)}</td>
  <td>${item.explainability.drivers.map((driver) => driver.token).join(", ") || "n/a"}</td>
</tr>`,
    )
    .join("");

  const nextRows = report.nextToPush
    .map(
      (item) => `<tr>
  <td><a href="https://www.lescalculateurs.fr${item.route}" target="_blank" rel="noreferrer">${item.route}</a></td>
  <td><strong>${item.opportunityScore}</strong></td>
  <td>${item.cluster}</td>
  <td>${item.tokenIntentScore}</td>
  <td>${item.readinessScore}</td>
  <td>${item.explainability.drivers.map((driver) => driver.token).join(", ") || "n/a"}</td>
</tr>`,
    )
    .join("");

  const tokenRows = report.topTokens
    .map(
      (item) => `<tr>
  <td>${item.token}</td>
  <td><strong>${item.tokenScore}</strong></td>
  <td>${item.clicks}</td>
  <td>${item.impressions}</td>
  <td>${item.pages}</td>
  <td>${item.avgPosition}</td>
</tr>`,
    )
    .join("");

  const clusterRows = report.clusterInsights
    .map(
      (item) => `<tr>
  <td>${item.cluster}</td>
  <td><strong>${item.avgTrafficScore}</strong></td>
  <td>${item.clicks}</td>
  <td>${item.impressions}</td>
  <td>${item.pages}</td>
  <td>${item.avgPosition}</td>
</tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>pSEO Opportunity Scoring</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f4f7fb; color: #132238; }
    .wrap { max-width: 1420px; margin: 0 auto; padding: 24px; }
    .hero { background: linear-gradient(135deg, #0f172a, #0f5e9c); color: white; padding: 24px; border-radius: 18px; box-shadow: 0 18px 48px rgba(15, 23, 42, .18); }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0; }
    .card, .panel { background: white; border-radius: 16px; padding: 18px; box-shadow: 0 8px 26px rgba(19, 34, 56, .08); }
    .card strong { display: block; font-size: 1.7rem; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e7edf6; padding: 10px 8px; text-align: left; vertical-align: top; font-size: 14px; }
    a { color: #0b5bd3; text-decoration: none; }
    ul { margin: 0; padding-left: 18px; }
    .muted { color: #6b7280; }
    @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <div class="muted">Genere le ${report.generatedAt}</div>
      <h1>Scoring pSEO global simulateurs</h1>
      <p>Ce score ne depend pas d'une date cible. Il apprend sur toutes les pages pSEO qui performent deja pour comprendre quels motifs d'intention portent le trafic.</p>
    </section>
    <section class="cards">
      <div class="card"><span>Pages pSEO observees</span><strong>${report.summary.observedPages}</strong></div>
      <div class="card"><span>Pages pSEO scorees</span><strong>${report.summary.scoredPages}</strong></div>
      <div class="card"><span>Clics pSEO</span><strong>${report.summary.totalClicks}</strong></div>
      <div class="card"><span>Impressions pSEO</span><strong>${report.summary.totalImpressions}</strong></div>
      <div class="card"><span>Tokens analysés</span><strong>${report.summary.learnedTokens}</strong></div>
      <div class="card"><span>Cluster leader</span><strong>${report.summary.topCluster}</strong></div>
    </section>
    <section class="panel" style="margin-bottom: 18px;">
      <h2>Lecture strategique</h2>
      <ul>${report.recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="grid">
      <div class="panel">
        <h2>Pages qui prouvent deja la demande</h2>
        <table><thead><tr><th>Page</th><th>Score</th><th>Clics</th><th>Impr.</th><th>CTR</th><th>Pos.</th><th>Drivers</th></tr></thead><tbody>${observedRows}</tbody></table>
      </div>
      <div class="panel">
        <h2>Pages a pousser ensuite</h2>
        <table><thead><tr><th>Page</th><th>Score</th><th>Cluster</th><th>Intent</th><th>Readiness</th><th>Drivers</th></tr></thead><tbody>${nextRows}</tbody></table>
      </div>
    </section>
    <section class="grid" style="margin-top: 18px;">
      <div class="panel">
        <h2>Tokens qui expliquent le trafic</h2>
        <table><thead><tr><th>Token</th><th>Score</th><th>Clics</th><th>Impr.</th><th>Pages</th><th>Pos.</th></tr></thead><tbody>${tokenRows}</tbody></table>
      </div>
      <div class="panel">
        <h2>Forces par cluster</h2>
        <table><thead><tr><th>Cluster</th><th>Score</th><th>Clics</th><th>Impr.</th><th>Pages</th><th>Pos.</th></tr></thead><tbody>${clusterRows}</tbody></table>
      </div>
    </section>
  </div>
</body>
</html>`;
}

function main() {
  const args = parseArgs();
  const workbookPath = resolveWorkbookPath(args.get("input"));
  const outputPath = path.resolve(process.cwd(), args.get("output") || DEFAULT_OUTPUT_PATH);
  const htmlPath = outputPath.replace(/\.json$/i, ".html");
  const qualityPath = args.get("quality") || DEFAULT_QUALITY_PATH;
  const triagePath = args.get("triage") || DEFAULT_TRIAGE_PATH;

  const workbook = loadWorkbookPages(workbookPath);
  const qualityIndex = buildQualityIndex(loadJson(qualityPath));
  const languageIndex = buildLanguageIndex(loadJson(triagePath));
  const observedPages = buildObservedPages(workbook.pages);
  const clusterStats = buildClusterStats(observedPages);
  const tokenStats = buildTokenStats(observedPages);
  const observedIndex = indexBy(observedPages, "route");
  const clusterIndex = indexBy(clusterStats, "cluster");
  const tokenIndex = indexBy(tokenStats, "token");

  const scoredPages = Array.from(qualityIndex.values())
    .map((page) => computePageOpportunity(page, observedIndex, tokenIndex, clusterIndex, languageIndex))
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.proofScore - a.proofScore);

  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      workbookPath,
      sheets: workbook.sheets,
      qualityPath: path.resolve(process.cwd(), qualityPath),
      triagePath: path.resolve(process.cwd(), triagePath),
    },
    scoringSystem: {
      principle:
        "Le score ne depend pas d'une fenetre de dates. Il apprend sur toutes les pages pSEO observees pour identifier les motifs d'intention qui produisent du trafic.",
      observedTrafficScore:
        "40% clics normalises, 30% impressions normalisees, 15% CTR normalise, 15% position organique",
      opportunityScoreObserved:
        "40% preuve trafic, 20% intent tokens, 10% force du cluster, 20% readiness, 10% position",
      opportunityScoreUnobserved:
        "45% intent tokens, 20% force du cluster, 35% readiness",
    },
    summary: {
      observedPages: observedPages.length,
      scoredPages: scoredPages.length,
      totalClicks: observedPages.reduce((sum, item) => sum + item.clicks, 0),
      totalImpressions: observedPages.reduce((sum, item) => sum + item.impressions, 0),
      learnedTokens: tokenStats.length,
      topCluster: clusterStats[0] ? clusterStats[0].cluster : "n/a",
    },
    clusterInsights: clusterStats,
    topTokens: tokenStats.slice(0, 20),
    topObservedPages: scoredPages.filter((item) => item.proofScore > 0).slice(0, 20),
    nextToPush: scoredPages.filter((item) => item.proofScore === 0).slice(0, 20),
    scoredPages,
  };

  report.recommendations = buildRecommendations(scoredPages, tokenStats, clusterStats);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(htmlPath, renderHtml(report), "utf8");

  console.log(`Scoring pSEO genere: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`Vue HTML generee: ${path.relative(process.cwd(), htmlPath)}`);
  console.log(`Pages observees: ${report.summary.observedPages}`);
  console.log(`Cluster leader: ${report.summary.topCluster}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
