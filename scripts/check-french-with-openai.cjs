#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { extractSeoTextFromHtml, extractVisibleTextFromHtml } = require("./lib/html-text-utils.cjs");
const { loadIgnoreRules } = require("./lib/languagetool-ignore-rules.cjs");
const { loadEnvFile } = require("./lib/load-env.cjs");
const { isSafeIssue } = require("./lib/openai-french-safe-utils.cjs");

loadEnvFile();

const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-nano";
const MAX_TEXT_LENGTH = 12000;

function parseArgs() {
  const args = process.argv.slice(2);
  const findArg = (name, fallback) => {
    const match = args.find((arg) => arg.startsWith(`--${name}=`));
    return match ? match.split("=").slice(1).join("=") : fallback;
  };

  return {
    scope: findArg("scope", "french-pilot-20"),
    mode: findArg("mode", "visible"),
    limit: Number.parseInt(findArg("limit", "20"), 10) || 20,
    maxIssues: Number.parseInt(findArg("max-issues", "12"), 10) || 12,
    output: findArg("output", ""),
    indexOnly: args.includes("--index-only"),
    failOnFindings: args.includes("--fail-on-findings"),
  };
}

function ensureApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant. Definis la variable d'environnement avant de lancer ce script.");
  }

  return apiKey;
}

function collectIgnoredTokens() {
  const rules = loadIgnoreRules();
  const tokens = new Set();

  for (const rule of rules) {
    for (const token of rule.matchedTextIn || []) {
      if (typeof token === "string" && token.trim()) {
        tokens.add(token.trim());
      }
    }
  }

  return Array.from(tokens).sort((a, b) => a.localeCompare(b));
}

function getTextForMode(raw, filePath, mode) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".html") {
    return raw;
  }

  if (mode === "seo") {
    return extractSeoTextFromHtml(raw);
  }

  return extractVisibleTextFromHtml(raw);
}

function buildSchema(maxIssues) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      issues: {
        type: "array",
        maxItems: maxIssues,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            excerpt: { type: "string" },
            original: { type: "string" },
            corrected: { type: "string" },
            reason: { type: "string" },
            category: {
              type: "string",
              enum: ["accent", "ponctuation", "apostrophe", "espacement", "encodage", "grammaire", "orthographe"],
            },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
            safe_to_apply: { type: "boolean" },
          },
          required: ["excerpt", "original", "corrected", "reason", "category", "confidence", "safe_to_apply"],
        },
      },
    },
    required: ["summary", "issues"],
  };
}

