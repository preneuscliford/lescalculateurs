const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https"); // Using standard https module

const LT_URL = "https://api.languagetool.org/v2/check";
const DELAY_MS = 100; // Reduced for faster scanning
const SRC_DIR = path.resolve(__dirname, "../content_SAFE");
const OUTPUT_FILE = path.resolve(__dirname, "../french-errors-report.json");
const MAX_PARALLEL = 5;

// --- Helper Functions ---

function languageToolCheck(text) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ text, language: "fr" });
    const url = `${LT_URL}?${params}`;

    const req = https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
          }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function getTextNodes($) {
  const nodes = [];
  function walk(node) {
    if (node.type === "text") {
      const text = node.data;
      if (text && text.trim().length > 1) { // Only process non-trivial text
        nodes.push(node);
      }
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }
  walk($.root()[0]);
  return nodes;
}

// --- Main Logic ---

async function scanFile(filePath, relativePath) {
  const fileErrors = [];
  try {
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html, { decodeEntities: false });
    const textNodes = getTextNodes($);

    for (const node of textNodes) {
      const text = node.data;
      
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      const ltResult = await languageToolCheck(text);

      if (ltResult.matches && ltResult.matches.length > 0) {
        ltResult.matches.forEach(match => {
          const error = {
            file: relativePath,
            text: match.context.text,
            error: match.context.text.substring(match.offset, match.offset + match.length),
            suggestions: match.replacements.map(r => r.value),
            rule: match.rule.id,
            position: {
              start: match.offset,
              end: match.offset + match.length
            },
            context: match.context.text,
          };
          fileErrors.push(error);
        });
      }
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${relativePath}: ${error.message}`);
  }
  return fileErrors;
}

function getFilesRecursive(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getFilesRecursive(fullPath));
    } else if (item.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function runParallel(files) {
  const allErrors = [];
  const totalFiles = files.length;
  let processedCount = 0;

  for (let i = 0; i < files.length; i += MAX_PARALLEL) {
    const batch = files.slice(i, i + MAX_PARALLEL);
    const batchPromises = batch.map(async (filePath) => {
      const relativePath = path.relative(path.resolve(__dirname, ".."), filePath);
      try {
        const fileErrors = await scanFile(filePath, relativePath);
        processedCount++;
        const progress = `[${processedCount}/${totalFiles}]`;
        if (fileErrors.length > 0) {
          console.log(`${progress} ✅ ${path.basename(filePath)} (${fileErrors.length} errors)`);
          return fileErrors;
        } else {
          console.log(`${progress} 👍 ${path.basename(filePath)}`);
          return [];
        }
      } catch (error) {
        processedCount++;
        console.log(`[${processedCount}/${totalFiles}] ❌ ${path.basename(filePath)}: ${error.message}`);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      allErrors.push(...result);
    }
  }
  return allErrors;
}

async function run() {
  console.log("🚀 Starting French grammar scan...");
  console.log(`Source directory: ${SRC_DIR}\n`);

  const files = getFilesRecursive(SRC_DIR);

  if (files.length === 0) {
    console.log("No HTML files found to scan.");
    return;
  }

  console.log(`Found ${files.length} HTML files to scan\n`);

  const allErrors = await runParallel(files);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allErrors, null, 2), "utf8");
  console.log(`\n\n✨ Scan complete! Report saved to: ${OUTPUT_FILE}`);
  console.log(`Total potential errors found: ${allErrors.length}`);
}

run().catch(console.error);
