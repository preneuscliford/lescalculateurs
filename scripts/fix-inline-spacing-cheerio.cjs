#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const INLINE_TAGS = ["a", "strong", "span", "em", "b", "i", "small", "sup", "sub", "code"];
const TEXT_CONTAINERS = ["p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote"];

const inlineOpenPattern = `<(?:${INLINE_TAGS.join("|")})\\b[^>]*>`;
const inlineClosePattern = `</(?:${INLINE_TAGS.join("|")})>`;

function normalizeInlineSpacing(fragment) {
  let next = fragment;

  // Insert a space before an inline tag when it is glued to a word or a closing punctuation.
  next = next.replace(new RegExp(`([\\p{L}\\p{N}%€$£»])(${inlineOpenPattern})`, "gu"), "$1 $2");

  // Insert a space after an inline tag when it is glued to a word, number, parenthesis or symbol.
  next = next.replace(new RegExp(`(${inlineClosePattern})([\\p{L}\\p{N}«(\\[~€$£])`, "gu"), "$1 $2");

  // Insert a space after punctuation before an inline tag.
  next = next.replace(new RegExp(`([:;!?»])(${inlineOpenPattern})`, "gu"), "$1 $2");

  // Remove accidental double spaces created around inline tags.
  next = next
    .replace(/[ \t]{2,}/g, " ")
    .replace(/>\s{2,}</g, "> <");

  return next;
}

function processFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(source, {
    decodeEntities: false,
    scriptingEnabled: false,
  });

  let changed = false;

  for (const selector of TEXT_CONTAINERS) {
    $(selector).each((_, element) => {
      const current = $(element).html();
      if (!current) return;
      if (!INLINE_TAGS.some((tag) => current.includes(`<${tag}`) || current.includes(`</${tag}>`))) return;

      const normalized = normalizeInlineSpacing(current);
      if (normalized !== current) {
        $(element).html(normalized);
        changed = true;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, $.html(), "utf8");
  }

  return changed;
}

function main() {
  const inputPaths = process.argv.slice(2);
  if (inputPaths.length === 0) {
    console.error("Usage: node scripts/fix-inline-spacing-cheerio.cjs <file> [file...]");
    process.exit(1);
  }

  let changedCount = 0;

  for (const inputPath of inputPaths) {
    const filePath = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(filePath)) {
      console.error(`Introuvable: ${filePath}`);
      process.exitCode = 1;
      continue;
    }

    const changed = processFile(filePath);
    if (changed) {
      changedCount += 1;
      console.log(`Corrige: ${path.relative(process.cwd(), filePath)}`);
    } else {
      console.log(`Aucun changement: ${path.relative(process.cwd(), filePath)}`);
    }
  }

  console.log(`Total fichiers modifies: ${changedCount}`);
}

main();
