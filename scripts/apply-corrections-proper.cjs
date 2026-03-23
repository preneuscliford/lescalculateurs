const fs = require("fs");
const cheerio = require("cheerio");
const https = require("https");

const FILE_PATH = "src/pages/contact.html";
const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;

// Rules to trust
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

// Rules to skip
const DANGEROUS_RULES = new Set([
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WORD_REPEAT_BEGINNING_RULE",
]);

/**
 * Extract all text nodes from DOM
 */
function getTextNodes($) {
  const nodes = [];

  function walk(node) {
    if (node.type === "text") {
      const text = node.data;
      // Keep non-empty text nodes
      if (text && text.trim().length > 0) {
        nodes.push(node);
      }
    }

    if (node.children) {
      node.children.forEach(walk);
    }
  }

  walk($.root()[0]);
  return nodes;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if length change is safe
 */
function isSafe(original, updated) {
  const diff = Math.abs(original.length - updated.length);
  return diff < 20; // Allow up to 20 char difference
}

/**
 * Apply corrections to text using word boundaries
 */
function applyCorrections(text, matches) {
  let updated = text;
  let appliedCount = 0;

  // Sort by offset DESC to apply changes from end (prevents offset shifting)
  const sorted = matches.sort((a, b) => b.offset - a.offset);

  for (const match of sorted) {
    const { offset, length, replacements, rule } = match;

    if (!replacements || replacements.length === 0) {
      continue;
    }

    const wrong = text.substring(offset, offset + length);
    const suggestion = replacements[0].value;

    // Use word boundary regex for safety
    // But: if the error contains spaces (multi-word), don't use \b
    const hasSpaces = wrong.includes(" ");
    const pattern = hasSpaces 
      ? escapeRegex(wrong) 
      : `\\b${escapeRegex(wrong)}\\b`;

    const regex = new RegExp(pattern, "g");

    const newText = updated.replace(regex, suggestion);

    // Verify it's safe before applying
    if (!isSafe(text, newText)) {
      console.log(`    ⚠️  Length change too large for "${wrong}" → "${suggestion}"`);
      continue;
    }

    // Verify the replacement actually happened
    if (newText === updated) {
      console.log(`    ❌ Pattern didn't match: "${wrong}"`);
      continue;
    }

    updated = newText;
    appliedCount++;
  }

  return { updated, appliedCount };
}

/**
 * Call LanguageTool API
 */
function languageToolCheck(text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      text: text,
      language: "fr",
    });

    const url = `${LT_URL}?${params}`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Process a single text node
 */
async function processNode(node, nodeIndex, totalNodes) {
  const originalText = node.data;

  // Skip very short text
  if (originalText.trim().length < 3) {
    return { applied: 0, failed: 0 };
  }

  console.log(`\n📝 Node ${nodeIndex}/${totalNodes}: "${originalText.substring(0, 50)}..."`);

  // Check with LT
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  const ltResult = await languageToolCheck(originalText);

  const allMatches = ltResult.matches || [];
  if (allMatches.length === 0) {
    console.log(`  ✓ No errors`);
    return { applied: 0, failed: 0 };
  }

  // Filter to safe rules
  const safeMatches = allMatches.filter((m) => {
    const rule = m.rule?.id || "";
    if (DANGEROUS_RULES.has(rule)) return false;
    if (!SAFE_RULES.has(rule) && !rule.startsWith("TYPO")) return false;
    return true;
  });

  console.log(`  Found: ${allMatches.length} errors, ${safeMatches.length} safe`);

  if (safeMatches.length === 0) {
    return { applied: 0, failed: 0 };
  }

  // Show what we'll correct
  for (const match of safeMatches) {
    const { offset, length } = match;
    const wrong = originalText.substring(offset, offset + length);
    const suggestion = match.replacements?.[0]?.value || "?";
    const rule = match.rule?.id || "?";
    console.log(`    "${wrong}" → "${suggestion}" (${rule})`);
  }

  // Apply corrections
  const { updated, appliedCount } = applyCorrections(originalText, safeMatches);

  if (appliedCount > 0) {
    node.data = updated;
    console.log(`  ✅ Applied: ${appliedCount}/${safeMatches.length}`);
  }

  const failed = safeMatches.length - appliedCount;
  return { applied: appliedCount, failed };
}

/**
 * Main function
 */
async function processFile() {
  console.log(`\n🚀 Starting file processing: ${FILE_PATH}\n`);

  const htmlContent = fs.readFileSync(FILE_PATH, "utf-8");
  console.log(`✅ File loaded (${htmlContent.length} chars)`);

  const $ = cheerio.load(htmlContent);

  // Get text nodes
  const textNodes = getTextNodes($);
  console.log(`📋 Text nodes found: ${textNodes.length}\n`);

  if (textNodes.length === 0) {
    console.log("❌ No text nodes found!");
    return;
  }

  // Process each node
  let totalApplied = 0;
  let totalFailed = 0;

  for (let i = 0; i < textNodes.length; i++) {
    try {
      const { applied, failed } = await processNode(textNodes[i], i + 1, textNodes.length);
      totalApplied += applied;
      totalFailed += failed;
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      totalFailed++;
    }
  }

  // Save updated HTML
  const updatedHtml = $.html();
  fs.writeFileSync(FILE_PATH, updatedHtml, "utf-8");

  console.log(`\n📊 RÉSUMÉ FINAL:`);
  console.log(`  ✅ Corrections applied: ${totalApplied}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log(`  📝 File saved: ${FILE_PATH}`);
}

processFile().catch(console.error);
