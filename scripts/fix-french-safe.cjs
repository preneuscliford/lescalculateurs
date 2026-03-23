const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;

// Rules we trust (safe and useful)
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

// Rules to NEVER apply (too dangerous or noisy)
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
 * 🔥 Replace ONLY complete words (word boundaries)
 * Prevents "a" → "à" from breaking "fantastique"
 */
function safeReplace(text, wrong, correction) {
  if (!wrong || !correction) return text;

  // If the wrong text contains spaces, it's a phrase - handle differently
  if (wrong.includes(" ")) {
    // For phrases: escape and replace without word boundaries
    const regex = new RegExp(escapeRegex(wrong), "g");
    return text.replace(regex, correction);
  }

  // For single words: use word boundaries
  const regex = new RegExp(`\\b${escapeRegex(wrong)}\\b`, "g");
  return text.replace(regex, correction);
}

/**
 * 🛡️ Security check: did the correction break something?
 */
function isSafe(original, updated) {
  if (!updated || typeof updated !== "string") return false;

  // Check length change (prevent massive deletions)
  const diff = Math.abs(original.length - updated.length);
  if (diff > 30) {
    console.log(`    ⚠️  Length change too large (${diff} chars)`);
    return false;
  }

  // Prevent >30% text loss
  if (updated.length < original.length * 0.7) {
    console.log(`    ⚠️  Text loss too high (${original.length} → ${updated.length})`);
    return false;
  }

  // Ensure no HTML tags got corrupted
  if (updated.includes("<") && updated.includes(">")) {
    console.log(`    ⚠️  HTML tags detected in text node`);
    return false;
  }

  return true;
}

/**
 * 🚫 Skip certain text nodes (titles, code, attributes, etc)
 */
function shouldIgnore(text) {
  // Too short to correct
  if (text.length < 20) return true;

  // All uppercase/numbers (likely titles or codes)
  if (/^[A-Z0-9\s€.,:-]+$/.test(text)) return true;

  // Contains braces (likely JS)
  if (text.includes("{") || text.includes("}")) return true;

  // Contains equals (likely HTML attribute)
  if (text.includes("=")) return true;

  // Contains HTML entities
  if (text.includes("&") && text.includes(";")) return true;

  return false;
}

/**
 * 🔥 Extract all real text nodes from DOM (not script/style/etc)
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
 * 🧠 Apply corrections intelligently (word-by-word, safe)
 */
function applyCorrections(text, matches) {
  let updated = text;
  let appliedCount = 0;

  // Sort by offset DESC to apply from end (prevents offset shifting)
  const sorted = matches.sort((a, b) => b.offset - a.offset);

  for (const match of sorted) {
    const { offset, length, replacements, rule } = match;
    const ruleId = rule?.id || "UNKNOWN";

    if (!replacements || replacements.length === 0) {
      continue;
    }

    const suggestion = replacements[0].value;

    // Extract the error text from visible text (using offset from LT)
    let wrong = text.substring(offset, offset + length);

    // Skip very short corrections (too risky)
    if (wrong.length < 2) {
      continue;
    }

    // Try the replacement
    const newText = safeReplace(updated, wrong, suggestion);

    // Verify something actually changed
    if (newText === updated) {
      continue;
    }

    // Security check
    if (!isSafe(updated, newText)) {
      continue;
    }

    // All good - apply it
    updated = newText;
    appliedCount++;
  }

  return { updated, appliedCount };
}

/**
 * 📄 Process a single HTML file
 */
async function processFile(filePath) {
  console.log(`\n📄 ${path.basename(filePath)}`);

  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html, {
    decodeEntities: false,      // Keep &nbsp; etc intact
    preserveHtmlComments: true, // Keep comments
  });

  const textNodes = getTextNodes($);
  console.log(`   Found ${textNodes.length} text nodes`);

  let totalCorrections = 0;
  let nodesToProcess = 0;

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const originalText = node.data;

    // Skip certain content
    if (shouldIgnore(originalText)) {
      continue;
    }

    nodesToProcess++;

    // API call with rate limiting
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

    try {
      const matches = await checkWithLT(originalText);

      // Filter to safe rules only
      const safeMatches = matches.filter((m) => {
        const ruleId = m.rule?.id || "";
        if (DANGEROUS_RULES.has(ruleId)) return false;
        if (!SAFE_RULES.has(ruleId) && !ruleId.startsWith("TYPO")) return false;
        return true;
      });

      if (safeMatches.length === 0) {
        continue;
      }

      // Apply corrections
      const { updated, appliedCount } = applyCorrections(originalText, safeMatches);

      if (appliedCount > 0) {
        node.data = updated;
        totalCorrections += appliedCount;
        console.log(`   ✓ Node ${nodesToProcess}: ${appliedCount} corrections`);
      }
    } catch (error) {
      console.log(`   ❌ Error processing node: ${error.message}`);
    }
  }

  // Write updated HTML
  const updatedHtml = $.html();
  fs.writeFileSync(filePath, updatedHtml, "utf8");

  console.log(`   ✅ Saved (${totalCorrections} corrections applied)`);
  return totalCorrections;
}

/**
 * 🚀 Process multiple files
 */
async function run(filePattern) {
  const startTime = Date.now();

  let files = [];

  // If pattern provided, use it; otherwise scan content_SAFE
  if (filePattern) {
    if (fs.lstatSync(filePattern).isDirectory()) {
      // It's a directory
      files = fs
        .readdirSync(filePattern)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(filePattern, f));
    } else {
      // It's a single file
      files = [filePattern];
    }
  } else {
    // Default: scan content_SAFE
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
