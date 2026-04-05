#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

let xlsx;
try {
  xlsx = require("xlsx");
} catch (error) {
  console.error(
    "Le module xlsx est requis pour lire l'export Search Console (.xlsx). Verifiez qu'il est disponible dans node_modules.",
  );
  process.exit(1);
}

const DEFAULT_QUALITY_PATH = "reports/pseo-quality-report.json";
const DEFAULT_TRIAGE_PATH = "reports/languagetool-triage-site.json";
const DEFAULT_OUTPUT_PATH = "reports/cluster-scoring-report.json";
const STOPWORDS = new Set([
  "a",
  "ai",
  "ainsi",
  "alors",
  "apres",
  "au",
  "aucun",
  "aucune",
  "autour",
  "aux",
  "avec",
  "avoir",
  "car",
  "ce",
  "cela",
  "ces",
  "comment",
  "dans",
  "de",
  "des",
  "du",
  "elle",
  "en",
  "encore",
  "est",
  "et",
  "faire",
  "grille",
  "il",
  "je",
  "la",
  "le",
  "les",
  "leur",
  "loyer",
  "ma",
  "mes",
  "mon",
  "montant",
  "nous",
  "ou",
  "où",
  "par",
  "pas",
  "personne",
  "peut",
  "plus",
  "plafond",
  "pour",
  "proche",
  "que",
  "qui",
  "quoi",
  "sa",
  "sans",
  "se",
  "ses",
  "seul",
  "seule",
  "si",
  "son",
  "sur",
  "tes",
  "toi",
  "ton",
  "tous",
  "tout",
  "tres",
  "tu",
  "un",
  "une",
  "vos",
  "votre",
  "2025",
  "2026",
  "2027",
]);

