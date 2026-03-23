const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.resolve(__dirname, "../french-errors-report.json");
const OUTPUT_FILE = path.resolve(__dirname, "../french-errors-filtered.json");

// Rules to completely ignore (too noisy)
const IGNORED_RULES = new Set([
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WORD_REPEAT_RULE",
  "UPPERCASE_SENTENCE_START",
  "FRENCH_WORD_REPEAT_BEGINNING_RULE",
  "TYPO_RULE", // Often misleading
]);

// Technical/business terms to ignore (SEO-sensitive)
const BLACKLIST_TERMS = [
  "apl", "rsa", "smic", "caf", "mdph",
  "impot", "revenu", "allocation", "aide",
  "taux", "montant", "calcul", "simulation",
  "salaire", "charges", "notaire", "frais",
  "credit", "pret", "hypotheque", "assurance",
  "2026", "2025", "2024", // Year references
];

// Content types to ignore (scripts, meta, JSON-LD)
function shouldIgnoreContext(context) {
  if (!context) return true;
  
  const lowerContext = context.toLowerCase();
  
  // Ignore script content
  if (lowerContext.includes("function(") || 
      lowerContext.includes("window[") ||
      lowerContext.includes("var f=d.get") ) {
    return true;
  }
  
  // Ignore JSON-LD schemas
  if (context.includes("@context") || 
      context.includes("@type") ||
      context.includes("schema.org")) {
    return true;
  }
  
  // Ignore Google Tag Manager
  if (lowerContext.includes("gtm") || 
      lowerContext.includes("dataLayer") ||
      lowerContext.includes("googletagmanager")) {
    return true;
  }
  
  // Ignore HTML attributes and meta tags
  if (context.includes("iframe") ||
      context.includes("meta ") ||
      context.includes("href=") ||
      context.includes("src=")) {
    return true;
  }
  
  return false;
}

// Check if error text contains blacklisted terms
function containsBlacklistTerm(text) {
  const lower = text.toLowerCase();
  return BLACKLIST_TERMS.some(term => lower.includes(term));
}

// Check if this is a safe/valuable error
function isValidError(error) {
  // Ignore if rule is blacklisted
  if (IGNORED_RULES.has(error.rule)) {
    return false;
  }
  
  // Ignore if context is technical/scripts
  if (shouldIgnoreContext(error.context)) {
    return false;
  }
  
  // Ignore if error text contains blacklisted terms
  if (containsBlacklistTerm(error.error)) {
    return false;
  }
  
  // Ignore single-letter errors (too ambiguous)
  if (error.error.length < 2) {
    return false;
  }
  
  // Ignore if no suggestions
  if (!error.suggestions || error.suggestions.length === 0) {
    return false;
  }
  
  // Ignore if error text is very long (likely false positive)
  if (error.error.length > 100) {
    return false;
  }
  
  // Only keep certain safe rules
  const SAFE_RULES = [
    "A_ACCENT",
    "A_A_ACCENT2",
    "APOS_M",
    "AGREEMENT_POSTPONED_ADJ",
    "MOIS",
    "DEUX_POINTS_ESPACE",
    "PLACE_ADJ",
    "PRONOMS_PERSONNELS_MINUSCULE",
    "ACCORD_SUJET_VERBE",
    "ACCORDER_VERBE_IMPERS",
  ];
  
  if (!SAFE_RULES.includes(error.rule) && !error.rule.startsWith("TYPO")) {
    return false;
  }
  
  return true;
}

console.log("📖 Loading error report...");
const allErrors = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
console.log(`📊 Total errors in report: ${allErrors.length}\n`);

// Filter errors
const filteredErrors = allErrors.filter(isValidError);

console.log(`✅ Errors after filtering: ${filteredErrors.length}`);
console.log(`🗑️  Removed: ${allErrors.length - filteredErrors.length}\n`);

// Analyze by rule
const byRule = {};
for (const error of filteredErrors) {
  byRule[error.rule] = (byRule[error.rule] || 0) + 1;
}

console.log("📈 Errors by rule:");
const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1]);
for (const [rule, count] of sortedRules) {
  console.log(`  ${rule}: ${count}`);
}

// Analyze by file
const byFile = {};
for (const error of filteredErrors) {
  byFile[error.file] = (byFile[error.file] || 0) + 1;
}

const topFiles = Object.entries(byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log("\n📄 Top 15 files with errors:");
for (const [file, count] of topFiles) {
  console.log(`  ${file}: ${count}`);
}

// Save filtered report
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredErrors, null, 2), "utf8");
console.log(`\n✨ Filtered report saved to: ${OUTPUT_FILE}`);
console.log(`\n📊 Summary:`);
console.log(`  Input: ${allErrors.length} errors`);
console.log(`  Output: ${filteredErrors.length} errors`);
console.log(`  Filtering rate: ${((1 - filteredErrors.length / allErrors.length) * 100).toFixed(1)}%`);
