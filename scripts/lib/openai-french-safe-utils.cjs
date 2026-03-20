const path = require("path");

const SAFE_CATEGORIES = new Set(["accent", "encodage", "espacement", "apostrophe"]);

function normalizeCompare(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function wordCount(value) {
  const normalized = normalizeCompare(value);
  return normalized ? normalized.split(/\s+/).length : 0;
}

function lengthDeltaTooLarge(original, corrected) {
  return Math.abs(String(corrected || "").length - String(original || "").length) > 24;
}

function wordDeltaTooLarge(original, corrected) {
  return Math.abs(wordCount(corrected) - wordCount(original)) > 2;
}

function looksLikeSentenceRewrite(original, corrected) {
  const originalNormalized = normalizeCompare(original);
  const correctedNormalized = normalizeCompare(corrected);

  if (!originalNormalized || !correctedNormalized) {
    return true;
  }

  if (originalNormalized.length > 90 || correctedNormalized.length > 110) {
    return true;
  }

  if (lengthDeltaTooLarge(originalNormalized, correctedNormalized)) {
    return true;
  }

  if (wordDeltaTooLarge(originalNormalized, correctedNormalized)) {
    return true;
  }

  return false;
}

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function alphaNumericSkeleton(value) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function looksLikeEncodedFragment(value) {
  return /&#?[a-z0-9]+;|[ÃÂâ�]/i.test(String(value || ""));
}

function isSafeIssue(issue) {
  if (!issue || issue.safe_to_apply !== true || issue.confidence !== "high") {
    return false;
  }

  if (!SAFE_CATEGORIES.has(issue.category)) {
    return false;
  }

  const original = normalizeCompare(issue.original);
  const corrected = normalizeCompare(issue.corrected);

  if (!original || !corrected || original === corrected) {
    return false;
  }

  if (looksLikeSentenceRewrite(original, corrected)) {
    return false;
  }

  const originalSkeleton = alphaNumericSkeleton(original);
  const correctedSkeleton = alphaNumericSkeleton(corrected);

  if (issue.category !== "encodage" && originalSkeleton !== correctedSkeleton) {
    return false;
  }

  if (
    issue.category === "encodage" &&
    !looksLikeEncodedFragment(original) &&
    originalSkeleton !== correctedSkeleton
  ) {
    return false;
  }

  return true;
}

function buildPublicUrl(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (!normalized.startsWith("src/pages/")) {
    return null;
  }

  let route = normalized.slice("src/pages/".length);
  if (route.endsWith("/index.html")) {
    route = route.slice(0, -"/index.html".length);
  } else if (route.endsWith(".html")) {
    route = route.slice(0, -".html".length);
  }

  return `/pages/${route}`;
}

function sortCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    const fileCompare = a.filePath.localeCompare(b.filePath);
    if (fileCompare !== 0) return fileCompare;
    return b.original.length - a.original.length;
  });
}

module.exports = {
  SAFE_CATEGORIES,
  buildPublicUrl,
  isSafeIssue,
  normalizeCompare,
  sortCandidates,
};
