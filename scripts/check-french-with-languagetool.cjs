#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");

const DEFAULT_LT_URL = process.env.LANGUAGETOOL_API_URL || "https://api.languagetool.org/v2/check";
const LT_LANG = process.env.LANGUAGETOOL_LANGUAGE || "fr";

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "pseo-rendered",
  };
}

function stripHtml(content) {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/\s+/g, " ")
    .trim();
}

async function checkText(text) {
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

  if (!response.ok) {
    throw new Error(`LanguageTool HTTP ${response.status}`);
  }

  return response.json();
}

async function main() {
  const { scope } = parseArgs();
  const files = collectLanguageToolFiles(scope);
  const findings = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const text = path.extname(filePath).toLowerCase() === ".html" ? stripHtml(raw) : raw;
    if (!text || text.length < 40) continue;

    const truncated = text.slice(0, 18000);
    const result = await checkText(truncated);
    const matches = (result.matches || []).filter((match) => {
      const issueType = match.rule?.issueType || "";
      return issueType !== "typographical" || match.message;
    });

    if (matches.length > 0) {
      findings.push({
        filePath,
        matches,
      });
    }
  }

  if (findings.length === 0) {
    console.log(`LanguageTool OK: ${files.length} fichiers vérifiés (${scope})`);
    return;
  }

  console.error(`LanguageTool: ${findings.length} fichier(s) avec alertes (${scope})`);
  for (const finding of findings.slice(0, 20)) {
    console.error(`- ${path.relative(process.cwd(), finding.filePath)}`);
    for (const match of finding.matches.slice(0, 5)) {
      const replacement = match.replacements?.[0]?.value || "n/a";
      console.error(`  • ${match.message} -> ${replacement}`);
    }
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(`LanguageTool indisponible: ${error.message}`);
  process.exit(1);
});
