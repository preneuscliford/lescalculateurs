#!/usr/bin/env node

/**
 * 🔐 SAFE SCRIPT RUNNER (Execution Wrapper)
 *
 * Lance les scripts SEULEMENT s'ils sont en UTF-8 correct.
 * Bloque tout code corrompu avant execution.
 */

const { spawn } = require("child_process");
const path = require("path");
const { validateBeforeLaunching } = require("./validate-utf8-gate.cjs");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("[USAGE] safe-run <script.cjs> [args...]\n");
  console.error("Exemple : safe-run scripts/auto-correct-seo.cjs\n");
  process.exit(1);
}

const scriptPath = path.resolve(process.cwd(), args[0]);
const scriptArgs = args.slice(1);
const supportedExtensions = new Set([".js", ".cjs", ".mjs"]);

if (!supportedExtensions.has(path.extname(scriptPath).toLowerCase())) {
  console.error("[FATAL] safe-run accepte uniquement les scripts Node (.js, .cjs, .mjs).");
  process.exit(1);
}

console.log("[SECURITY] Validation UTF-8 pre-execution...\n");

try {
  // Validation stricte
  validateBeforeLaunching(scriptPath);
  console.log("[OK] Script valide. Lancement en cours...\n");

  // Lancer le script avec les args
  const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    process.exit(code);
  });

  child.on("error", (err) => {
    console.error(`[ERROR] Execution failed: ${err.message}`);
    process.exit(1);
  });
} catch (err) {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
}
