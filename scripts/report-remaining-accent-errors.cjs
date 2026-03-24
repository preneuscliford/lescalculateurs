#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { collectLanguageToolFiles } = require("./lib/text-file-scopes.cjs");
const { extractVisibleTextFromHtml, extractSeoTextFromHtml } = require("./lib/html-text-utils.cjs");

const DEFAULT_LT_URL = process.env.LANGUAGETOOL_API_URL || "https://api.languagetool.org/v2/check";
const LT_LANG = process.env.LANGUAGETOOL_LANGUAGE || "fr";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_PARALLEL = 4;
const AMBIGUOUS_ACCENT_PAIRS = new Map([
  ["a", "à"],
  ["ou", "où"],
  ["des", "dès"],
  ["la", "là"],
]);

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
  const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));

  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "site-rendered",
    outputPath: outputArg
      ? path.resolve(process.cwd(), outputArg.split("=")[1])
      : path.resolve(process.cwd(), "reports/remaining-accent-errors-site.json"),
    mode: modeArg ? modeArg.split("=")[1] : "visible",
  };
}

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/gu, "'")
    .toLowerCase();
}

function countAccents(value) {
  return (String(value || "").match(/[\u00C0-\u017F]/gu) || []).length;
}

function getMatchedText(match) {
  const contextText = match?.context?.text || "";
  const offset = Number.isInteger(match?.context?.offset) ? match.context.offset : 0;
  const length = Number.isInteger(match?.context?.length) ? match.context.length : 0;
  if (!contextText || length <= 0) {
    return "";
  }
  return contextText.slice(offset, offset + length);
}

function isAmbiguousAccentPair(original, suggestion) {
  return (
    AMBIGUOUS_ACCENT_PAIRS.get(String(original || "").trim().toLowerCase()) ===
    String(suggestion || "").trim().toLowerCase()
  );
}

function classifyAccentItem(original, suggestion) {
  if (!original || !suggestion || original === suggestion) {
    return null;
  }

  const originalLower = String(original).toLowerCase();
  const suggestionLower = String(suggestion).toLowerCase();
  const normalizedOriginal = stripDiacritics(original);
  const normalizedSuggestion = stripDiacritics(suggestion);
  const originalAccents = countAccents(original);
  const suggestionAccents = countAccents(suggestion);

  if (isAmbiguousAccentPair(original, suggestion)) {
    return "ambiguous";
  }

  if (normalizedOriginal !== normalizedSuggestion) {
    return null;
  }

  if (originalLower === suggestionLower) {
    return "caseOnly";
  }

  if (suggestionAccents > originalAccents) {
    return "safe";
  }

  return "review";
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

function extractText(filePath, mode) {
  const raw = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== ".html") {
    return raw;
  }

  if (mode === "seo") {
    return extractSeoTextFromHtml(raw);
  }

  return extractVisibleTextFromHtml(raw);
}

function buildTopPairs(items, limit = 20) {
  return Object.entries(
    items.reduce((accumulator, item) => {
      const key = `${item.error} -> ${item.suggestions[0]}`;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([pair, count]) => ({ pair, count }));
}

function isSingleToken(value) {
  return !/[\s'-]/u.test(String(value || "").trim());
}

function shouldIgnoreAccentReportItem(match, original, suggestion) {
  const context = String(match?.context?.text || "");
  const ruleId = String(match?.rule?.id || "");
  const normalizedOriginal = String(original || "").trim().toLowerCase();
  const normalizedSuggestion = String(suggestion || "").trim().toLowerCase();

  if (
    ruleId === "D_N_E_OU_E" &&
    /reste à charge/iu.test(context) &&
    /^charg/i.test(String(suggestion || ""))
  ) {
    return true;
  }

  if (
    normalizedOriginal === "ou" &&
    normalizedSuggestion === "où" &&
    /\bou (une|un|êtes|présentez-vous)\b/iu.test(context)
  ) {
    return true;
  }

  if (
    normalizedOriginal === "des" &&
    normalizedSuggestion === "dès" &&
    /\bdes\s+\d/iu.test(context)
  ) {
    return true;
  }

  return false;
}

async function main() {
  const { scope, outputPath, mode } = parseArgs();
  const files = collectLanguageToolFiles(scope).filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  const safeItems = [];
  const ambiguousItems = [];
  const caseOnlyItems = [];
  const reviewItems = [];
  let processed = 0;

  async function processFile(filePath) {
    const text = extractText(filePath, mode);
    if (!text || text.length < 20) {
      return [];
    }

    const truncated = text.slice(0, 18000);
    const response = await checkText(truncated);
    const items = [];

    for (const match of response.matches || []) {
      const suggestion = match?.replacements?.[0]?.value || "";
      const original = getMatchedText(match);
      if (shouldIgnoreAccentReportItem(match, original, suggestion)) {
        continue;
      }
      const category = classifyAccentItem(original, suggestion);

      if (!category) {
        continue;
      }

      items.push({
        category,
        file: path.relative(process.cwd(), filePath),
        rule: match?.rule?.id || "",
        message: match?.message || "",
        error: original,
        suggestions: [suggestion],
        context: match?.context?.text || "",
      });
    }

    return items;
  }

  for (let index = 0; index < files.length; index += MAX_PARALLEL) {
    const batch = files.slice(index, index + MAX_PARALLEL);
    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        const fileResults = await processFile(filePath);
        processed += 1;
        if (processed % 25 === 0 || processed === files.length) {
          console.log(`Rapport accents: ${processed}/${files.length}`);
        }
        return fileResults;
      }),
    );

    for (const fileResults of batchResults) {
      for (const item of fileResults) {
        if (item.category === "safe") safeItems.push(item);
        if (item.category === "ambiguous") ambiguousItems.push(item);
        if (item.category === "caseOnly") caseOnlyItems.push(item);
        if (item.category === "review") reviewItems.push(item);
      }
    }
  }

  const safePairCounts = safeItems.reduce((accumulator, item) => {
    const key = `${item.error} -> ${item.suggestions[0]}`;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const retainedSafeItems = [];
  for (const item of safeItems) {
    const key = `${item.error} -> ${item.suggestions[0]}`;
    if (safePairCounts[key] === 1 && isSingleToken(item.error)) {
      reviewItems.push(item);
      continue;
    }
    retainedSafeItems.push(item);
  }

  safeItems.length = 0;
  safeItems.push(...retainedSafeItems);

  const summary = {
    scope,
    mode,
    scannedFiles: files.length,
    totalMatches: safeItems.length,
    ambiguousMatches: ambiguousItems.length,
    caseOnlyMatches: caseOnlyItems.length,
    reviewMatches: reviewItems.length,
    topPairs: buildTopPairs(safeItems, 100),
    topAmbiguousPairs: buildTopPairs(ambiguousItems, 20),
    topCaseOnlyPairs: buildTopPairs(caseOnlyItems, 20),
    topReviewPairs: buildTopPairs(reviewItems, 20),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        summary,
        items: safeItems,
        ambiguousItems,
        caseOnlyItems,
        reviewItems,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Rapport accents restant genere: ${path.relative(process.cwd(), outputPath)} (${safeItems.length} safe + ${ambiguousItems.length} ambigu + ${caseOnlyItems.length} casse + ${reviewItems.length} review, ${files.length} fichier(s))`,
  );
}

main().catch((error) => {
  console.error(`Erreur rapport accents: ${error.message}`);
  process.exit(1);
});
