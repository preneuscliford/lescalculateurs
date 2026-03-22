const fs = require("fs");
const path = require("path");
const { collectFiles } = require("./text-file-scopes.cjs");
const { inspectUtf8Buffer } = require("./utf8-quality.cjs");
const { decodeHtmlEntities, extractSeoTextFromHtml, extractVisibleTextFromHtml } = require("./html-text-utils.cjs");
const { normalizeFrenchText } = require("./french-normalization.cjs");

function parseTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim() : "";
}

function buildPublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");

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

  return `/pages/${route}`;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildChecks(content) {
  const lowered = content.toLowerCase();
  const visibleText = extractVisibleTextFromHtml(content);
  const seoText = extractSeoTextFromHtml(content);
  const visibleNormalized = normalizeFrenchText(visibleText);
  const seoNormalized = normalizeFrenchText(seoText);

  return {
    title: parseTitle(content),
    visibleLength: visibleText.length,
    seoLength: seoText.length,
    visibleNormalizationNeeded: visibleText !== visibleNormalized,
    seoNormalizationNeeded: seoText !== seoNormalized,
    hasFaq:
      lowered.includes("faqpage") || lowered.includes("questions frequentes") || lowered.includes("questions fr"),
    hasBreadcrumb:
      lowered.includes("breadcrumblist") || lowered.includes("fil d'ariane") || lowered.includes("fil d"),
    hasMethodology: lowered.includes("methodologie"),
    hasOfficialSource:
      lowered.includes("caf.fr") ||
      lowered.includes("service-public.fr") ||
      lowered.includes("francetravail.fr") ||
      lowered.includes("france-travail.fr") ||
      lowered.includes("notaires.fr"),
    hasSimulatorCta: lowered.includes("simulateur"),
  };
}

function pushPenalty(bucket, label, points) {
  bucket.push({ label, points });
}

function buildSubscores(checks, utf8Issues) {
  const penalties = {
    encoding: [],
    french: [],
    seo: [],
    usefulness: [],
  };

  let encodingScore = 100;
  if (utf8Issues.length > 0) {
    for (const issue of utf8Issues) {
      pushPenalty(penalties.encoding, issue, 35);
    }
    encodingScore -= 35 * utf8Issues.length;
  }

  let frenchScore = 100;
  if (checks.visibleNormalizationNeeded) {
    pushPenalty(penalties.french, "texte visible encore normalisable", 25);
    frenchScore -= 25;
  }
  if (checks.seoNormalizationNeeded) {
    pushPenalty(penalties.french, "texte SEO encore normalisable", 15);
    frenchScore -= 15;
  }

  let seoScore = 100;
  if (!checks.title) {
    pushPenalty(penalties.seo, "title manquant", 20);
    seoScore -= 20;
  }
  if (checks.seoLength < 80) {
    pushPenalty(penalties.seo, "bloc SEO trop court", 10);
    seoScore -= 10;
  }
  if (!checks.hasFaq) {
    pushPenalty(penalties.seo, "FAQ absente", 12);
    seoScore -= 12;
  }
  if (!checks.hasBreadcrumb) {
    pushPenalty(penalties.seo, "breadcrumb absent", 10);
    seoScore -= 10;
  }
  if (!checks.hasMethodology) {
    pushPenalty(penalties.seo, "methodologie absente", 10);
    seoScore -= 10;
  }
  if (!checks.hasOfficialSource) {
    pushPenalty(penalties.seo, "source officielle absente", 8);
    seoScore -= 8;
  }

  let usefulnessScore = 100;
  if (checks.visibleLength < 800) {
    pushPenalty(penalties.usefulness, "contenu visible trop court", 20);
    usefulnessScore -= 20;
  }
  if (!checks.hasSimulatorCta) {
    pushPenalty(penalties.usefulness, "CTA simulateur absent", 12);
    usefulnessScore -= 12;
  }

  const subscores = {
    encoding: clampScore(encodingScore),
    french: clampScore(frenchScore),
    seo: clampScore(seoScore),
    usefulness: clampScore(usefulnessScore),
  };

  const penaltyReasons = [
    ...penalties.encoding,
    ...penalties.french,
    ...penalties.seo,
    ...penalties.usefulness,
  ].sort((a, b) => b.points - a.points);

  const score = clampScore(
    subscores.encoding * 0.3 + subscores.french * 0.3 + subscores.seo * 0.25 + subscores.usefulness * 0.15,
  );

  return {
    subscores,
    penaltyReasons,
    score,
  };
}

