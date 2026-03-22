#!/usr/bin/env node

/**
 * UTF-8 VALIDATION GATE (Security Barrier) - HARDENED
 * Prevents execution of corrupted scripts and HTML files
 * Uses actual mojibake TEXT PATTERNS (not byte patterns)
 */

const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

// Use the SAME mojibake patterns as UTF-8 quality scanner
// These are real mojibake sequences detected in corrupted files
const MOJIBAKE_PATTERNS = [
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a9",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a8",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00aa",
  "\u00c3\u0192\u00c6\u2019 ",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a2",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00b4",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a7",
  "\u00c3\u0192\u00c6\u2019\u00c3\u00a2\u201a\u00ac\u00c2\u00b0",
  "\u00c3\u0192\u00c6\u2019\u00c3\u00a2\u20ac\u0161\u00c2\u00ac",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u20ac\u017e\u00c2\u00a2",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u2026\u201c",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u201a\u00c2\u009d",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u201a\u00ac\u00c5\u201c",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u201a\u00ac\u00c2\u009d",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u201a\u00ac\u00c5\u00a1\u00c3\u201a\u00c2\u00ac",
  "\u00c3\u0192\u00c2\u00af\u00c3\u201a\u00c2\u00bb\u00c3\u201a\u00c2\u00bf",
];

const REPLACEMENT_CHAR = "\uFFFD";

function checkFileEncoding(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, reason: "File not found" };
  }

  try {
    const buffer = fs.readFileSync(filePath);

    // Try to decode as UTF-8
    let decoded;
    try {
      decoded = iconv.decode(buffer, "utf8");
    } catch (err) {
      return { valid: false, reason: `Decode error: ${err.message}` };
    }

    // Check for mojibake patterns in decoded text
    for (const pattern of MOJIBAKE_PATTERNS) {
      if (decoded.includes(pattern)) {
        return {
          valid: false,
          reason: `Mojibake sequence detected`,
        };
      }
    }

    // Check for replacement character
    if (decoded.includes(REPLACEMENT_CHAR)) {
      return { valid: false, reason: "Replacement character detected" };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      reason: `Read error: ${err.message}`,
    };
  }
}

function validateScriptBeforeExecution(scriptPath) {
  const result = checkFileEncoding(scriptPath);

  if (!result.valid) {
    console.error(`\n[SECURITY_GATE] ACCESS DENIED: ${path.basename(scriptPath)}`);
    console.error(`[REASON] ${result.reason}`);
    console.error(`\n[ACTION] Script is corrupted. Need UTF-8 cleanup.`);
    process.exit(1);
  }

  return true;
}

function validateBeforeLaunching(scriptPath) {
  return validateScriptBeforeExecution(scriptPath);
}

function validateAllScriptsInDirectory(dirPath) {
  const files = fs.readdirSync(dirPath).filter((f) => /\.(cjs|mjs|js)$/.test(f));

  let passCount = 0;
  let failCount = 0;
  const results = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const result = checkFileEncoding(fullPath);

    if (result.valid) {
      passCount++;
    } else {
      console.error(`[FAIL] ${file}: ${result.reason}`);
      failCount++;
      results.push({ file, ...result });
    }
  }

  return {
    passCount,
    failCount,
    allValid: failCount === 0,
    results,
  };
}

function collectHtmlFiles(baseDir) {
  const files = [];
  function traverse(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".html")) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  traverse(baseDir);
  return files;
}

function validateAllHtmlFiles(baseDirs = []) {
  if (baseDirs.length === 0) {
    baseDirs = [
      path.resolve(__dirname, "../content_SAFE"),
      path.resolve(__dirname, "../src/pages"),
    ];
  }

  let passCount = 0;
  let failCount = 0;
  const results = [];

  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) continue;

    const htmlFiles = collectHtmlFiles(baseDir);

    for (const filePath of htmlFiles) {
      const result = checkFileEncoding(filePath);

      if (result.valid) {
        passCount++;
      } else {
        failCount++;
        results.push({
          file: path.relative(process.cwd(), filePath),
          ...result,
        });
      }
    }
  }

  return {
    passCount,
    failCount,
    allValid: failCount === 0,
    results,
  };
}

// Export for use as module
module.exports = {
  checkFileEncoding,
  validateBeforeLaunching,
  validateScriptBeforeExecution,
  validateAllScriptsInDirectory,
  validateAllHtmlFiles,
  collectHtmlFiles,
};

if (require.main === module) {
  const scriptDir = path.dirname(__filename);
  const { passCount: scriptPass, failCount: scriptFail } = validateAllScriptsInDirectory(scriptDir);

  const { passCount: htmlPass, failCount: htmlFail, results: htmlResults } = validateAllHtmlFiles();

  console.log(`\n[UTF-8 GATE VALIDATION REPORT]`);
  console.log(`========================================`);
  console.log(`📄 Scripts: ${scriptPass} pass, ${scriptFail} fail`);
  console.log(`📝 HTML files: ${htmlPass} pass, ${htmlFail} fail`);
  console.log(`========================================\n`);

  if (htmlFail > 0) {
    console.error(`\n[ALERT] ${htmlFail} HTML file(s) with mojibake detected:`);
    htmlResults.slice(0, 10).forEach((r) => {
      console.error(`  - ${r.file}: ${r.reason}`);
    });
    if (htmlResults.length > 10) {
      console.error(`  ... and ${htmlResults.length - 10} more`);
    }
    console.error(`\n[ACTION] Run 'node scripts/fix-html-mojibake.cjs' to fix.`);
  }

  if (scriptFail > 0 || htmlFail > 0) {
    console.error(`\n[FAIL] Build BLOCKED: Corruption detected.`);
    process.exit(1);
  } else {
    console.log(`[PASS] All scripts and HTML files are clean. Build OK.`);
  }
}
