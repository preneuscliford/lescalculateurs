const fs = require("fs-extra");
const glob = require("glob");

function splitSentences(text) {
  return text
    .split(/(?<=[\.\!\?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findRepeatsInText(text, minWords = 6) {
  const sents = splitSentences(text);
  const count = {};
  sents.forEach((s) => {
    const w = s.split(/\s+/);
    if (w.length >= minWords) {
      count[s] = (count[s] || 0) + 1;
    }
  });
  return Object.entries(count).filter(([s, c]) => c > 1);
}

function checkFolder(dir) {
  const files = glob.sync(`${dir}/**/*.{html,md}`);
  let fail = false;

  console.log("🔍 Checking repeated phrases...");

  const allSentences = {};

  for (const f of files) {
    const text = fs.readFileSync(f, "utf-8");
    const internal = findRepeatsInText(text);

    if (internal.length > 0) {
      fail = true;
      console.log("⚠ INTERNAL DUP:", f, internal.slice(0, 3));
    }

    // cross-file
    splitSentences(text).forEach((s) => {
      if (s.split(" ").length >= 6) {
        allSentences[s] = allSentences[s] || [];
        allSentences[s].push(f);
      }
    });
  }

  const cross = Object.entries(allSentences).filter(
    ([s, arr]) => arr.length > 1
  );

  if (cross.length > 0) {
    fail = true;
    console.log("⚠ CROSS-FILE DUP:", cross.slice(0, 3));
  }

  if (fail) process.exit(2);
  console.log("✓ No repeated phrases found");
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: node dupPhraseCheck.js <dir>");
    process.exit(1);
  }
  checkFolder(dir);
}
