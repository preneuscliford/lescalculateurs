#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { decodeText, writeTextFile } = require("./encoding.cjs");

function walk(dir, onFile) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) walk(p, onFile);
    else if (it.isFile()) onFile(p);
  }
}

function main() {
  const args = process.argv.slice(2);
  const roots = args.length ? args : ["src/pages/blog"];

  let total = 0;
  let converted = 0;
  const convertedFiles = [];

  for (const root of roots) {
    const abs = path.resolve(process.cwd(), root);
    if (!fs.existsSync(abs)) continue;

    walk(abs, (filePath) => {
      if (!filePath.toLowerCase().endsWith(".html")) return;
      total++;
      const buf = fs.readFileSync(filePath);
      const { text, encoding } = decodeText(buf);
      if (encoding !== "utf8") {
        writeTextFile(filePath, text);
        converted++;
        convertedFiles.push(path.relative(process.cwd(), filePath));
      }
    });
  }

  console.log(
    JSON.stringify(
      { roots, totalHtmlFiles: total, convertedFiles: converted, files: convertedFiles },
      null,
      2,
    ),
  );
}

main();