function createQualityReport(scope) {
  const files = collectFiles(scope);
  const htmlFiles = files.filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  const report = {
    generatedAt: new Date().toISOString(),
    scope,
    files: [],
    summary: {
      totalFiles: htmlFiles.length,
      minScore: 100,
      avgScore: 0,
      withUtf8Issues: 0,
      withVisibleNormalization: 0,
      withSeoNormalization: 0,
      avgEncodingScore: 0,
      avgFrenchScore: 0,
      avgSeoScore: 0,
      avgUsefulnessScore: 0,
    },
  };

  let totalScore = 0;
  let totalEncoding = 0;
  let totalFrench = 0;
  let totalSeo = 0;
  let totalUsefulness = 0;

  for (const filePath of htmlFiles) {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString("utf8");
    const utf8Issues = inspectUtf8Buffer(buffer);
    const checks = buildChecks(content);
    const scoring = buildSubscores(checks, utf8Issues);
    const relativePath = path.relative(process.cwd(), filePath);

    report.files.push({
      filePath: relativePath,
      url: buildPublicUrl(relativePath),
      score: scoring.score,
      utf8Issues,
      subscores: scoring.subscores,
      penaltyReasons: scoring.penaltyReasons,
      ...checks,
    });

    totalScore += scoring.score;
    totalEncoding += scoring.subscores.encoding;
    totalFrench += scoring.subscores.french;
    totalSeo += scoring.subscores.seo;
    totalUsefulness += scoring.subscores.usefulness;
    report.summary.minScore = Math.min(report.summary.minScore, scoring.score);

    if (utf8Issues.length > 0) report.summary.withUtf8Issues += 1;
    if (checks.visibleNormalizationNeeded) report.summary.withVisibleNormalization += 1;
    if (checks.seoNormalizationNeeded) report.summary.withSeoNormalization += 1;
  }

  if (htmlFiles.length === 0) {
    report.summary.minScore = 0;
  } else {
    report.summary.avgScore = Number((totalScore / htmlFiles.length).toFixed(1));
    report.summary.avgEncodingScore = Number((totalEncoding / htmlFiles.length).toFixed(1));
    report.summary.avgFrenchScore = Number((totalFrench / htmlFiles.length).toFixed(1));
    report.summary.avgSeoScore = Number((totalSeo / htmlFiles.length).toFixed(1));
    report.summary.avgUsefulnessScore = Number((totalUsefulness / htmlFiles.length).toFixed(1));
  }

  report.files.sort((a, b) => a.score - b.score || a.filePath.localeCompare(b.filePath));
  return report;
}

