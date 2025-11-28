#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { setTimeout: wait } = require("timers/promises");

const root = path.resolve(__dirname, "..");
const CLEAN = path.join(root, "reports", "duplication-fuzzy-clean.json");
const REPORT = path.join(root, "reports", "duplication-fuzzy-report.json");
const OUT_DIR = path.join(root, "reports", "deepseek-requests");
const PAGES_DIR = path.join(root, "src", "pages", "blog", "departements");

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

if (!fs.existsSync(CLEAN)) {
  console.error("Missing", CLEAN);
  process.exit(2);
}

if (!fs.existsSync(REPORT)) {
  console.error("Missing", REPORT);
  process.exit(2);
}

const clean = JSON.parse(fs.readFileSync(CLEAN, "utf8"));
const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
const utils = require(path.join(__dirname, "deepseek-utils.cjs"));

const clusterIndex = parseInt(process.argv[2] || "0");

if (clusterIndex >= report.clusters.length) {
  console.error(
    "Cluster index out of range",
    clusterIndex,
    "max",
    report.clusters.length - 1
  );
  process.exit(3);
}

const cluster = report.clusters[clusterIndex];
console.log(
  `Processing cluster ${clusterIndex} with ${cluster.items.length} items`
);

(async function main() {
  for (const item of cluster.items) {
    const code = item.code;
    const deptItem = clean.find((it) => {
      const codeRaw = String(
        it.code || it.departement_numero || it.departement || ""
      ).toUpperCase();
      const safe = codeRaw.replace(/\s+/g, "").replace(/\W+/g, "");
      return safe === code;
    });

    if (!deptItem) {
      console.error("Department not found for code", code);
      continue;
    }

    const deptName = deptItem.nom || deptItem.departement_nom || "";
    const origSentence = item.orig;

    // Build prompt for rephrasing
    const prompt = `Tu es un expert immobilier français. Rephrase cette phrase de manière unique et naturelle pour le département ${deptName}, en gardant le sens exact, les chiffres et le contexte des frais de notaire 2025. Varie les mots et la structure sans changer les informations factuelles.

Phrase originale : "${origSentence}"

Réponds uniquement avec la phrase rephrasée, sans guillemets ni explications.`;

    const messages = [{ role: "user", content: prompt }];

    const payload = {
      model: "deepseek-chat",
      messages,
      max_tokens: 200,
      temperature: 0.7,
    };

    const requestFile = path.join(
      OUT_DIR,
      `request-cluster-${clusterIndex}-${code}.json`
    );
    fs.writeFileSync(requestFile, JSON.stringify(payload, null, 2));

    console.log(`Calling DeepSeek for ${code}...`);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Error for ${code}:`, response.status, response.statusText);
      continue;
    }

    const data = await response.json();
    const rephrased = data.choices[0].message.content.trim();

    console.log(`Rephrased for ${code}: ${rephrased}`);

    // Now replace in the file
    const filePath = path.join(root, item.file.replace(/\\/g, "/"));
    if (!fs.existsSync(filePath)) {
      console.error("File not found", filePath);
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");
    // For table headers, replace the thead
    if (origSentence.includes("Type d'achat")) {
      const theadRegex = /<thead[^>]*>[\s\S]*?<\/thead>/i;
      const newThead = `<thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><tr><th class="px-6 py-4 text-left font-semibold" colspan="3">${rephrased}</th></tr></thead>`;
      content = content.replace(theadRegex, newThead);
    } else if (origSentence.includes("Privilégier un jeune notaire")) {
      // find the p after "Privilégier un jeune notaire"
      const h3Index = content.indexOf(
        '<h3 class="font-bold text-gray-900 mb-2">Privilégier un jeune notaire</h3>'
      );
      if (h3Index !== -1) {
        const pStart = content.indexOf(
          '<p class="text-sm text-gray-600">',
          h3Index
        );
        if (pStart !== -1) {
          const pEnd = content.indexOf("</p>", pStart);
          if (pEnd !== -1) {
            const oldP = content.substring(pStart, pEnd + 4);
            const newP =
              '<p class="text-sm text-gray-600">' + rephrased + "</p>";
            content = content.replace(oldP, newP);
          }
        }
      }
    } else {
      // Escape special regex chars in origSentence
      const escapedOrig = origSentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedOrig, "g");
      content = content.replace(regex, rephrased);
    }

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated ${filePath}`);

    // Wait a bit to avoid rate limits
    await wait(1000);
  }

  console.log(`Cluster ${clusterIndex} processed.`);
})();
