const fs = require("fs");
const cheerio = require("cheerio");
const https = require("https");

const FILE_PATH = "src/pages/contact.html";
const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 300;

// Rules to skip (too noisy or dangerous)
const DANGEROUS_RULES = new Set([
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
]);

// Safe rules that actually improve grammar
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

function extractVisibleText(html) {
  const $ = cheerio.load(html);

  // Remove script, style, meta, link tags
  $("script, style, meta, link, noscript").remove();

  const body = $("body").text();
  return body;
}

/**
 * Map visible text positions back to HTML positions
 * Returns: { visibleIndex -> htmlIndex }
 */
function createOffsetMap(html) {
  const $ = cheerio.load(html);
  $("script, style, meta, link, noscript").remove();

  const bodyElement = $("body");
  if (bodyElement.length === 0) return {};

  const map = {};
  let visiblePos = 0;
  let htmlPos = html.indexOf("<body");
  
  // Walk through all text nodes in body
  const walkNodes = (node, map, visiblePos) => {
    if (node.type === "text") {
      const text = node.data;
      const startHtmlPos = html.indexOf(text, htmlPos);
      if (startHtmlPos !== -1) {
        for (let i = 0; i < text.length; i++) {
          map[visiblePos + i] = startHtmlPos + i;
        }
        htmlPos = startHtmlPos + text.length;
        return visiblePos + text.length;
      }
    } else if (node.children) {
      for (const child of node.children) {
        visiblePos = walkNodes(child, map, visiblePos);
      }
    }
    return visiblePos;
  };

  walkNodes(bodyElement[0], map, 0);
  return map;
}

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

async function processFile() {
  console.log(`📄 Processing: ${FILE_PATH}`);

  const htmlContent = fs.readFileSync(FILE_PATH, "utf-8");
  console.log(`✅ File loaded (${htmlContent.length} chars)`);

  // Extract visible text
  const visibleText = extractVisibleText(htmlContent);
  console.log(`📊 Visible text: ${visibleText.length} characters`);

  // Create offset map
  const offsetMap = createOffsetMap(htmlContent);
  console.log(`🗺️  Offset map created (${Object.keys(offsetMap).length} positions)`);

  // Wait before API call
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  // Call LanguageTool
  console.log(`🔍 Scanning with LanguageTool...`);
  const ltResult = await languageToolCheck(visibleText);

  const allMatches = ltResult.matches || [];
  console.log(`📊 Errors detected: ${allMatches.length}`);

  // Filter to safe rules
  const safeMatches = allMatches.filter((m) => {
    const rule = m.rule?.id || "";
    if (DANGEROUS_RULES.has(rule)) return false;
    if (!SAFE_RULES.has(rule) && !rule.startsWith("TYPO")) return false;
    return true;
  });

  console.log(`✅ Safe errors: ${safeMatches.length}`);

  if (safeMatches.length === 0) {
    console.log("✨ No corrections needed!");
    return;
  }

  console.log("\n🔧 Corrections to apply:\n");

  let appliedCount = 0;
  let failedCount = 0;
  let updatedHtml = htmlContent;

  // Sort by offset DESC so we apply from end to start (prevents offset shifting)
  const sorted = safeMatches.sort((a, b) => b.offset - a.offset);

  for (const match of sorted) {
    const { offset, length, message, replacements } = match;
    const rule = match.rule?.id || "UNKNOWN";

    // Get the error text from visible text
    const errorText = visibleText.substring(offset, offset + length);
    const suggestion = replacements[0]?.value || "N/A";

    console.log(
      `  "${errorText}" → "${suggestion}" (${rule})`
    );

    if (!replacements || replacements.length === 0) {
      console.log(`    ❌ No suggestions`);
      failedCount++;
      continue;
    }

    // Try to find and replace in HTML
    // Since using reverse order (DESC offset), we can directly apply
    const htmlOffset = offsetMap[offset];

    if (htmlOffset === undefined) {
      console.log(`    ❌ Offset not mapped (visible: ${offset})`);
      failedCount++;
      continue;
    }

    try {
      // Extract context around error position
      const contextStart = Math.max(0, htmlOffset - 30);
      const contextEnd = Math.min(
        updatedHtml.length,
        htmlOffset + length + 30
      );
      const before = updatedHtml.substring(contextStart, htmlOffset);
      const errorPart = updatedHtml.substring(htmlOffset, htmlOffset + length);
      const after = updatedHtml.substring(htmlOffset + length, contextEnd);

      // Show detailed context
      console.log(
        `    HTML context: "...${before}[${errorPart}]${after}..."`
      );

      // Check if it matches expected error text
      if (errorPart !== errorText) {
        console.log(
          `    ⚠️  Text mismatch: expected "${errorText}" but found "${errorPart}"`
        );
        console.log(`    Skipping this correction`);
        failedCount++;
        continue;
      }

      // Apply replacement
      const before2 = updatedHtml.substring(0, htmlOffset);
      const after2 = updatedHtml.substring(htmlOffset + length);
      updatedHtml = before2 + suggestion + after2;

      console.log(`    ✅ Applied`);
      appliedCount++;
    } catch (e) {
      console.log(`    ❌ Error: ${e.message}`);
      failedCount++;
    }
  }

  // Write updated HTML
  fs.writeFileSync(FILE_PATH, updatedHtml, "utf-8");

  console.log(`\n✅ Résumé:`);
  console.log(`  ✏️  Corrections applied: ${appliedCount}/${safeMatches.length}`);
  console.log(`  ❌ Failed: ${failedCount}/${safeMatches.length}`);
}

processFile().catch(console.error);
