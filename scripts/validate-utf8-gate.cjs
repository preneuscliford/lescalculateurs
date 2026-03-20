#!/usr/bin/env node

/**
 * UTF-8 VALIDATION GATE (Security Barrier)
 * Prevents execution of corrupted scripts
 */

const fs = require("fs");
const path = require("path");

process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

// Corruption patterns as BYTES ONLY (no regex that can get corrupted)
const CORRUPTION_PATTERNS = [
  // Emoji corruption (UTF-8 double-decode)
  Buffer.from([0xc3, 0xb0, 0xc2, 0x9f]), // ðŸ
  // Accents corruption
  Buffer.from([0xc3, 0xa9]), // e
  Buffer.from([0xc3, 0xa0]), // a
  Buffer.from([0xc3, 0xa8]), // e
  Buffer.from([0xc3, 0xaa]), // e
  Buffer.from([0xc3, 0xa7]), // c
  Buffer.from([0xc3, 0xb9]), // u
  Buffer.from([0xc3, 0xb4]), // o
  Buffer.from([0xc3, 0xb2]), // o
  Buffer.from([0xc3, 0xac]), // i
  Buffer.from([0xc3, 0x89]), // E
  Buffer.from([0xc3, 0x80]), // A
  // Special chars
  Buffer.from([0xef, 0xbf, 0xbd]), // REPLACEMENT CHARACTER
];

function checkFileEncoding(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, reason: "File not found" };
  }

  try {
    const buffer = fs.readFileSync(filePath);
    let corruptionCount = 0;

    // Check using binary patterns
    for (const pattern of CORRUPTION_PATTERNS) {
      let pos = 0;
      while ((pos = buffer.indexOf(pattern, pos)) !== -1) {
        corruptionCount++;
        pos += pattern.length;
      }
    }

    if (corruptionCount > 0) {
      return {
        valid: false,
        reason: `${corruptionCount} corrupted bytes detected`,
        corruptionCount,
      };
    }

    // Verify no null bytes
    if (buffer.indexOf(0x00) !== -1) {
      return {
        valid: false,
        reason: "Binary or invalid file",
      };
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

// Export for use as module
module.exports = {
  checkFileEncoding,
  validateBeforeLaunching,
  validateScriptBeforeExecution,
  validateAllScriptsInDirectory,
};

if (require.main === module) {
  const scriptDir = path.dirname(__filename);
  const { passCount, failCount } = validateAllScriptsInDirectory(scriptDir);

  if (failCount > 0) {
    console.log(`\n[FAIL] Some scripts corrupted.`);
    process.exit(1);
  } else {
    console.log(`\n[PASS] All ${passCount} scripts are clean.`);
  }
}
