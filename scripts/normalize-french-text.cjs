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

function normalizeHtmlByOffsets(html, htmlMode) {
  const document = parse5.parse(html, { sourceCodeLocationInfo: true });
  const replacements = [];

  function queueTextReplacement(location, rawValue) {
    const normalized = normalizeFrenchText(rawValue);
    if (normalized !== rawValue) {
      replacements.push({
        start: location.startOffset,
        end: location.endOffset,
        value: normalized,
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
