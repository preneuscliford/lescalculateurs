#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const REPORT = path.join(root, "reports", "duplication-fuzzy-report.json");
const PROMPT_FILE = path.join(__dirname, "deepseek-rephrase-prompt.txt");
const OUT_DIR = path.join(root, "reports", "deepseek-rephrase-requests");

function readEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return process.env;
  const txt = fs.readFileSync(envPath, "utf8");
  txt.split(/\r?\n/).forEach((line) => {
    const m = /^([^=]+)=(.*)$/.exec(line);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
  return process.env;
}

readEnv();

const API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || null;

if (!fs.existsSync(REPORT)) {
  console.error("Missing", REPORT);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
const clusterIndex = parseInt(process.argv[2] || "0");
const cluster = report.clusters[clusterIndex];

if (!cluster) {
  console.error("Cluster not found for index", clusterIndex);
  process.exit(3);
}

const norm = cluster.items[0].norm;
const numItems = cluster.items.length;

console.log(`Processing cluster ${clusterIndex}: ${norm}`);
console.log(`Number of items: ${numItems}`);

const prompt = `Generate ${
  numItems + 10
} unique rephrasings of the following sentence template: "${norm}"

Each rephrasing must:
- Maintain the exact meaning
- Vary the wording significantly
- Keep the placeholders "# #" exactly as they are
- Be grammatically correct French
- Be suitable for SEO and natural reading

Provide the output as a JSON array of strings, like: ["rephrasing1", "rephrasing2", ...]

Ensure all rephrasings are distinct and no duplicates.`;

(async function main() {
  try {
    if (!API_KEY) throw new Error("DEEPSEEK_API_KEY not set");

    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for generating text variations.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
    };

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const outPath = path.join(OUT_DIR, `rephrase-cluster-${clusterIndex}.json`);
    fs.writeFileSync(
      outPath,
      JSON.stringify({ payload, norm, numItems }, null, 2),
      "utf8"
    );
    console.log("Wrote request to", outPath);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();
    let content = data.choices[0].message.content;
    // Try to extract JSON array
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) content = jsonMatch[0];
    let rephrasings = JSON.parse(content);

    if (!Array.isArray(rephrasings) || rephrasings.length < numItems) {
      throw new Error(
        `Expected at least ${numItems} rephrasings, got ${rephrasings.length}`
      );
    }

    // Take only the first numItems
    rephrasings = rephrasings.slice(0, numItems);

    console.log("Generated rephrasings");

    // Now apply to files
    let regexPattern = norm.replace(/# #/g, "(.*?)");
    // Fix for superscript
    regexPattern = regexPattern.replace("au m s", "au m² s");
    // Make spaces flexible
    regexPattern = regexPattern.replace(/\s/g, "\\s*");
    const regex = new RegExp(`^${regexPattern}$`, "i");

    for (let i = 0; i < cluster.items.length; i++) {
      const item = cluster.items[i];
      const filePath = path.join(root, item.file);
      const orig = item.orig;

      let groups = [];
      if (norm.includes("# #")) {
        const match = orig.match(regex);
        if (!match) {
          console.error(`No match for ${orig} with ${regexPattern}`);
          continue;
        }
        groups = match.slice(1);
      } else {
        // For norms without placeholders, check normalized
        const normalizedOrig = orig
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (normalizedOrig !== norm) {
          console.error(
            `No match for ${orig} normalized ${normalizedOrig} vs ${norm}`
          );
          continue;
        }
      }

      let newSentence = rephrasings[i];
      for (let g = 0; g < groups.length; g++) {
        newSentence = newSentence.replace("# #", groups[g]);
      }

      // Read file
      let content = fs.readFileSync(filePath, "utf8");
      // Replace orig with newSentence
      content = content.replace(orig, newSentence);
      // Write back
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated ${item.file}`);
    }

    console.log("Done processing cluster");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
