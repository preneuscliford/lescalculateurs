const fs = require("fs");
const path = require("path");

const RULES_FILE = path.resolve(__dirname, "languagetool-ignore-rules.json");

function loadIgnoreRules() {
  if (!fs.existsSync(RULES_FILE)) {
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(RULES_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`Impossible de lire ${path.relative(process.cwd(), RULES_FILE)} : ${error.message}`);
  }
}

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getPrimaryReplacement(match) {
  return normalizeValue(match?.replacements?.[0]?.value || "");
}

function getMatchedText(text, match) {
  if (!text || typeof match?.offset !== "number" || typeof match?.length !== "number") {
    return "";
  }

  return normalizeValue(text.slice(match.offset, match.offset + match.length));
}

function matchesAnyString(value, candidates = []) {
  if (!value || !Array.isArray(candidates) || candidates.length === 0) {
    return false;
  }

  return candidates.some((candidate) => normalizeValue(candidate) === value);
}

function includesAnyString(value, candidates = []) {
  if (!value || !Array.isArray(candidates) || candidates.length === 0) {
    return false;
  }

  const lowered = value.toLowerCase();
  return candidates.some((candidate) => lowered.includes(normalizeValue(candidate).toLowerCase()));
}

function ruleMatches(rule, context) {
  const {
    filePath,
    message,
    matchedText,
    primaryReplacement,
    issueType,
  } = context;

  if (rule.pathIncludes && !includesAnyString(filePath, rule.pathIncludes)) {
    return false;
  }

  if (rule.messageEquals && normalizeValue(rule.messageEquals) !== message) {
    return false;
  }

  if (rule.messageIncludes && !message.toLowerCase().includes(normalizeValue(rule.messageIncludes).toLowerCase())) {
    return false;
  }

  if (rule.matchedTextEquals && normalizeValue(rule.matchedTextEquals) !== matchedText) {
    return false;
  }

  if (rule.matchedTextIn && !matchesAnyString(matchedText, rule.matchedTextIn)) {
    return false;
  }

  if (rule.matchedTextIncludes && !includesAnyString(matchedText, rule.matchedTextIncludes)) {
    return false;
  }

  if (rule.replacementEquals && normalizeValue(rule.replacementEquals) !== primaryReplacement) {
    return false;
  }

  if (rule.replacementIn && !matchesAnyString(primaryReplacement, rule.replacementIn)) {
    return false;
  }

  if (rule.issueTypeIn && !matchesAnyString(issueType, rule.issueTypeIn)) {
    return false;
  }

  return true;
}

function findIgnoreRule(filePath, text, match) {
  const rules = loadIgnoreRules();
  if (rules.length === 0) {
    return null;
  }

  const context = {
    filePath: normalizeValue(filePath),
    message: normalizeValue(match?.message || ""),
    matchedText: getMatchedText(text, match),
    primaryReplacement: getPrimaryReplacement(match),
    issueType: normalizeValue(match?.rule?.issueType || ""),
  };

  return rules.find((rule) => ruleMatches(rule, context)) || null;
}

module.exports = {
  findIgnoreRule,
  loadIgnoreRules,
};
