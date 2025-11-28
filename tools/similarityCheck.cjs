const fs = require("fs-extra");
const glob = require("glob");
const natural = require("natural");

function stripHTML(html) {
  return html
    .replace(/<script.?>.?<\/script>/gis, "")
    .replace(/<style.?>.?<\/style>/gis, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function load(dir) {
  const files = glob.sync(`${dir}/**/*.{html,md}`);
  const docs = files.map((f) => stripHTML(fs.readFileSync(f, "utf8")));
  return { files, docs };
}

function tfidfSimilarity(docs) {
  const tfidf = new natural.TfIdf();
  docs.forEach((d, i) => tfidf.addDocument(d, i));

  const matrix = Array(docs.length)
    .fill(null)
    .map(() => Array(docs.length).fill(0));

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const terms = docs[i].split(/\s+/);
      let score = 0;
      terms.forEach((t) => {
        score += tfidf.tfidf(t, j) * tfidf.tfidf(t, i);
      });
      matrix[i][j] = score;
    }
  }
  return matrix;
}

function run(dir, threshold = 0.9) {
  const { files, docs } = load(dir);
  const sim = tfidfSimilarity(docs);

  let fail = false;

  console.log("🔍 Similarity check...");

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      if (sim[i][j] >= threshold) {
        fail = true;
        console.log(
          `⚠ HIGH SIMILARITY (${sim[i][j].toFixed(3)}) :`,
          files[i],
          "<->",
          files[j]
        );
      }
    }
  }

  if (fail) process.exit(3);

  console.log("✓ No high-similarity pairs found");
}

if (require.main === module) {
  const dir = process.argv[2];
  const threshold = parseFloat(process.argv[3] || "0.90");
  run(dir, threshold);
}
