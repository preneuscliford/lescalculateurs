#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { extractVisibleTextFromHtml } = require("./lib/html-text-utils.cjs");
const { findIgnoreRule } = require("./lib/languagetool-ignore-rules.cjs");

const DEFAULT_LT_URL = process.env.LANGUAGETOOL_API_URL || "https://api.languagetool.org/v2/check";
const LT_LANG = process.env.LANGUAGETOOL_LANGUAGE || "fr";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const STYLE_MESSAGE_SNIPPETS = [
  "point d'interrogation",
  "point d’exclamation",
  "point d'interrogation ou d'exclamation",
  "espace fine",
  "espace insécable",
  "deux-points",
  "virgule",
  "majuscule",
  "minuscules",
  "acronyme",
  "tiret",
  "répété",
  "répétition",
  "apparaît déjà",
  "apparaît",
  "flèche ou le symbole",
];
const STYLE_ISSUE_TYPES = new Set(["style", "typographical"]);

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "site-rendered",
    output: outputArg
      ? outputArg.split("=")[1]
      : "reports/languagetool-triage-site.json",
  };
}

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getMatchedText(text, match) {
  if (!text || typeof match?.offset !== "number" || typeof match?.length !== "number") {
    return "";
  }

  return normalizeValue(text.slice(match.offset, match.offset + match.length));
}

function getPrimaryReplacement(match) {
  return normalizeValue(match?.replacements?.[0]?.value || "");
}

function isCaseOnlySuggestion(matchedText, replacement) {
  if (!matchedText || !replacement) {
    return false;
  }

  return matchedText.localeCompare(replacement, "fr", { sensitivity: "accent" }) === 0;
}

function looksLikeStyleIssue(match, matchedText, replacement) {
  const message = normalizeValue(match?.message || "").toLowerCase();
  const issueType = normalizeValue(match?.rule?.issueType || "").toLowerCase();

  if (STYLE_ISSUE_TYPES.has(issueType)) {
    return true;
  }

  if (STYLE_MESSAGE_SNIPPETS.some((snippet) => message.includes(snippet))) {
    return true;
  }

  if (isCaseOnlySuggestion(matchedText, replacement)) {
    return true;
  }

  return false;
}

async function checkText(text) {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const body = new URLSearchParams({
      language: LT_LANG,
      text,
      enabledOnly: "false",
    });

    const response = await fetch(DEFAULT_LT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (response.ok) {
      return response.json();
    }

    lastError = new Error(`LanguageTool HTTP ${response.status}`);
    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === 2) {
      throw lastError;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }

  throw lastError || new Error("LanguageTool indisponible");
}

function incrementCount(map, key) {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) || 0) + 1);
}

function topEntries(map, limit = 20, label = "value") {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "fr"))
    .slice(0, limit)
    .map(([value, count]) => ({ [label]: value, count }));
}

async function main() {
  const { scope, output } = parseArgs();
  const files = collectLanguageToolFiles(scope);
  const report = {
    generatedAt: new Date().toISOString(),
    scope,
    scannedFiles: files.length,
    summary: {
      totalMatches: 0,
      ignored: 0,
      style: 0,
      actionable: 0,
      filesWithActionable: 0,
    },
    topIgnoredMessages: [],
    topStyleMessages: [],
    topActionableMessages: [],
    topActionablePairs: [],
    actionableFiles: [],
    actionableSamples: [],
  };

  const ignoredMessages = new Map();
  const styleMessages = new Map();
  const actionableMessages = new Map();
  const actionablePairs = new Map();

  for (let index = 0; index < files.length; index += 1) {
    const filePath = files[index];
    const raw = fs.readFileSync(filePath, "utf8");
    const text = path.extname(filePath).toLowerCase() === ".html" ? extractVisibleTextFromHtml(raw) : raw;
    if (!text || text.length < 40) {
      continue;
    }

    const truncated = text.slice(0, 18000);
    const result = await checkText(truncated);
    let fileActionableCount = 0;

    for (const match of result.matches || []) {
      const matchedText = getMatchedText(truncated, match);
      const replacement = getPrimaryReplacement(match);
      const message = normalizeValue(match?.message || "");
      const issueType = normalizeValue(match?.rule?.issueType || "");
      const ruleId = normalizeValue(match?.rule?.id || "");

      report.summary.totalMatches += 1;

      const ignoreRule = findIgnoreRule(filePath, truncated, match);
      if (ignoreRule) {
        report.summary.ignored += 1;
        incrementCount(ignoredMessages, message || ignoreRule.id);
        continue;
      }

      if (looksLikeStyleIssue(match, matchedText, replacement)) {
        report.summary.style += 1;
        incrementCount(styleMessages, message || ruleId || issueType || "style");
        continue;
      }

      report.summary.actionable += 1;
      fileActionableCount += 1;
      incrementCount(actionableMessages, message || ruleId || issueType || "actionable");
      incrementCount(
        actionablePairs,
        `${matchedText || "∅"} -> ${replacement || "∅"}`,
      );

      if (report.actionableSamples.length < 80) {
        report.actionableSamples.push({
          filePath: path.relative(process.cwd(), filePath),
          message,
          matchedText,
          replacement,
          issueType,
          ruleId,
        });
      }
    }

    if (fileActionableCount > 0) {
      report.summary.filesWithActionable += 1;
      report.actionableFiles.push({
        filePath: path.relative(process.cwd(), filePath),
        actionableCount: fileActionableCount,
      });
    }

    if ((index + 1) % 25 === 0 || index === files.length - 1) {
      console.log(`Triage LT: ${index + 1}/${files.length}`);
    }
  }

  report.topIgnoredMessages = topEntries(ignoredMessages, 25, "message");
  report.topStyleMessages = topEntries(styleMessages, 25, "message");
  report.topActionableMessages = topEntries(actionableMessages, 25, "message");
  report.topActionablePairs = topEntries(actionablePairs, 25, "pair");
  report.actionableFiles.sort((a, b) => b.actionableCount - a.actionableCount || a.filePath.localeCompare(b.filePath, "fr"));

  const outputPath = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `Triage LT genere: ${path.relative(process.cwd(), outputPath)} (${report.summary.actionable} actionnable(s), ${report.summary.style} style, ${report.summary.ignored} ignoree(s))`,
  );
}

main().catch((error) => {
  console.error(`Triage LanguageTool indisponible : ${error.message}`);
  process.exit(1);
});
