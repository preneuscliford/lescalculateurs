#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseArgs() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  if (!inputArg) {
    throw new Error("--input=... requis");
  }

  return {
    input: inputArg.split("=").slice(1).join("="),
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(report) {
  const rows = report.candidates
    .map(
      (candidate) => `<tr>
        <td><a href="${escapeHtml(candidate.url)}">${escapeHtml(candidate.pathname)}</a><div class="muted">${escapeHtml(candidate.filePath || "introuvable")}</div></td>
        <td>${escapeHtml(candidate.pageType)}</td>
        <td>${escapeHtml(candidate.title)}</td>
        <td>${escapeHtml(candidate.meta)}</td>
        <td>${escapeHtml(candidate.snippetAnswer)}</td>
        <td>${escapeHtml(candidate.aboveTheFoldIntro)}</td>
        <td>${escapeHtml(candidate.cta)}</td>
        <td>${candidate.notes.map((note) => `<div>${escapeHtml(note)}</div>`).join("")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Search Console safe apply candidates</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #102033; }
    .wrap { max-width: 1600px; margin: 0 auto; padding: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0 24px; }
    .card { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    th, td { padding: 12px 10px; border-bottom: 1px solid #edf1f7; vertical-align: top; text-align: left; font-size: 14px; }
    th { background: #102033; color: white; }
    .muted { color: #667085; font-size: 12px; }
    a { color: #0f52ba; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Search Console safe apply candidates</h1>
    <div class="cards">
      <div class="card"><div>Source</div><strong>${escapeHtml(report.input)}</strong></div>
      <div class="card"><div>Candidats</div><strong>${report.summary.totalCandidates}</strong></div>
      <div class="card"><div>Pages</div><strong>${report.summary.filesWithCandidates}</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Type</th>
          <th>Title</th>
          <th>Meta</th>
          <th>Snippet</th>
          <th>Intro</th>
          <th>CTA</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

function main() {
  const { input } = parseArgs();
  const inputPath = path.resolve(process.cwd(), input);
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const candidates = [];

  for (const page of raw.pages || []) {
    if (page.recommendations?.error) continue;
    if (!page.recommendations?.safe_apply_candidates) continue;

    candidates.push({
      pathname: page.pathname,
      url: page.url,
      filePath: page.filePath,
      pageType: page.pageType || page.recommendations.pageType || "unknown",
      title: page.recommendations.safe_apply_candidates.title,
      meta: page.recommendations.safe_apply_candidates.meta,
      snippetAnswer: page.recommendations.safe_apply_candidates.snippet_answer,
      aboveTheFoldIntro: page.recommendations.safe_apply_candidates.above_the_fold_intro,
      cta: page.recommendations.safe_apply_candidates.cta,
      notes: page.recommendations.safe_apply_candidates.notes || [],
      priorityScore: page.priorityScore || 0,
    });
  }

  candidates.sort((a, b) => b.priorityScore - a.priorityScore);

  const report = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), inputPath),
    summary: {
      totalCandidates: candidates.length,
      filesWithCandidates: new Set(candidates.map((item) => item.filePath)).size,
    },
    candidates,
  };

  const baseName = path
    .basename(inputPath, ".json")
    .replace(/^search-console-openai-reco/, "search-console-openai-safe-candidates");
  const reportsDir = path.resolve(process.cwd(), "reports");
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const htmlPath = path.join(reportsDir, `${baseName}.html`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(htmlPath, renderHtml(report), "utf8");

  console.log(`Rapport safe candidates genere : ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Vue HTML generee : ${path.relative(process.cwd(), htmlPath)}`);
  console.log(`${report.summary.totalCandidates} candidat(s) sur ${report.summary.filesWithCandidates} page(s)`);
}

main();