function renderDashboardHtml(report, title) {
  const serialized = JSON.stringify(report).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #102033; }
    .wrap { max-width: 1520px; margin: 0 auto; padding: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0 24px; }
    .card { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    .card strong { display: block; font-size: 1.6rem; margin-top: 4px; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; align-items: center; }
    input, select { border: 1px solid #d4dbea; border-radius: 10px; padding: 10px 12px; background: white; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    th, td { padding: 12px 10px; border-bottom: 1px solid #edf1f7; vertical-align: top; text-align: left; font-size: 14px; }
    th { background: #102033; color: white; position: sticky; top: 0; }
    tr:last-child td { border-bottom: none; }
    .score { font-weight: 700; }
    .bad { color: #b42318; }
    .mid { color: #b54708; }
    .good { color: #027a48; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #eef2ff; margin: 2px 4px 2px 0; font-size: 12px; }
    a { color: #0f52ba; text-decoration: none; }
    .muted { color: #667085; font-size: 12px; margin-top: 4px; }
    .subscores { display: grid; gap: 3px; min-width: 180px; }
    .subscores span { white-space: nowrap; }
    code { word-break: break-word; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${title}</h1>
    <p class="muted">Scope: ${report.scope} - Genere le ${report.generatedAt}</p>
    <div class="cards">
      <div class="card"><span>Pages analysees</span><strong>${report.summary.totalFiles}</strong></div>
      <div class="card"><span>Score global moyen</span><strong>${report.summary.avgScore}/100</strong></div>
      <div class="card"><span>Encodage moyen</span><strong>${report.summary.avgEncodingScore}/100</strong></div>
      <div class="card"><span>Francais moyen</span><strong>${report.summary.avgFrenchScore}/100</strong></div>
      <div class="card"><span>SEO moyen</span><strong>${report.summary.avgSeoScore}/100</strong></div>
      <div class="card"><span>Utilite moyenne</span><strong>${report.summary.avgUsefulnessScore}/100</strong></div>
    </div>
    <div class="toolbar">
      <input id="search" type="search" placeholder="Filtrer par URL ou fichier" />
      <select id="filter">
        <option value="all">Toutes les pages</option>
        <option value="low">Score <= 60</option>
        <option value="visible">Visible a corriger</option>
        <option value="seo">SEO a corriger</option>
        <option value="utf8">UTF-8</option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th>Score global</th>
          <th>Sous-scores</th>
          <th>URL</th>
          <th>Titre</th>
          <th>Fichier</th>
          <th>Motifs</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <script>
    const report = ${serialized};
    const rows = document.getElementById("rows");
    const search = document.getElementById("search");
    const filter = document.getElementById("filter");

    function scoreClass(score) {
      if (score <= 60) return "bad";
      if (score < 80) return "mid";
      return "good";
    }

    function renderPenaltyReasons(item) {
      const pills = [];
      if (item.utf8Issues.length) pills.push('<span class="pill">UTF-8</span>');
      if (item.visibleNormalizationNeeded) pills.push('<span class="pill">Visible</span>');
      if (item.seoNormalizationNeeded) pills.push('<span class="pill">SEO</span>');
      if (!item.hasFaq) pills.push('<span class="pill">FAQ manquante</span>');
      if (!item.hasBreadcrumb) pills.push('<span class="pill">Breadcrumb manquant</span>');
      if (!item.hasMethodology) pills.push('<span class="pill">Methodo manquante</span>');
      if (!item.hasOfficialSource) pills.push('<span class="pill">Sources officielles</span>');
      if (!item.hasSimulatorCta) pills.push('<span class="pill">CTA simulateur</span>');

      const reasons = (item.penaltyReasons || []).slice(0, 4).map((reason) =>
        '<div class="muted">' + reason.label + ' (-' + reason.points + ')</div>'
      ).join('');

      return pills.join('') + reasons;
    }

    function render() {
      const query = search.value.trim().toLowerCase();
      const mode = filter.value;
      const filtered = report.files.filter((item) => {
        const haystack = [item.url || "", item.filePath, item.title || ""].join(" ").toLowerCase();
        if (query && !haystack.includes(query)) return false;
        if (mode === "low" && item.score > 60) return false;
        if (mode === "visible" && !item.visibleNormalizationNeeded) return false;
        if (mode === "seo" && !item.seoNormalizationNeeded) return false;
        if (mode === "utf8" && item.utf8Issues.length === 0) return false;
        return true;
      });

      rows.innerHTML = filtered.map((item) => {
        const urlCell = item.url ? '<a href="' + item.url + '" target="_blank" rel="noreferrer">' + item.url + '</a>' : '<span class="muted">n/a</span>';
        const title = item.title || '<span class="muted">Sans titre</span>';
        const subscores = '<div class="subscores">' +
          '<span>Encodage: <strong>' + item.subscores.encoding + '</strong></span>' +
          '<span>Francais: <strong>' + item.subscores.french + '</strong></span>' +
          '<span>SEO: <strong>' + item.subscores.seo + '</strong></span>' +
          '<span>Utilite: <strong>' + item.subscores.usefulness + '</strong></span>' +
          '</div>';

        return '<tr>' +
          '<td class="score ' + scoreClass(item.score) + '">' + item.score + '</td>' +
          '<td>' + subscores + '</td>' +
          '<td>' + urlCell + '</td>' +
          '<td>' + title + '</td>' +
          '<td><code>' + item.filePath + '</code></td>' +
          '<td>' + renderPenaltyReasons(item) + '</td>' +
          '</tr>';
      }).join('');
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
  </script>
</body>
</html>`;
}

function writeQualityArtifacts(report, baseName, title) {
  const reportDir = path.resolve(process.cwd(), "reports");
  const jsonPath = path.join(reportDir, `${baseName}.json`);
  const htmlPath = path.join(reportDir, `${baseName}.html`);

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(htmlPath, renderDashboardHtml(report, title), "utf8");

  return {
    jsonPath,
    htmlPath,
  };
}

module.exports = {
  createQualityReport,
  writeQualityArtifacts,
};
