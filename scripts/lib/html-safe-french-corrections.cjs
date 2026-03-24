const cheerio = require("cheerio");

const SKIP_TAGS = new Set(["script", "style", "noscript", "template", "svg", "math"]);
const HIDDEN_TAGS = new Set(["head"]);
const CODE_PATTERNS = [
  /\b(?:const|let|var|function|return|class|import|export|if|else|for|while)\b/u,
  /=>/u,
  /[{}][^{}]*$/u,
  /<\/?[a-z][^>]*>/iu,
  /\b(?:https?:\/\/|www\.|mailto:)\S+/iu,
  /\b(?:gtag|dataLayer|schema\.org|@context|querySelector)\b/iu,
];
const SENSITIVE_PATTERNS = [
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/u,
  /\b\d[\d\s.,]*\s?(?:€|euros?|%|kWh|km|m2|m²)\b/iu,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu,
  /\b[A-Z]{2}\d{2}[A-Z0-9]{8,}\b/u,
];
const AMBIGUOUS_ACCENT_PAIRS = new Map([
  ["a", "à"],
  ["ou", "où"],
  ["des", "dès"],
  ["la", "là"],
]);

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isAmbiguousAccentPair(candidate, replacement) {
  const normalizedCandidate = normalizeWhitespace(candidate).toLowerCase();
  const normalizedReplacement = normalizeWhitespace(replacement).toLowerCase();

  return AMBIGUOUS_ACCENT_PAIRS.get(normalizedCandidate) === normalizedReplacement;
}

function getNodeParentTag(node) {
  return String(node?.parent?.name || "").toLowerCase();
}

function getTextNodes($, options = {}) {
  const { includeHead = false, minLength = 1 } = options;
  const nodes = [];

  function walk(node, state) {
    if (!node) return;

    const tagName = String(node.name || "").toLowerCase();
    const inSkippedBranch = state.skip || SKIP_TAGS.has(tagName);
    const inHiddenBranch = state.hidden || (!includeHead && HIDDEN_TAGS.has(tagName));

    if (node.type === "text" && !inSkippedBranch && !inHiddenBranch) {
      const text = String(node.data || "");
      if (normalizeWhitespace(text).length >= minLength) {
        nodes.push({
          node,
          text,
          parentTag: getNodeParentTag(node),
        });
      }
    }

    for (const child of node.children || []) {
      walk(child, {
        skip: inSkippedBranch,
        hidden: inHiddenBranch,
      });
    }
  }

  const roots = $("body").length > 0 ? $("body").toArray() : $.root().toArray();
  for (const root of roots) {
    walk(root, { skip: false, hidden: false });
  }

  return nodes;
}

