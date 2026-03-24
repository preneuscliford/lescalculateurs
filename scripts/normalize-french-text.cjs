#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parse5 = require("parse5");
const { collectFiles } = require("./lib/text-file-scopes.cjs");
const { normalizeFrenchText } = require("./lib/french-normalization.cjs");

const SEO_META_NAMES = new Set([
  "description",
  "keywords",
  "twitter:title",
  "twitter:description",
  "og:title",
  "og:description",
]);

const SKIP_TEXT_TAGS = new Set(["script", "style", "noscript", "template"]);
const INLINE_TEXT_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "cite",
  "code",
  "em",
  "i",
  "kbd",
  "label",
  "mark",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
]);
const WORD_CHAR_RE = /[\p{L}\p{N}]/u;
const POSTFIX_SPACE_RE = /[.,):;!?%€»…]/u;
const PREFIX_SPACE_RE = /[\p{L}\p{N}"«(~%€]/u;

function parseArgs() {
  const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
  const htmlModeArg = process.argv.find((arg) => arg.startsWith("--html-mode="));

  return {
    scope: scopeArg ? scopeArg.split("=")[1] : "pseo-rendered",
    htmlMode: htmlModeArg ? htmlModeArg.split("=")[1] : "visible",
    write: process.argv.includes("--write"),
    check: process.argv.includes("--check"),
  };
}

function applyReplacements(source, replacements) {
  if (replacements.length === 0) return source;

  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let output = source;

  for (const replacement of sorted) {
    output =
      output.slice(0, replacement.start) +
      replacement.value +
      output.slice(replacement.end);
  }

  return output;
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isTextNode(node) {
  return node?.nodeName === "#text" && node.sourceCodeLocation;
}

function isSkippableNode(node) {
  return SKIP_TEXT_TAGS.has(String(node?.tagName || "").toLowerCase());
}

function isInlineTextNode(node) {
  if (isTextNode(node)) {
    return true;
  }
  return INLINE_TEXT_TAGS.has(String(node?.tagName || "").toLowerCase());
}

function getFirstTextDescendant(node) {
  if (!node || isSkippableNode(node)) {
    return null;
  }
  if (isTextNode(node)) {
    return node;
  }
  for (const child of node.childNodes || []) {
    const match = getFirstTextDescendant(child);
    if (match) {
      return match;
    }
  }
  return null;
}

function getLastTextDescendant(node) {
  if (!node || isSkippableNode(node)) {
    return null;
  }
  if (isTextNode(node)) {
    return node;
  }
  const children = node.childNodes || [];
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const match = getLastTextDescendant(children[index]);
    if (match) {
      return match;
    }
  }
  return null;
}

function getLastVisibleChar(text) {
  const trimmed = String(text || "").replace(/\s+$/u, "");
  return trimmed ? trimmed.charAt(trimmed.length - 1) : "";
}

function getFirstVisibleChar(text) {
  const trimmed = String(text || "").replace(/^\s+/u, "");
  return trimmed ? trimmed.charAt(0) : "";
}

function needsBoundarySpace(leftText, rightText) {
  const leftChar = getLastVisibleChar(leftText);
  const rightChar = getFirstVisibleChar(rightText);

  if (!leftChar || !rightChar) {
    return false;
  }

  if (WORD_CHAR_RE.test(leftChar) && WORD_CHAR_RE.test(rightChar)) {
    return true;
  }

  if (WORD_CHAR_RE.test(leftChar) && PREFIX_SPACE_RE.test(rightChar)) {
    return true;
  }

  if (POSTFIX_SPACE_RE.test(leftChar) && WORD_CHAR_RE.test(rightChar)) {
    return true;
  }

  return false;
}

function markTextBoundary(textAdjustments, textNode, side) {
  if (!textNode?.sourceCodeLocation) {
    return;
  }

  const key = `${textNode.sourceCodeLocation.startOffset}:${textNode.sourceCodeLocation.endOffset}`;
  const existing = textAdjustments.get(key) || {
    location: textNode.sourceCodeLocation,
    rawValue: textNode.value,
    trimLeading: false,
    trimTrailing: false,
    leadingSpace: false,
    trailingSpace: false,
  };

  if (side === "trimLeading") {
    existing.trimLeading = true;
  }

  if (side === "trimTrailing") {
    existing.trimTrailing = true;
  }

  if (side === "leading") {
    existing.leadingSpace = true;
  }

  if (side === "trailing") {
    existing.trailingSpace = true;
  }

  textAdjustments.set(key, existing);
}

function buildBoundaryReplacements(textAdjustments) {
  const replacements = [];

  for (const adjustment of textAdjustments.values()) {
    let nextValue = adjustment.rawValue;

    if (adjustment.trimLeading) {
      nextValue = nextValue.replace(/^\s+/u, "");
    }

    if (adjustment.trimTrailing) {
      nextValue = nextValue.replace(/\s+$/u, "");
    }

    if (adjustment.leadingSpace && /^\S/u.test(nextValue)) {
      nextValue = ` ${nextValue}`;
    }

    if (adjustment.trailingSpace && /\S$/u.test(nextValue)) {
      nextValue = `${nextValue} `;
    }

    if (nextValue !== adjustment.rawValue) {
      replacements.push({
        start: adjustment.location.startOffset,
        end: adjustment.location.endOffset,
        value: escapeHtmlText(nextValue),
      });
    }
  }

  return replacements;
}

function normalizeHtmlByOffsets(html, htmlMode) {
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });
  const replacements = [];
  const textAdjustments = new Map();

  function queueTextReplacement(location, rawValue) {
    const normalized = normalizeFrenchText(rawValue, { preserveOuterWhitespace: true });
    const escapedNormalized = escapeHtmlText(normalized);
    const rawSource = html.slice(location.startOffset, location.endOffset);
    if (escapedNormalized !== rawSource) {
      replacements.push({
        start: location.startOffset,
        end: location.endOffset,
        value: escapedNormalized,
      });
    }
  }

  function queueAttributeReplacement(location, rawAttribute, attributeName) {
    const match = rawAttribute.match(/^([^\s=]+)(\s*=\s*)(["'])([\s\S]*)(\3)$/);
    if (!match) return;
    if (match[1].toLowerCase() !== attributeName.toLowerCase()) return;

    const normalized = normalizeFrenchText(match[4]);
    if (normalized === match[4]) return;

    replacements.push({
      start: location.startOffset,
      end: location.endOffset,
      value: `${match[1]}${match[2]}${match[3]}${normalized}${match[5]}`,
    });
  }

  function walk(node, state) {
    const nextState = { ...state };

    if (node.tagName) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === "head") nextState.inHead = true;
      if (tagName === "body") nextState.inHead = false;

      if (["script", "style", "noscript", "template"].includes(tagName)) {
        nextState.skipText = true;
      }

      if (htmlMode === "seo" || htmlMode === "all") {
        if (tagName === "meta" && node.sourceCodeLocation?.attrs?.content) {
          const metaName =
            (node.attrs || []).find((attr) => attr.name === "name")?.value ||
            (node.attrs || []).find((attr) => attr.name === "property")?.value ||
            "";

          if (SEO_META_NAMES.has(metaName.toLowerCase())) {
            const rawAttribute = html.slice(
              node.sourceCodeLocation.attrs.content.startOffset,
              node.sourceCodeLocation.attrs.content.endOffset,
            );
            queueAttributeReplacement(node.sourceCodeLocation.attrs.content, rawAttribute, "content");
          }
        }
      }
    }

    if (node.nodeName === "#text" && node.sourceCodeLocation) {
      const isVisible = !nextState.inHead && !nextState.skipText;
      const isSeoTitle = nextState.inHead && nextState.currentTag === "title";

      if ((htmlMode === "visible" || htmlMode === "all") && isVisible) {
        queueTextReplacement(node.sourceCodeLocation, node.value);
      }

      if ((htmlMode === "seo" || htmlMode === "all") && isSeoTitle) {
        queueTextReplacement(node.sourceCodeLocation, node.value);
      }
    }

    const currentTag = node.tagName ? node.tagName.toLowerCase() : nextState.currentTag;

    if ((htmlMode === "visible" || htmlMode === "all") && !nextState.inHead && !nextState.skipText) {
      const visibleChildren = (node.childNodes || []).filter((child) => !isSkippableNode(child));
      for (let index = 0; index < visibleChildren.length - 1; index += 1) {
        const leftNode = visibleChildren[index];
        const rightNode = visibleChildren[index + 1];

        if (!isInlineTextNode(leftNode) || !isInlineTextNode(rightNode)) {
          continue;
        }

        const leftTextNode = getLastTextDescendant(leftNode);
        const rightTextNode = getFirstTextDescendant(rightNode);

        if (!leftTextNode || !rightTextNode) {
          continue;
        }

        if (needsBoundarySpace(leftTextNode.value, rightTextNode.value)) {
          if (isTextNode(leftNode)) {
            markTextBoundary(textAdjustments, leftTextNode, "trailing");
            if (!isTextNode(rightNode)) {
              markTextBoundary(textAdjustments, rightTextNode, "trimLeading");
            }
          } else if (isTextNode(rightNode)) {
            markTextBoundary(textAdjustments, rightTextNode, "leading");
            markTextBoundary(textAdjustments, leftTextNode, "trimTrailing");
          } else {
            markTextBoundary(textAdjustments, leftTextNode, "trimTrailing");
            markTextBoundary(textAdjustments, rightTextNode, "trimLeading");
            markTextBoundary(textAdjustments, rightTextNode, "leading");
          }
        }
      }
    }

    for (const child of node.childNodes || []) {
      walk(child, {
        ...nextState,
        currentTag,
      });
    }
  }

  walk(document, {
    inHead: false,
    skipText: false,
    currentTag: "",
  });

  replacements.push(...buildBoundaryReplacements(textAdjustments));
  return applyReplacements(html, replacements);
}

