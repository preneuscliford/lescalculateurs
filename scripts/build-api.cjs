/**
 * Bundle chaque endpoint de api-src/v1/*.ts en un fichier JS autonome dans
 * api/v1/*.js, avec tout son graphe de dependances (moteurs de calcul dans
 * src/utils, donnees dans src/data) inline dans le meme fichier.
 *
 * Pourquoi : Vercel deploie les fichiers .js de /api tels quels, sans les
 * regrouper avec leurs imports relatifs situes en dehors de /api. Un import
 * vers un fichier .ts hors de /api (ex: src/utils/rsaCalculEngine) faisait
 * planter la fonction au runtime en production (FUNCTION_INVOCATION_FAILED),
 * meme si le meme code fonctionnait correctement en local. En pre-bundlant
 * ici, le fichier deploye n'a plus aucune dependance relative a resoudre.
 *
 * A relancer via `npm run build` (deja branche) a chaque modification de
 * api-src/ ou des moteurs de calcul dans src/utils.
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "api-src", "v1");
const OUT_DIR = path.join(__dirname, "..", "api", "v1");

fs.mkdirSync(OUT_DIR, { recursive: true });

const entries = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".ts"));

async function run() {
  for (const entry of entries) {
    const outFile = entry.replace(/\.ts$/, ".js");
    await esbuild.build({
      entryPoints: [path.join(SRC_DIR, entry)],
      outfile: path.join(OUT_DIR, outFile),
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node20",
      logLevel: "warning",
    });
    console.log(`api-src/v1/${entry} -> api/v1/${outFile}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
