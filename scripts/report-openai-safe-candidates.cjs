#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { buildPublicUrl, isSafeIssue, sortCandidates } = require("./lib/openai-french-safe-utils.cjs");

function parseArgs() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  if (!inputArg) {
    throw new Error("--input=... requis");
  }

  return {
    input: inputArg.split("=").slice(1).join("="),
  };
}

function renderHtml(report) {
  const rows = report.candidates
    .map(
      (candidate) => `<tr>
        <td><a href="${escapeHtml(candidate.url || "#")}">${escapeHtml(candidate.url || candidate.filePath)}</a><div class="muted">${escapeHtml(candidate.filePath)}</div></td>
        <td>${escapeHtml(candidate.category)}</td>
        <td><code>${escapeHtml(candidate.original)}</code></td>
        <td><code>${escapeHtml(candidate.corrected)}</code></td>
        <td>${escapeHtml(candidate.reason)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Safe candidates OpenAI</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #102033; }
    .wrap { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0 24px; }
    .card { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    th, td { padding: 12px 10px; border-bottom: 1px solid #edf1f7; vertical-align: top; text-align: left; font-size: 14px; }
    th { background: #102033; color: white; }
    .muted { color: #667085; font-size: 12px; }
    a { color: #0f52ba; text-decoration: none; }
    code { word-break: break-word; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Safe candidates OpenAI</h1>
    <div class="cards">
      <div class="card"><div>Source</div><strong>${escapeHtml(report.input)}</strong></div>
      <div class="card"><div>Candidats sûrs</div><strong>${report.summary.totalCandidates}</strong></div>
      <div class="card"><div>Pages touchees</div><strong>${report.summary.filesWithCandidates}</strong></div>
    </div>
    <table>
      <thead>
        <tr><th>Page</th><th>Categorie</th><th>Original</th><th>Corrige</th><th>Raison</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const { input } = parseArgs();
  const inputPath = path.resolve(process.cwd(), input);
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const candidates = [];

  for (const file of raw.files || []) {
    for (const issue of file.issues || []) {
      if (!isSafeIssue(issue)) {
        continue;
      }

      candidates.push({
        filePath: file.filePath,
        url: file.url || buildPublicUrl(file.filePath),
        category: issue.category,
        original: issue.original,
        corrected: issue.corrected,
        reason: issue.reason,
      });
    }
  }

  const sorted = sortCandidates(candidates);
  const report = {
    generatedAt: new Date().toISOString(),
    input: path.relative(process.cwd(), inputPath),
    summary: {
      totalCandidates: sorted.length,
      filesWithCandidates: new Set(sorted.map((item) => item.filePath)).size,
    },
    candidates: sorted,
  };

  const baseName = path.basename(inputPath, ".json").replace(/^openai-french-review-/, "openai-safe-candidates-");
  const reportsDir = path.resolve(process.cwd(), "reports");
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const htmlPath = path.join(reportsDir, `${baseName}.html`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(htmlPath, renderHtml(report), "utf8");

  console.log(`Rapport safe candidates genere : ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Vue HTML generee : ${path.relative(process.cwd(), htmlPath)}`);
  console.log(`${report.summary.totalCandidates} correction(s) sures sur ${report.summary.filesWithCandidates} fichier(s)`);
}

main();
