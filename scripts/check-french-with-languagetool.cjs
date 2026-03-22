#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { extractVisibleTextFromHtml } = require("./lib/html-text-utils.cjs");
const { findIgnoreRule } = require("./lib/languagetool-ignore-rules.cjs");

const DEFAULT_LT_URL = process.env.LANGUAGETOOL_API_URL || "https://api.languagetool.org/v2/check";
const LT_LANG = process.env.LANGUAGETOOL_LANGUAGE || "fr";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "pseo-rendered",
  };
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

async function main() {
  const { scope } = parseArgs();
  const files = collectLanguageToolFiles(scope);
  const findings = [];
  let ignoredMatchesCount = 0;

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const text = path.extname(filePath).toLowerCase() === ".html" ? extractVisibleTextFromHtml(raw) : raw;
    if (!text || text.length < 40) continue;

    const truncated = text.slice(0, 18000);
    const result = await checkText(truncated);
    const actionableMatches = [];

    for (const match of result.matches || []) {
      const issueType = match.rule?.issueType || "";
      if (issueType === "typographical" && !match.message) {
        continue;
      }

      const ignoreRule = findIgnoreRule(filePath, truncated, match);
      if (ignoreRule) {
        ignoredMatchesCount += 1;
        continue;
      }

      actionableMatches.push(match);
    }

    if (actionableMatches.length > 0) {
      findings.push({
        filePath,
        matches: actionableMatches,
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `LanguageTool OK : ${files.length} fichiers verifies (${scope}) - ${ignoredMatchesCount} alerte(s) ignoree(s)`,
    );
    return;
  }

  console.error(
    `LanguageTool : ${findings.length} fichier(s) avec alertes actionnables (${scope}) - ${ignoredMatchesCount} alerte(s) ignoree(s)`,
  );
  for (const finding of findings.slice(0, 20)) {
    console.error(`- ${path.relative(process.cwd(), finding.filePath)}`);
    for (const match of finding.matches.slice(0, 5)) {
      const replacement = match.replacements?.[0]?.value || "n/a";
      console.error(`  * ${match.message} -> ${replacement}`);
    }
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(`LanguageTool indisponible : ${error.message}`);
  process.exit(1);
});