function shouldIgnore(text, options = {}) {
  const normalized = normalizeWhitespace(text);
  const minLength = options.minLength ?? 3;

  if (!normalized || normalized.length < minLength) {
    return true;
  }

  if (/^[\d\s€$£%.,:;!/?()[\]+-]+$/u.test(normalized)) {
    return true;
  }

  if (CODE_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  return false;
}

function extractSuggestions(issue) {
  if (Array.isArray(issue?.suggestions)) {
    return issue.suggestions.filter(Boolean).map(String);
  }

  if (Array.isArray(issue?.replacements)) {
    return issue.replacements.map((replacement) => replacement?.value).filter(Boolean).map(String);
  }

  return [];
}

function extractContext(issue) {
  if (typeof issue?.context === "string") {
    return {
      text: issue.context,
      offset: null,
      length: null,
    };
  }

  if (issue?.context && typeof issue.context.text === "string") {
    return {
      text: issue.context.text,
      offset: Number.isInteger(issue.context.offset) ? issue.context.offset : null,
      length: Number.isInteger(issue.context.length) ? issue.context.length : null,
    };
  }

  return {
    text: typeof issue?.text === "string" ? issue.text : "",
    offset: null,
    length: null,
  };
}

function buildOriginalCandidates(issue) {
  const candidates = new Set();
  const { text: contextText, offset, length } = extractContext(issue);

  if (typeof issue?.error === "string" && normalizeWhitespace(issue.error)) {
    candidates.add(issue.error);
  }

  if (typeof issue?.original === "string" && normalizeWhitespace(issue.original)) {
    candidates.add(issue.original);
  }

  if (
    contextText &&
    Number.isInteger(offset) &&
    Number.isInteger(length) &&
    offset >= 0 &&
    length > 0 &&
    offset + length <= contextText.length
  ) {
    candidates.add(contextText.slice(offset, offset + length));
  }

  if (
    contextText &&
    issue?.position &&
    Number.isInteger(issue.position.start) &&
    Number.isInteger(issue.position.end) &&
    issue.position.start >= 0 &&
    issue.position.end > issue.position.start &&
    issue.position.end <= contextText.length
  ) {
    candidates.add(contextText.slice(issue.position.start, issue.position.end));
  }

  return Array.from(candidates)
    .map((candidate) => candidate.replace(/\u00a0/g, " ").trim())
    .filter((candidate) => candidate.length > 0)
    .sort((left, right) => right.length - left.length);
}

function buildBoundaryPattern(candidate) {
  const escaped = escapeRegex(candidate).replace(/\s+/g, "\\s+");
  return `(?<![\\p{L}\\p{N}_-])${escaped}(?![\\p{L}\\p{N}_-])`;
}

function findOccurrences(text, candidate) {
  const matches = [];
  const pattern = new RegExp(buildBoundaryPattern(candidate), "giu");
  let match = pattern.exec(text);

  while (match) {
    matches.push({
      candidate,
      start: match.index,
      end: match.index + match[0].length,
      raw: match[0],
    });
    match = pattern.exec(text);
  }

  return matches;
}

function lastTokens(value, count = 2) {
  return normalizeWhitespace(value).split(" ").filter(Boolean).slice(-count).join(" ");
}

function firstTokens(value, count = 2) {
  return normalizeWhitespace(value).split(" ").filter(Boolean).slice(0, count).join(" ");
}

function buildAnchors(issue, candidate) {
  const { text: contextText } = extractContext(issue);
  if (!contextText) {
    return { prefix: "", suffix: "" };
  }

  const directIndex = contextText.indexOf(candidate);
  if (directIndex >= 0) {
    return {
      prefix: normalizeWhitespace(contextText.slice(Math.max(0, directIndex - 40), directIndex)),
      suffix: normalizeWhitespace(contextText.slice(directIndex + candidate.length, directIndex + candidate.length + 40)),
    };
  }

  return {
    prefix: "",
    suffix: "",
  };
}

function scoreOccurrence(text, occurrence, anchors) {
  let score = 0;

  if (!anchors.prefix && !anchors.suffix) {
    return score;
  }

  const before = normalizeWhitespace(text.slice(Math.max(0, occurrence.start - 50), occurrence.start));
  const after = normalizeWhitespace(text.slice(occurrence.end, occurrence.end + 50));

  if (anchors.prefix) {
    if (before.includes(anchors.prefix)) {
      score += 4;
    } else if (lastTokens(before, 2) === lastTokens(anchors.prefix, 2)) {
      score += 2;
    }
  }

  if (anchors.suffix) {
    if (after.includes(anchors.suffix)) {
      score += 4;
    } else if (firstTokens(after, 2) === firstTokens(anchors.suffix, 2)) {
      score += 2;
    }
  }

  return score;
}

function selectOccurrence(text, issue) {
  const candidates = buildOriginalCandidates(issue);

  for (const candidate of candidates) {
    const occurrences = findOccurrences(text, candidate);
    if (occurrences.length === 0) {
      continue;
    }

    if (occurrences.length === 1) {
      return occurrences[0];
    }

    const anchors = buildAnchors(issue, candidate);
    const scored = occurrences
      .map((occurrence) => ({
        ...occurrence,
        score: scoreOccurrence(text, occurrence, anchors),
      }))
      .sort((left, right) => right.score - left.score);

    if (scored[0]?.score > 0 && scored[0].score > (scored[1]?.score ?? -1)) {
      return scored[0];
    }
  }

  return null;
}

function isSafe(input) {
  const original = String(input?.original || "");
  const candidate = String(input?.candidate || "");
  const replacement = String(input?.replacement || "");
  const updated = String(input?.updated || "");

  if (!candidate || !replacement || candidate === replacement) {
    return false;
  }

  if (isAmbiguousAccentPair(candidate, replacement)) {
    return false;
  }

  if (candidate.length > 80 || replacement.length > 120) {
    return false;
  }

  if (/[<>]/u.test(candidate) || /[<>]/u.test(replacement) || /[<>]/u.test(updated)) {
    return false;
  }

  if (/\d/u.test(candidate) || /\d/u.test(replacement) || /[€%]/u.test(candidate) || /[€%]/u.test(replacement)) {
    return false;
  }

  if (CODE_PATTERNS.some((pattern) => pattern.test(candidate) || pattern.test(replacement))) {
    return false;
  }

  const diff = Math.abs(updated.length - original.length);
  if (diff > 20) {
    return false;
  }

  return true;
}

function applyCorrectionsSafe(text, issues, options = {}) {
  let updated = String(text || "");
  const applied = [];
  const rejected = [];

  for (const issue of issues) {
    const replacement = extractSuggestions(issue)[0];
    if (!replacement) {
      rejected.push({ issue, reason: "missing_suggestion" });
      continue;
    }

    const occurrence = selectOccurrence(updated, issue);
    if (!occurrence) {
      rejected.push({ issue, reason: "target_not_found" });
      continue;
    }

    const nextValue =
      updated.slice(0, occurrence.start) + replacement + updated.slice(occurrence.end);

    if (
      !isSafe({
        original: updated,
        candidate: occurrence.raw,
        replacement,
        updated: nextValue,
      })
    ) {
      rejected.push({ issue, reason: "unsafe_replacement" });
      continue;
    }

    if (options.maxLengthDelta != null) {
      const delta = Math.abs(nextValue.length - updated.length);
      if (delta > options.maxLengthDelta) {
        rejected.push({ issue, reason: "length_delta_exceeded" });
        continue;
      }
    }

    updated = nextValue;
    applied.push({
      issue,
      original: occurrence.raw,
      replacement,
    });
  }

  return {
    updated,
    applied,
    rejected,
  };
}

function scoreNode(text, issue) {
  let score = 0;
  const normalizedText = normalizeWhitespace(text);
  const normalizedIssueText = normalizeWhitespace(issue?.text || "");
  const normalizedContext = normalizeWhitespace(extractContext(issue).text);

  if (normalizedIssueText) {
    if (normalizedText === normalizedIssueText) {
      score += 100;
    } else if (normalizedText.includes(normalizedIssueText)) {
      score += 40;
    }
  }

  if (normalizedContext) {
    if (normalizedText === normalizedContext) {
      score += 80;
    } else if (normalizedText.includes(normalizedContext)) {
      score += 30;
    }
  }

  const candidates = buildOriginalCandidates(issue);
  for (const candidate of candidates) {
    if (findOccurrences(text, candidate).length > 0) {
      score += 10 + Math.min(candidate.length, 20);
      break;
    }
  }

  return score;
}

function selectNode(entries, issue, options = {}) {
  const scored = entries
    .filter((entry) => !shouldIgnore(entry.node.data, options))
    .map((entry, index) => ({
      entry,
      index,
      score: scoreNode(entry.node.data, issue),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return null;
  }

  if (scored.length > 1 && scored[0].score === scored[1].score) {
    return null;
  }

  return scored[0].entry;
}

function preserveDoctype(originalHtml, renderedHtml) {
  const doctypeMatch = originalHtml.match(/^\s*<!doctype[^>]*>\s*/i);
  if (!doctypeMatch || /^<!doctype/i.test(renderedHtml)) {
    return renderedHtml;
  }

  return `${doctypeMatch[0]}${renderedHtml}`;
}

function applyCorrectionsToHtml(html, issues, options = {}) {
  const $ = cheerio.load(html, {
    decodeEntities: false,
  });
  const entries = getTextNodes($, options);
  const applied = [];
  const rejected = [];

  for (const issue of issues) {
    const entry = selectNode(entries, issue, options);
    if (!entry) {
      rejected.push({ issue, reason: "node_not_found" });
      continue;
    }

    const result = applyCorrectionsSafe(entry.node.data, [issue], options);
    if (result.applied.length === 0) {
      rejected.push(...result.rejected);
      continue;
    }

    entry.node.data = result.updated;
    applied.push(...result.applied);
  }

  return {
    html: preserveDoctype(html, $.html()),
    applied,
    rejected,
  };
}

module.exports = {
  applyCorrectionsSafe,
  applyCorrectionsToHtml,
  getTextNodes,
  isSafe,
  shouldIgnore,
};
