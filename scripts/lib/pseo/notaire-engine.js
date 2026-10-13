/**
 * Moteur notaire des générateurs SEO = même moteur que le simulateur et l'API
 * (src/utils/notaireCalculEngine.ts, barème src/data/baremes.json), compilé à la volée.
 * Remplace src/utils/notaire.calc.js, qui utilisait des débours forfaitaires différents
 * (800 € + 400 €) et donnait d'autres totaux que le simulateur.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export function loadNotaireEngine(repoRoot) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "lc-notaire-engine-"));
  fs.writeFileSync(path.join(outDir, "package.json"), JSON.stringify({ type: "commonjs" }));
  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
      path.join(repoRoot, "src", "utils", "notaireCalculEngine.ts"),
      "--outDir", outDir, "--module", "commonjs", "--target", "es2020",
      "--moduleResolution", "node", "--resolveJsonModule", "--esModuleInterop", "--skipLibCheck",
    ],
    { stdio: "pipe" },
  );
  const { calculerNotaire } = require(path.join(outDir, "utils", "notaireCalculEngine.js"));

  /** Même signature que l'ancien notaire.calc.js, résultat du moteur unique. */
  function calculFraisNotaire(prix, type = "ancien", departement = "75") {
    const r = calculerNotaire({
      prixAchat: Number(prix) || 0,
      typeBien: type,
      departement: String(departement || "75"),
    });
    return {
      prix: r.prixAchat,
      type,
      dmtoTaux: r.tauxDroits,
      dmtoPct: (r.tauxDroits * 100).toFixed(2),
      droits: Math.round(r.droitsEnregistrement),
      emoluments: Math.round(r.emoluments),
      csi: Math.round(r.csi),
      tva: Math.round(r.tva),
      debours: Math.round(r.debours),
      formalites: Math.round(r.formalites),
      total: Math.round(r.total),
      pourcentage: r.pourcentage.toFixed(2),
    };
  }

  return { calculFraisNotaire };
}