function main() {
  const { scope, htmlMode, write, check } = parseArgs();
  const files = collectFiles(scope);
  const changedFiles = [];

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, "utf8");
    const extension = path.extname(filePath).toLowerCase();
    if (htmlMode !== "all" && extension !== ".html") {
      continue;
    }
    const normalized =
      extension === ".html" ? normalizeHtmlByOffsets(original, htmlMode) : normalizeFrenchText(original);

    if (normalized !== original) {
      changedFiles.push(filePath);
      if (write) {
        fs.writeFileSync(filePath, normalized, "utf8");
      }
    }
  }

  if (check) {
    if (changedFiles.length === 0) {
      console.log(`Normalisation FR OK: ${files.length} fichiers (${scope}, mode=${htmlMode})`);
      return;
    }

    console.error(
      `Normalisation FR requise: ${changedFiles.length} fichier(s) sur ${scope} (mode=${htmlMode})`,
    );
    for (const filePath of changedFiles.slice(0, 50)) {
      console.error(`- ${path.relative(process.cwd(), filePath)}`);
    }
    process.exit(1);
  }

  console.log(
    `Normalisation FR ${write ? "appliquee" : "analysee"}: ${changedFiles.length} fichier(s) sur ${files.length} (mode=${htmlMode})`,
  );
}

main();
