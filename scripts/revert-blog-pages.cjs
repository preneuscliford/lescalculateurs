#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src/pages/blog");
const DEPT_DIR = path.join(BLOG_DIR, "departements");

function listHtml(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...listHtml(p));
    else if (it.isFile() && it.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function removeInsertedBlock(content) {
  return content.replace(/<div[^>]+id=["']dept-highlights["'][\s\S]*?<\/div>\s*/gi, "");
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf-8");
  let content = original;
  content = removeInsertedBlock(content);
  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

function main() {
  const files = [];
  if (fs.existsSync(DEPT_DIR)) files.push(...listHtml(DEPT_DIR));
  if (fs.existsSync(BLOG_DIR)) {
    for (const f of fs.readdirSync(BLOG_DIR)) {
      const p = path.join(BLOG_DIR, f);
      if (fs.statSync(p).isFile() && f.endsWith(".html")) files.push(p);
    }
  }
  let changed = 0;
  for (const f of files) {
    if (processFile(f)) changed++;
  }
  console.log(JSON.stringify({ files: files.length, changed }, null, 2));
}

main();