function buildPrompt(filePath, text, mode, maxIssues) {
  const ignoredTokens = collectIgnoredTokens();
  const ignoredList = ignoredTokens.length > 0 ? ignoredTokens.join(", ") : "aucun";

  return [
    {
      role: "system",
      content: [
        "Tu es un correcteur de francais tres prudent pour un site web YMYL.",
        "Ta mission: detecter uniquement les erreurs evidentes de francais dans le texte fourni.",
        "Ne corrige pas le style si la phrase est deja acceptable.",
        "N'invente rien et ne reecris pas le texte complet.",
        "Ne propose que des remplacements locaux et litteraux sur un fragment court.",
        "N'ajoute pas de mots nouveaux si tu ne peux pas les deduire avec certitude absolue du fragment.",
        "Si un passage est ambigu, incomplet ou trop casse pour une correction sure, ignore-le.",
        "Ne propose pas de preferences typographiques optionnelles.",
        "Ne propose pas d'ameliorations de style, de reformulation, ni de ponctuation facultative.",
        "Si la correction consiste seulement a remettre un accent, une apostrophe, un espace manquant, une ponctuation manifestement cassee ou un texte mojibake, alors elle est acceptable.",
        "Si la correction change le sens, ajoute un mot, ou reconstruit une phrase complete, alors elle n'est pas acceptable.",
        "Ignore les noms de marque, domaines, acronymes metier et tokens suivants s'ils sont correctement utilises :",
        ignoredList,
        "Ignore aussi les preferences editoriales comme l'usage des chiffres plutot que des lettres.",
        "Si un fragment est surtout casse par l'encodage ou des entites HTML mal rendues, tu peux proposer une correction.",
        `Retourne au maximum ${maxIssues} problemes vraiment actionnables.`,
      ].join(" "),
    },
    {
      role: "user",
      content: [
        `Fichier : ${filePath}`,
        `Mode : ${mode}`,
        "",
        "Analyse ce texte et retourne seulement des corrections sures :",
        text,
      ].join("\n"),
    },
  ];
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const chunks = [];
  for (const item of payload?.output || []) {
    if (item?.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }

    for (const part of item.content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("").trim();
}

async function callOpenAI(apiKey, filePath, text, mode, maxIssues) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      store: false,
      reasoning: {
        effort: "low",
      },
      input: buildPrompt(filePath, text, mode, maxIssues),
      text: {
        format: {
          type: "json_schema",
          name: "french_review",
          schema: buildSchema(maxIssues),
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);

  if (!outputText) {
    throw new Error("Reponse OpenAI vide");
  }

  return JSON.parse(outputText);
}

function buildBaseName(scope, mode) {
  return `openai-french-review-${scope.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-${mode}`;
}

function renderHtmlReport(report) {
  const rows = report.files
    .map((file) => {
      const issues = file.issues
        .map(
          (issue) =>
            `<li><strong>${escapeHtml(issue.category)}</strong> <span class="${issue.safe_to_apply ? "badge safe" : "badge review"}">${issue.safe_to_apply ? "safe" : "manuel"}</span> - ${escapeHtml(issue.original)} => ${escapeHtml(issue.corrected)}<br><span class="muted">${escapeHtml(issue.reason)} (${escapeHtml(issue.confidence)})</span></li>`,
        )
        .join("");

      return `<tr>
        <td><a href="${escapeHtml(file.url || "#")}">${escapeHtml(file.url || file.filePath)}</a><div class="muted">${escapeHtml(file.filePath)}</div></td>
        <td>${escapeHtml(file.summary || "")}</td>
        <td>${file.issues.length}<div class="muted">${file.safeIssuesCount} safe</div></td>
        <td><ul>${issues}</ul></td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rapport OpenAI - ${escapeHtml(report.scope)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #f6f8fb; color: #102033; }
    .wrap { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 18px 0 24px; }
    .card { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(16,32,51,.08); }
    th, td { padding: 12px 10px; border-bottom: 1px solid #edf1f7; vertical-align: top; text-align: left; font-size: 14px; }
    th { background: #102033; color: white; }
    .muted { color: #667085; font-size: 12px; }
    .badge { display: inline-block; margin-left: 6px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge.safe { background: #dcfae6; color: #166534; }
    .badge.review { background: #fff4cc; color: #8a5b00; }
    ul { margin: 0; padding-left: 18px; }
    a { color: #0f52ba; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Rapport OpenAI - ${escapeHtml(report.scope)}</h1>
    <div class="cards">
      <div class="card"><div>Mode</div><strong>${escapeHtml(report.mode)}</strong></div>
      <div class="card"><div>Fichiers analyses</div><strong>${report.summary.totalFiles}</strong></div>
      <div class="card"><div>Fichiers avec alertes</div><strong>${report.summary.filesWithIssues}</strong></div>
      <div class="card"><div>Alertes totales</div><strong>${report.summary.totalIssues}</strong></div>
      <div class="card"><div>Alertes safe</div><strong>${report.summary.totalSafeIssues}</strong></div>
    </div>
    <table>
      <thead>
        <tr><th>Page</th><th>Resume</th><th>Alertes</th><th>Details</th></tr>
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

function buildPublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
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

function normalizeCompare(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function main() {
  const apiKey = ensureApiKey();
  const { scope, mode, limit, maxIssues, output, indexOnly, failOnFindings } = parseArgs();
  const files = collectLanguageToolFiles(scope)
    .filter((filePath) => !indexOnly || filePath.replace(/\\/g, "/").endsWith("/index.html"))
    .slice(0, limit);
  const report = {
    generatedAt: new Date().toISOString(),
    scope,
    mode,
    model: OPENAI_MODEL,
    files: [],
    summary: {
      totalFiles: files.length,
      filesWithIssues: 0,
      totalIssues: 0,
      filesWithSafeIssues: 0,
      totalSafeIssues: 0,
    },
  };

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const text = getTextForMode(raw, filePath, mode).replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
    if (!text || text.length < 80) {
      continue;
    }

    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`Analyse OpenAI : ${relativePath}`);
    const result = await callOpenAI(apiKey, relativePath, text, mode, maxIssues);
    const issues = Array.isArray(result.issues)
      ? result.issues.filter((issue) => {
          if (!issue || !issue.original || !issue.corrected) {
            return false;
          }

          return normalizeCompare(issue.original) !== normalizeCompare(issue.corrected);
        })
      : [];
    const safeIssuesCount = issues.filter((issue) => isSafeIssue(issue)).length;

    report.files.push({
      filePath: relativePath,
      url: buildPublicUrl(relativePath),
      summary: result.summary || "",
      issues,
      safeIssuesCount,
    });

    if (issues.length > 0) {
      report.summary.filesWithIssues += 1;
      report.summary.totalIssues += issues.length;
    }

    if (safeIssuesCount > 0) {
      report.summary.filesWithSafeIssues += 1;
      report.summary.totalSafeIssues += safeIssuesCount;
    }
  }

  const baseName = output || buildBaseName(scope, mode);
  const reportsDir = path.resolve(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const htmlPath = path.join(reportsDir, `${baseName}.html`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(htmlPath, renderHtmlReport(report), "utf8");

  console.log(`Rapport OpenAI genere : ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Vue HTML generee : ${path.relative(process.cwd(), htmlPath)}`);
  console.log(
    `OpenAI ${OPENAI_MODEL} - ${report.summary.filesWithIssues}/${report.summary.totalFiles} fichier(s) avec alertes, ${report.summary.totalIssues} correction(s) au total, ${report.summary.totalSafeIssues} safe`,
  );

  if (failOnFindings && report.summary.totalIssues > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`OpenAI French review indisponible : ${error.message}`);
  process.exit(1);
});
