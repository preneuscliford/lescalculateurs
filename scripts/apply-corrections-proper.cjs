#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");
const {
  applyCorrectionsSafe,
  getTextNodes,
  shouldIgnore,
} = require("./lib/html-safe-french-corrections.cjs");

const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;
const DEFAULT_FILE_PATH = "src/pages/contact.html";

const SAFE_RULES = new Set([
  "A_ACCENT",
  "A_A_ACCENT2",
  "APOS_M",
  "MOIS",
  "DEUX_POINTS_ESPACE",
  "PRONOMS_PERSONNELS_MINUSCULE",
]);

const DANGEROUS_RULES = new Set([
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WORD_REPEAT_BEGINNING_RULE",
  "HUNSPELL_RULE",
]);
const AMBIGUOUS_ACCENT_PAIRS = new Map([
  ["a", "à"],
  ["ou", "où"],
  ["des", "dès"],
  ["la", "là"],
]);

function parseArgs() {
  const fileArg = process.argv.find((argument) => argument.startsWith("--file="));
  return {
    filePath: fileArg ? fileArg.slice("--file=".length) : DEFAULT_FILE_PATH,
  };
}

function languageToolCheck(text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      text,
      language: "fr",
    });

    https
      .get(`${LT_URL}?${params}`, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function toSafeIssues(matches) {
  return matches
    .filter((match) => {
      const ruleId = match.rule?.id || "";
      const original =
        match.context && typeof match.context.text === "string"
          ? match.context.text.slice(match.context.offset, match.context.offset + match.context.length).trim().toLowerCase()
          : "";
      const suggestion = String(match.replacements?.[0]?.value || "").trim().toLowerCase();
      if (DANGEROUS_RULES.has(ruleId)) {
        return false;
      }

      if (AMBIGUOUS_ACCENT_PAIRS.get(original) === suggestion) {
        return false;
      }

      return SAFE_RULES.has(ruleId) || ruleId.startsWith("TYPO");
    })
    .map((match) => ({
      rule: match.rule?.id,
      message: match.message,
      suggestions: (match.replacements || []).map((replacement) => replacement.value).filter(Boolean),
      context:
        match.context && typeof match.context.text === "string"
          ? {
              text: match.context.text,
              offset: match.context.offset,
              length: match.context.length,
            }
          : "",
    }));
}

async function processFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const html = fs.readFileSync(absolutePath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  const entries = getTextNodes($, { minLength: 3 });

  let appliedCount = 0;
  let rejectedCount = 0;

  for (const [index, entry] of entries.entries()) {
    const originalText = entry.node.data;

    if (shouldIgnore(originalText, { minLength: 3 })) {
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    const ltResult = await languageToolCheck(originalText);
    const issues = toSafeIssues(ltResult.matches || []);

    if (issues.length === 0) {
      continue;
    }

    const result = applyCorrectionsSafe(originalText, issues, {
      maxLengthDelta: 20,
    });

    if (result.applied.length > 0) {
      entry.node.data = result.updated;
      appliedCount += result.applied.length;
      console.log(`node ${index + 1}: ${result.applied.length} correction(s) appliquee(s)`);
    }

    rejectedCount += result.rejected.length;
  }

  fs.writeFileSync(absolutePath, $.html(), "utf8");
  console.log(
    `${path.relative(process.cwd(), absolutePath)}: ${appliedCount} appliquee(s), ${rejectedCount} rejetee(s)`,
  );
}

processFile(parseArgs().filePath).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
