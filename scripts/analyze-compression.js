#!/usr/bin/env node
/**
 * Vérifie la minification et compression des fichiers CSS/JS
 * Analyse le répertoire dist après la build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const size = fs.statSync(filePath).size;

  // Vérifier la minification (pas de retours à la ligne inutiles, pas d'espaces)
  const isMinified = !content.includes("\n\n") && !content.match(/\n\s+/);

  return {
    path: filePath,
    size,
    isMinified,
    lines: content.split("\n").length,
  };
}

function analyzeDistFiles() {
  if (!fs.existsSync(distDir)) {
    console.log("⚠️  dist/ directory not found. Run `npm run build` first.");
    return;
  }

  const jsFiles = [];
  const cssFiles = [];

  try {
    const files = readdirSync(distDir, { recursive: true });

    for (const file of files) {
      if (file.endsWith(".js")) {
        jsFiles.push(path.join(distDir, file));
      } else if (file.endsWith(".css")) {
        cssFiles.push(path.join(distDir, file));
      }
    }

    console.log("📦 Minification & Compression Analysis\n");

    if (jsFiles.length > 0) {
      console.log("JavaScript Files:");
      jsFiles.forEach((file) => {
        const info = analyzeFile(file);
        const status = info.isMinified ? "✅" : "⚠️";
        const relPath = path.relative(distDir, info.path);
        console.log(
          `  ${status} ${relPath} (${info.size} bytes, ${info.lines} lines)`
        );
      });
    }

    if (cssFiles.length > 0) {
      console.log("\nCSS Files:");
      cssFiles.forEach((file) => {
        const info = analyzeFile(file);
        const status = info.isMinified ? "✅" : "⚠️";
        const relPath = path.relative(distDir, info.path);
        console.log(
          `  ${status} ${relPath} (${info.size} bytes, ${info.lines} lines)`
        );
      });
    }

    const unminified = [...jsFiles, ...cssFiles]
      .map((f) => analyzeFile(f))
      .filter((f) => !f.isMinified);

    if (unminified.length > 0) {
      console.log(`\n⚠️  ${unminified.length} file(s) not minified`);
    } else {
      console.log(`\n✅ All files are minified`);
    }
  } catch (error) {
    console.error("Error analyzing dist:", error.message);
  }
}

analyzeDistFiles();
