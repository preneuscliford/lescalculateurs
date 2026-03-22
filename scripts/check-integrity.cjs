#!/usr/bin/env node

/**
 * 🛡️ SCRIPT INTEGRITY CHECKER
 *
 * Verifie l'integrite UTF-8 de TOUS les scripts dans le dossier.
 * Peut etre lance comme npm script ou git hook.
 */

const fs = require("fs");
const path = require("path");
const { validateAllScriptsInDirectory } = require("./validate-utf8-gate.cjs");

process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

const scriptDir = path.resolve(__dirname);

console.log("[CHECK] Verification d'integrite de tous les scripts\n");

const { allValid, results } = validateAllScriptsInDirectory(scriptDir);

if (allValid) {
  console.log("[PASS] Tous les scripts sont en UTF-8 correct.\n");
  process.exit(0);
} else {
  console.log("[FAIL] Certains scripts sont corrompus.\n");
  console.log("[FIX] Nettoyage automatique lance (cleanup-emergency.cjs)...\n");

  // Essayer de nettoyer automatiquement
  const cleanupScript = path.join(__dirname, "cleanup-emergency.cjs");
  if (fs.existsSync(cleanupScript)) {
    const { execSync } = require("child_process");
    try {
      execSync(`node ${cleanupScript}`, { stdio: "inherit" });
      console.log("\n[RETRY] Verification post-nettoyage...\n");

      const { allValid: postCleanValid } = validateAllScriptsInDirectory(scriptDir);

      if (postCleanValid) {
        console.log("[OK] Scripts repares.\n");
        process.exit(0);
      } else {
        console.log("[FAIL] Nettoyage incomplet.\n");
        process.exit(1);
      }
    } catch (e) {
      console.error("[ERROR] Nettoyage automatique failed.\n");
      process.exit(1);
    }
  } else {
    console.error("[ERROR] cleanup-emergency.cjs non trouve.\n");
    process.exit(1);
  }
}
