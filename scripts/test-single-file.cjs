const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;
const TARGET_FILE = "src/pages/contact.html";

// Safe rules only
const SAFE_RULES = new Set([
  "A_ACCENT",
  "A_A_ACCENT2",
  "APOS_M",
  "AGREEMENT_POSTPONED_ADJ",
  "MOIS",
  "DEUX_POINTS_ESPACE",
  "PLACE_ADJ",
  "PRONOMS_PERSONNELS_MINUSCULE",
]);

const DANGEROUS_RULES = new Set([
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  // "WHITESPACE_RULE", // Temporarily allowed
  // "FR_SPELLING_RULE", // Temporarily allowed
  "FRENCH_WORD_REPEAT_BEGINNING_RULE",
]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTextNodesInfo($) {
  const nodes = [];
  function walk(node) {
    if (node.type === "text") {
      const text = node.data;
      if (text && text.trim().length > 0) {
        nodes.push({ data: text, node: node });
      }
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }
  walk($.root()[0]);
  return nodes;
}

function languageToolCheck(text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ text, language: "fr" });
    const url = `${LT_URL}?${params}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function safeReplace(text, wrong, correction) {
  const hasSpaces = wrong.includes(" ");
  const pattern = hasSpaces ? escapeRegex(wrong) : `\\b${escapeRegex(wrong)}\\b`;
  const regex = new RegExp(pattern, "g");
  return text.replace(regex, correction);
}

function isSafe(original, updated) {
  if (!updated) return false;
  const diff = Math.abs(original.length - updated.length);
  if (diff > 30) return false;
  if (updated.length < original.length * 0.7) return false;
  return true;
}

function shouldIgnore(text) {
  // Ignore only very short or technical-looking text
  return (
    text.trim().length < 3 ||
    text.includes("{") ||
    text.includes("=")
  );
}

async function processFile(filePath) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  const htmlContent = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(htmlContent, { decodeEntities: false });
  const textNodes = getTextNodesInfo($);
  console.log(`📋 Text nodes: ${textNodes.length}`);

  if (textNodes.length === 0) {
    console.log("⚠️  No text nodes found");
    return { total: 0, applied: 0 };
  }

  let totalApplied = 0;

  for (const nodeInfo of textNodes) {
    const originalText = nodeInfo.data;
    if (shouldIgnore(originalText)) continue;

    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    const ltResult = await languageToolCheck(originalText);
    const allMatches = ltResult.matches || [];
    if (allMatches.length === 0) continue;

    // --- DEBUG: Log all detected rules ---
    const allRules = allMatches.map(m => m.rule.id).join(', ');
    console.log(`    🔍 All detected rules: ${allRules}`);
    // --- END DEBUG ---

    const safeMatches = allMatches.filter((m) => {
      const rule = m.rule?.id || "";
      if (DANGEROUS_RULES.has(rule)) return false;
      if (!SAFE_RULES.has(rule) && !rule.startsWith("TYPO")) return false;
      return true;
    });

    if (safeMatches.length === 0) continue;

    let nodeApplied = 0;
    let correctedText = originalText;

    for (const match of safeMatches) {
      const { offset, length } = match;
      const wrong = originalText.substring(offset, offset + length);
      const suggestion = match.replacements?.[0]?.value;

      if (!suggestion || wrong.length < 2) continue;

      const testReplaced = safeReplace(correctedText, wrong, suggestion);
      if (!isSafe(correctedText, testReplaced)) continue;

      if (testReplaced !== correctedText) {
        correctedText = testReplaced;
        nodeApplied++;
        console.log(`    ✓ "${wrong}" → "${suggestion}"`);
      }
    }

    if (correctedText !== originalText) {
      nodeInfo.node.data = correctedText;
      totalApplied += nodeApplied;
    }
  }

  const updatedHtml = $.html({ decodeEntities: false });
  fs.writeFileSync(filePath, updatedHtml, "utf-8");
  console.log(`✅ Applied: ${totalApplied} corrections`);
  return { total: textNodes.length, applied: totalApplied };
}

async function run() {
  const filePath = path.resolve(__dirname, `../${TARGET_FILE}`);
  try {
    await processFile(filePath);
  } catch (error) {
    console.error(`❌ ${TARGET_FILE}: ${error.message}`);
  }
}

run().catch(console.error);