function parseArgs() {
  return new Map(
    process.argv.slice(2).map((arg) => {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }),
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeHeader(value) {
  return normalizeWhitespace(normalizeText(value));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function logScore(value, reference) {
  if (!value || value <= 0) return 0;
  if (!reference || reference <= 0) return 0;
  return clamp((Math.log1p(value) / Math.log1p(reference)) * 100);
}

function positionOpportunityScore(position) {
  const value = Number(position) || 0;
  if (!value) return 0;
  if (value <= 1) return 60;
  if (value <= 3) return 80 + (value - 1) * 10;
  if (value <= 10) return clamp(100 - Math.abs(value - 6) * 8);
  if (value <= 20) return clamp(70 - (value - 10) * 4);
  if (value <= 40) return clamp(30 - (value - 20));
  return 5;
}

function ctrScore(ctr) {
  return clamp(((Number(ctr) || 0) / 0.15) * 100);
}

function languageScore(actionableCount) {
  return clamp(100 - (Number(actionableCount) || 0) * 12);
}

function getMetricValue(row, periodLabel, metricLabel) {
  const keys = Object.keys(row || {});
  const targetPeriod = normalizeHeader(periodLabel);
  const targetMetric = normalizeHeader(metricLabel);
  const key = keys.find((item) => {
    const normalized = normalizeHeader(item);
    return normalized.includes(targetPeriod) && normalized.includes(targetMetric);
  });

  return key ? Number(row[key]) || 0 : 0;
}

function getFirstCellValue(row) {
  const firstKey = Object.keys(row || {})[0];
  return firstKey ? row[firstKey] : "";
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

  if (!route.startsWith("/")) {
    route = `/${route}`;
  }

  return route === "/" ? "/" : route;
}

function buildPublicUrl(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");

  if (normalized === "src/404.html") {
    return "/404";
  }

  if (!normalized.startsWith("src/pages/")) {
    return null;
  }

  let route = normalized.slice("src/pages/".length);
  if (route.endsWith("/index.html")) {
    route = route.slice(0, -"/index.html".length);
  } else if (route.endsWith(".html")) {
    route = route.slice(0, -".html".length);
  }

  return normalizeRoute(`/pages/${route}`);
}

function collectCandidateWorkbooks() {
  const candidates = [];
  const roots = [process.cwd(), path.join(os.homedir(), "Downloads")];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!/performance-on-search/i.test(entry.name) || !entry.name.endsWith(".xlsx")) continue;

      const filePath = path.join(root, entry.name);
      const stats = fs.statSync(filePath);
      candidates.push({
        filePath,
        mtimeMs: stats.mtimeMs,
      });
    }
  }

  return candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function resolveWorkbookPath(inputPath) {
  if (inputPath) {
    const absolute = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Fichier introuvable: ${absolute}`);
    }
    return absolute;
  }

  const candidates = collectCandidateWorkbooks();
  if (candidates.length === 0) {
    throw new Error(
      "Aucun export Search Console .xlsx trouve. Utilisez --input=CHEMIN/VERS/export.xlsx",
    );
  }

  return candidates[0].filePath;
}

function readWorkbook(workbookPath) {
  const workbook = xlsx.readFile(workbookPath);
  const readSheet = (name) =>
    workbook.SheetNames.includes(name)
      ? xlsx.utils.sheet_to_json(workbook.Sheets[name], { defval: null })
      : [];

  return {
    sheets: workbook.SheetNames,
    queries: readSheet("Requêtes"),
    pages: readSheet("Pages"),
    filters: readSheet("Filtres"),
  };
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length >= 3 && !STOPWORDS.has(token));
}

function deriveClusterIdentity(queryRows, filters) {
  const tokenStats = new Map();
  const queryCount = queryRows.length || 1;

  for (const row of queryRows) {
    const query = String(getFirstCellValue(row) || "");
    const impressions = getMetricValue(row, "les 28 derniers jours", "impressions") || 1;
    const tokens = Array.from(new Set(tokenize(query)));

    for (const token of tokens) {
      const current = tokenStats.get(token) || { frequency: 0, weighted: 0 };
      current.frequency += 1;
      current.weighted += impressions;
      tokenStats.set(token, current);
    }
  }

  const anchorTokens = Array.from(tokenStats.entries())
    .filter(([, stats]) => stats.frequency >= Math.max(2, Math.ceil(queryCount * 0.2)))
    .sort((a, b) => b[1].weighted - a[1].weighted || a[0].localeCompare(b[0], "fr"))
    .slice(0, 3)
    .map(([token]) => token);

  const matchingTokens = anchorTokens.slice(0, Math.min(2, anchorTokens.length));
  const filterQuery = filters.find((row) => normalizeHeader(row.Filtre) === "requete");
  const filterValue = filterQuery ? String(filterQuery.Valeur || "") : "";
  const filterPatterns = filterValue
    .replace(/^\+?\^\(/, "")
    .replace(/\)\$$/, "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    anchorTokens,
    matchingTokens,
    clusterLabel: anchorTokens.length > 0 ? anchorTokens.join(" + ") : "cluster non determine",
    filterValue,
    filterPatterns,
  };
}

function loadJson(filePath) {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`JSON introuvable: ${absolute}`);
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
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

function buildQualityIndex(qualityReport) {
  const byUrl = new Map();

  for (const item of qualityReport.files || []) {
    if (!item.url) continue;
    const route = normalizeRoute(item.url);
    if (!route) continue;

    const existing = byUrl.get(route);
    if (!existing || (Number(item.score) || 0) >= (Number(existing.score) || 0)) {
      byUrl.set(route, {
        url: route,
        score: Number(item.score) || 0,
        title: item.title || "",
        filePath: item.filePath || "",
        subscores: item.subscores || {},
        visibleLength: Number(item.visibleLength) || 0,
        hasFaq: Boolean(item.hasFaq),
        hasBreadcrumb: Boolean(item.hasBreadcrumb),
        hasMethodology: Boolean(item.hasMethodology),
        hasOfficialSource: Boolean(item.hasOfficialSource),
      });
    }
  }

  return byUrl;
}

function buildTriageIndex(triageReport) {
  const byUrl = new Map();

  for (const item of triageReport.actionableFiles || []) {
    const route = buildPublicUrl(item.filePath);
    if (!route) continue;

    const current = byUrl.get(route) || 0;
    byUrl.set(route, Math.max(current, Number(item.actionableCount) || 0));
  }

  return byUrl;
}

function routeMatchesCluster(route, title, tokens) {
  if (!tokens || tokens.length === 0) return false;
  const haystack = normalizeText(`${route || ""} ${title || ""}`);
  return tokens.every((token) => haystack.includes(token));
}

function computePagePerformance(page) {
  const clicks = Number(page.clicks) || 0;
  const impressions = Number(page.impressions) || 0;
  const ctr = Number(page.ctr) || 0;
  const position = Number(page.position) || 0;

  const impressionsScore = logScore(impressions, 500);
  const clicksScore = logScore(clicks, 50);
  const ctrValue = ctrScore(ctr);
  const positionScore = positionOpportunityScore(position);
  const performanceScore = clamp(
    impressionsScore * 0.35 + clicksScore * 0.3 + ctrValue * 0.2 + positionScore * 0.15,
  );

  return {
    impressionsScore: round(impressionsScore),
    clicksScore: round(clicksScore),
    ctrScore: round(ctrValue),
    positionScore: round(positionScore),
    performanceScore: round(performanceScore),
  };
}

function computeReadiness(qualityScore, actionableCount) {
  const ltScore = languageScore(actionableCount);
  const readinessScore = clamp((Number(qualityScore) || 0) * 0.7 + ltScore * 0.3);

  return {
    ltScore: round(ltScore),
    readinessScore: round(readinessScore),
  };
}

function computeActionMode(summary) {
  if (summary.avgQualityScore < 90 || summary.avgLanguageScore < 85) {
    return "fiabiliser-avant-expansion";
  }

  if (summary.clusterScore >= 70 && summary.avgPosition >= 3 && summary.avgPosition <= 10) {
    return "scale-now";
  }

  if (summary.clusterScore >= 55) {
    return "renforcer-puis-etendre";
  }

  return "observer-et-tester";
}

function buildRecommendations(summary, trackedPages, expansionCandidates) {
  const recommendations = [];

  if (summary.totalClicks > 0 && summary.avgPosition >= 3 && summary.avgPosition <= 10) {
    recommendations.push(
      "Le cluster est deja valide par Google: gardez les pages qui performent comme pages seed et poussez leur maillage interne.",
    );
  }

  if (expansionCandidates.length > 0) {
    recommendations.push(
      `Vous avez ${expansionCandidates.length} page(s) deja prêtes dans le meme noeud lexical sans traction visible sur cet export: elles doivent etre poussees en priorite avant de creer des variantes plus lointaines.`,
    );
  }

  const bestTracked = trackedPages
    .filter((item) => item.priorityScore >= 60)
    .sort((a, b) => b.priorityScore - a.priorityScore)[0];

  if (bestTracked) {
    recommendations.push(
      `La page la plus exploitable du cluster est ${bestTracked.route} avec un priority score de ${bestTracked.priorityScore}/100.`,
    );
  }

  if (summary.avgQualityScore >= 95 && summary.avgLanguageScore >= 95) {
    recommendations.push(
      "Le frein principal n'est pas la qualite des pages mais le volume de maillage, d'ancrages et de variantes proches publiees autour du meme cluster.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Le cluster est encore trop faible pour une expansion agressive sans phase de test complementaire.");
  }

  return recommendations;
}

function renderHtml(report) {
  const trackedRows = report.trackedPages
    .map(
      (item) => `<tr>
  <td><a href="https://www.lescalculateurs.fr${item.route}" target="_blank" rel="noreferrer">${item.route}</a></td>
  <td><strong>${item.priorityScore}</strong></td>
  <td>${item.clicks}</td>
  <td>${item.impressions}</td>
  <td>${round(item.ctr * 100, 2)}%</td>
  <td>${round(item.position, 2)}</td>
  <td>${item.qualityScore}</td>
  <td>${item.actionableCount}</td>
</tr>`,
    )
    .join("");

  const candidateRows = report.expansionCandidates
    .map(
      (item) => `<tr>
  <td><a href="https://www.lescalculateurs.fr${item.route}" target="_blank" rel="noreferrer">${item.route}</a></td>
  <td><strong>${item.expansionScore}</strong></td>
  <td>${item.qualityScore}</td>
  <td>${item.actionableCount}</td>
  <td>${item.reason}</td>
</tr>`,
    )
    .join("");

  const recommendations = report.recommendations.map((item) => `<li>${item}</li>`).join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cluster scoring pSEO</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f5f7fb; color: #142033; }
    .wrap { max-width: 1360px; margin: 0 auto; padding: 24px; }
    .hero { background: linear-gradient(135deg, #0f172a, #123c6b); color: white; padding: 24px; border-radius: 18px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2); }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0 24px; }
    .card, .panel { background: white; border-radius: 16px; padding: 18px; box-shadow: 0 10px 28px rgba(20, 32, 51, 0.08); }
    .card strong { display: block; font-size: 1.7rem; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e8eef7; padding: 10px 8px; text-align: left; font-size: 14px; vertical-align: top; }
    th { color: #42526b; font-weight: 700; }
    a { color: #0b5bd3; text-decoration: none; }
    ul { margin: 0; padding-left: 18px; }
    code { background: #eef2ff; padding: 2px 6px; border-radius: 6px; }
    .muted { color: #667085; }
    @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <div class="muted">Rapport genere le ${report.generatedAt}</div>
      <h1>Cluster ${report.cluster.clusterLabel}</h1>
      <p>Mode recommande: <strong>${report.summary.actionMode}</strong>. Score cluster: <strong>${report.summary.clusterScore}/100</strong>.</p>
      <p>Source Search Console: <code>${report.input.workbookPath}</code></p>
    </section>

    <section class="cards">
      <div class="card"><span>Clics cluster</span><strong>${report.summary.totalClicks}</strong></div>
      <div class="card"><span>Impressions cluster</span><strong>${report.summary.totalImpressions}</strong></div>
      <div class="card"><span>CTR moyen</span><strong>${round(report.summary.avgCtr * 100, 2)}%</strong></div>
      <div class="card"><span>Position moyenne</span><strong>${round(report.summary.avgPosition, 2)}</strong></div>
      <div class="card"><span>Qualite moyenne</span><strong>${report.summary.avgQualityScore}/100</strong></div>
      <div class="card"><span>Langue moyenne</span><strong>${report.summary.avgLanguageScore}/100</strong></div>
    </section>

    <section class="grid">
      <div class="panel">
        <h2>Pages trackees</h2>
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Priority</th>
              <th>Clics</th>
              <th>Impr.</th>
              <th>CTR</th>
              <th>Pos.</th>
              <th>Qualite</th>
              <th>LT</th>
            </tr>
          </thead>
          <tbody>${trackedRows || '<tr><td colspan="8" class="muted">Aucune page trackee</td></tr>'}</tbody>
        </table>
      </div>
      <div class="panel">
        <h2>Recommandations</h2>
        <ul>${recommendations}</ul>
        <p class="muted">Tokens moteurs: <code>${report.cluster.matchingTokens.join(", ") || "n/a"}</code></p>
      </div>
    </section>

    <section class="panel" style="margin-top: 18px;">
      <h2>Pages a pousser sans attendre</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Expansion score</th>
            <th>Qualite</th>
            <th>LT</th>
            <th>Pourquoi</th>
          </tr>
        </thead>
        <tbody>${candidateRows || '<tr><td colspan="5" class="muted">Aucune page prete supplementaire detectee</td></tr>'}</tbody>
      </table>
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

  const workbook = readWorkbook(workbookPath);
  const qualityReport = loadJson(qualityPath);
  const triageReport = loadJson(triagePath);
  const qualityByUrl = buildQualityIndex(qualityReport);
  const triageByUrl = buildTriageIndex(triageReport);
  const cluster = deriveClusterIdentity(workbook.queries, workbook.filters);

  const trackedPages = uniqueBy(
    workbook.pages.map((row) => {
      const rawUrl = String(getFirstCellValue(row) || "");
      const route = normalizeRoute(rawUrl);
      const quality = qualityByUrl.get(route) || {};
      const actionableCount = triageByUrl.get(route) || 0;
      const metrics = {
        clicks: getMetricValue(row, "les 28 derniers jours", "clics"),
        impressions: getMetricValue(row, "les 28 derniers jours", "impressions"),
        ctr: getMetricValue(row, "les 28 derniers jours", "ctr"),
        position: getMetricValue(row, "les 28 derniers jours", "position"),
      };
      const performance = computePagePerformance(metrics);
      const readiness = computeReadiness(quality.score || 0, actionableCount);
      const priorityScore = round(performance.performanceScore * 0.65 + readiness.readinessScore * 0.35);

      return {
        route,
        title: quality.title || rawUrl,
        qualityScore: quality.score || 0,
        actionableCount,
        ...metrics,
        ...performance,
        ...readiness,
        priorityScore,
      };
    }),
    (item) => item.route,
  )
    .filter((item) => item.route)
    .sort((a, b) => b.priorityScore - a.priorityScore || b.impressions - a.impressions);

  const candidatePages = Array.from(qualityByUrl.values())
    .filter((item) => routeMatchesCluster(item.url, item.title, cluster.matchingTokens))
    .map((item) => {
      const actionableCount = triageByUrl.get(item.url) || 0;
      const readiness = computeReadiness(item.score || 0, actionableCount);
      return {
        route: item.url,
        title: item.title,
        qualityScore: item.score || 0,
        actionableCount,
        ltScore: readiness.ltScore,
        readinessScore: readiness.readinessScore,
      };
    })
    .sort((a, b) => b.readinessScore - a.readinessScore || a.route.localeCompare(b.route, "fr"));

  const trackedRoutes = new Set(trackedPages.map((item) => item.route));
  const demandScore = round(
    logScore(
      trackedPages.reduce((sum, item) => sum + item.impressions, 0),
      1000,
    ) *
      0.55 +
      logScore(
        trackedPages.reduce((sum, item) => sum + item.clicks, 0),
        100,
      ) *
        0.45,
  );

  const expansionCandidates = candidatePages
    .filter((item) => !trackedRoutes.has(item.route))
    .map((item) => ({
      ...item,
      expansionScore: round(item.readinessScore * 0.55 + demandScore * 0.45),
      reason: "page deja publiee et qualifiee, mais absente des pages qui remontent dans cet export",
    }))
    .sort((a, b) => b.expansionScore - a.expansionScore || a.route.localeCompare(b.route, "fr"));

  const totalClicks = trackedPages.reduce((sum, item) => sum + item.clicks, 0);
  const totalImpressions = trackedPages.reduce((sum, item) => sum + item.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    totalImpressions > 0
      ? trackedPages.reduce((sum, item) => sum + item.position * item.impressions, 0) / totalImpressions
      : 0;
  const avgQualityScore =
    candidatePages.length > 0
      ? candidatePages.reduce((sum, item) => sum + item.qualityScore, 0) / candidatePages.length
      : 0;
  const avgLanguageScore =
    candidatePages.length > 0
      ? candidatePages.reduce((sum, item) => sum + item.ltScore, 0) / candidatePages.length
      : 0;
  const coverageScore =
    candidatePages.length > 0 ? clamp((trackedPages.length / candidatePages.length) * 100) : 0;
  const clusterScore = round(
    demandScore * 0.35 +
      positionOpportunityScore(avgPosition) * 0.2 +
      avgQualityScore * 0.2 +
      avgLanguageScore * 0.15 +
      coverageScore * 0.1,
  );

  const summary = {
    totalQueries: workbook.queries.length,
    totalTrackedPages: trackedPages.length,
    totalClusterCandidates: candidatePages.length,
    totalClicks,
    totalImpressions,
    avgCtr: round(avgCtr, 4),
    avgPosition: round(avgPosition, 2),
    avgQualityScore: round(avgQualityScore),
    avgLanguageScore: round(avgLanguageScore),
    demandScore,
    rankingScore: round(positionOpportunityScore(avgPosition)),
    coverageScore: round(coverageScore),
    clusterScore,
  };

  summary.actionMode = computeActionMode(summary);

  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      workbookPath,
      sheets: workbook.sheets,
      qualityPath: path.resolve(process.cwd(), qualityPath),
      triagePath: path.resolve(process.cwd(), triagePath),
    },
    cluster,
    scoringSystem: {
      clusterScore:
        "35% demande (impressions+clics), 20% headroom de position, 20% qualite pSEO, 15% proprete LanguageTool, 10% couverture du cluster",
      priorityScore:
        "65% performance Search Console de la page, 35% readiness (qualite pSEO + proprete redactionnelle)",
      expansionScore:
        "55% readiness de la page deja publiee, 45% force du cluster observe dans Search Console",
    },
    summary,
    trackedQueries: workbook.queries.map((row) => ({
      query: String(getFirstCellValue(row) || ""),
      clicks: getMetricValue(row, "les 28 derniers jours", "clics"),
      impressions: getMetricValue(row, "les 28 derniers jours", "impressions"),
      ctr: getMetricValue(row, "les 28 derniers jours", "ctr"),
      position: getMetricValue(row, "les 28 derniers jours", "position"),
    })),
    trackedPages,
    expansionCandidates,
  };

  report.recommendations = buildRecommendations(summary, trackedPages, expansionCandidates);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(htmlPath, renderHtml(report), "utf8");

  console.log(`Cluster detecte: ${cluster.clusterLabel}`);
  console.log(`Score cluster: ${summary.clusterScore}/100`);
  console.log(`Mode recommande: ${summary.actionMode}`);
  console.log(`JSON genere: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`HTML genere: ${path.relative(process.cwd(), htmlPath)}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
