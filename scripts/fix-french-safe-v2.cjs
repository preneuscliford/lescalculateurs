const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;

// Rules we trust
const SAFE_RULES = new Set([
  "A_ACCENT",
  "A_A_ACCENT2",
  "APOS_M",
  "AGREEMENT_POSTPONED_ADJ",
  "MOIS",
  "DEUX_POINTS_ESPACE",
  "PLACE_ADJ",
  "PRONOMS_PERSONNELS_MINUSCULE",
  "TYPO_RULE",
]);

// Rules to NEVER apply
const DANGEROUS_RULES = new Set([
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WORD_REPEAT_BEGINNING_RULE",
  "HUNSPELL_RULE",
]);

/**
 * 🔒 Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 🔥 Replace ONLY complete words
 */
function safeReplace(text, wrong, correction) {
  if (!wrong || !correction) return text;

  if (wrong.includes(" ")) {
    const regex = new RegExp(escapeRegex(wrong), "g");
    return text.replace(regex, correction);
  }

  const regex = new RegExp(`\\b${escapeRegex(wrong)}\\b`, "g");
  return text.replace(regex, correction);
}

/**
 * 🛡️ Security check
 */
function isSafe(original, updated) {
  if (!updated || typeof updated !== "string") return false;

  const diff = Math.abs(original.length - updated.length);
  if (diff > 30) return false;

  if (updated.length < original.length * 0.7) return false;

  if (updated.includes("<") && updated.includes(">")) return false;

  return true;
}

/**
 * 🚫 Skip certain text nodes
 */
function shouldIgnore(text) {
  if (text.length < 20) return true;
  if (/^[A-Z0-9\s€.,:-]+$/.test(text)) return true;
  if (text.includes("{") || text.includes("}")) return true;
  if (text.includes("=")) return true;
  if (text.includes("&") && text.includes(";")) return true;
  return false;
}

/**
 * 🔥 Extract all text nodes
 */
function getTextNodes($) {
  const nodes = [];

  function walk(node) {
    if (node.type === "text") {
      const text = node.data;
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
 * 🌐 Call LanguageTool API
 */
function checkWithLT(text) {
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
            const result = JSON.parse(data);
            resolve(result.matches || []);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * 🧠 Apply corrections
 */
function applyCorrections(text, matches) {
  let updated = text;
  let appliedCount = 0;

  const sorted = matches.sort((a, b) => b.offset - a.offset);

  for (const match of sorted) {
    const { offset, length, replacements, rule } = match;

    if (!replacements || replacements.length === 0) continue;

    const suggestion = replacements[0].value;
    let wrong = text.substring(offset, offset + length);

    if (wrong.length < 2) continue;

    const newText = safeReplace(updated, wrong, suggestion);

    if (newText === updated) continue;

    if (!isSafe(updated, newText)) continue;

    updated = newText;
    appliedCount++;
  }

  return { updated, appliedCount };
}

/**
 * 📄 Process single file - PRESERVES HTML FORMAT
 */
async function processFile(filePath) {
  console.log(`\n📄 ${path.basename(filePath)}`);

  let htmlContent = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(htmlContent, {
    decodeEntities: false,
  });

  const textNodes = getTextNodes($);
  console.log(`   Found ${textNodes.length} text nodes`);

  let totalCorrections = 0;
  let nodesToProcess = 0;
  const corrections = []; // Store all corrections first

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const originalText = node.data;

    if (shouldIgnore(originalText)) continue;

    nodesToProcess++;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

    try {
      const matches = await checkWithLT(originalText);

      const safeMatches = matches.filter((m) => {
        const ruleId = m.rule?.id || "";
        if (DANGEROUS_RULES.has(ruleId)) return false;
        if (!SAFE_RULES.has(ruleId) && !ruleId.startsWith("TYPO")) return false;
        return true;
      });

      if (safeMatches.length === 0) continue;

      const { updated, appliedCount } = applyCorrections(originalText, safeMatches);

      if (appliedCount > 0) {
        // Store correction for later application to raw HTML
        corrections.push({
          original: originalText,
          updated: updated,
          appliedCount: appliedCount,
        });

        totalCorrections += appliedCount;
        console.log(`   ✓ Node ${nodesToProcess}: ${appliedCount} corrections`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // NOW: Apply corrections to raw HTML (preserves exact formatting)
  for (const correction of corrections) {
    const { original, updated } = correction;

    // Use simple replace - but be careful with regex special chars
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedOriginal, "g");
    htmlContent = htmlContent.replace(regex, updated);
  }

  // Write updated HTML
  fs.writeFileSync(filePath, htmlContent, "utf8");

  console.log(`   ✅ Saved (${totalCorrections} corrections applied)`);
  return totalCorrections;
}

/**
 * 🚀 Process multiple files
 */
async function run(filePattern) {
  const startTime = Date.now();

  let files = [];

  if (filePattern) {
    if (fs.lstatSync(filePattern).isDirectory()) {
      files = fs
        .readdirSync(filePattern)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(filePattern, f));
    } else {
      files = [filePattern];
    }
  } else {
    const folder = path.resolve(__dirname, "../content_SAFE");
    if (fs.existsSync(folder)) {
      files = fs
        .readdirSync(folder)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(folder, f));
    }
  }

  if (files.length === 0) {
    console.log("❌ No HTML files found");
    process.exit(1);
  }

  console.log(`\n🚀 Processing ${files.length} files...\n`);

  let totalCorrections = 0;

  for (const file of files) {
    try {
      const corrections = await processFile(file);
      totalCorrections += corrections;
    } catch (error) {
      console.log(`❌ Error: ${file} → ${error.message}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n✅ DONE`);
  console.log(`   Total corrections: ${totalCorrections}`);
  console.log(`   Duration: ${duration}s`);
}

// Entry point
const args = process.argv.slice(2);
const filePattern = args[0] || null;

run(filePattern).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
