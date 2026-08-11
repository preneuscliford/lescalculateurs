/**
 * Bundle les points d'entree HTTP de api-src/v1/*.ts en fichiers JS
 * autonomes dans api/v1/*.js, avec tout leur graphe de dependances (moteurs
 * de calcul dans src/utils, donnees dans src/data) inline dans le meme
 * fichier.
 *
 * Pourquoi : Vercel deploie les fichiers .js de /api tels quels, sans les
 * regrouper avec leurs imports relatifs situes en dehors de /api. Un import
 * vers un fichier .ts hors de /api (ex: src/utils/rsaCalculEngine) faisait
 * planter la fonction au runtime en production (FUNCTION_INVOCATION_FAILED),
 * meme si le meme code fonctionnait correctement en local. En pre-bundlant
 * ici, le fichier deploye n'a plus aucune dependance relative a resoudre.
 *
 * Seuls les fichiers listes dans ROUTE_ENTRIES deviennent des fonctions
 * serverless Vercel independantes (chaque fichier sous api/ compte pour une
 * fonction, et le plan Hobby est plafonne a 12). Les 16 modules calculateurs
 * (rsa.ts, apl.ts, ...) ne sont PAS bundles individuellement : ils sont
 * importes par [calculator].ts, une route dynamique unique qui dispatche
 * /api/v1/{calculator} vers le bon handler au runtime. index.ts et keys.ts
 * restent des fonctions a part car leur contrat (methode, auth) differe.
 *
 * A relancer via `npm run build` (deja branche) a chaque modification de
 * api-src/ ou des moteurs de calcul dans src/utils.
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "api-src", "v1");
const OUT_DIR = path.join(__dirname, "..", "api", "v1");

const ROUTE_ENTRIES = ["[calculator].ts", "index.ts", "keys.ts"];

fs.mkdirSync(OUT_DIR, { recursive: true });

// Purge les anciens fichiers .js d'api/v1 qui ne correspondent plus a une
// route buildee ici (ex: rsa.js, apl.js d'avant la consolidation) : un
// fichier laisse sur le disque compte quand meme comme une fonction Vercel
// au deploiement, meme si plus rien ne le genere.
const expectedOutputs = new Set(ROUTE_ENTRIES.map((f) => f.replace(/\.ts$/, ".js")));
for (const existing of fs.readdirSync(OUT_DIR)) {
  if (existing.endsWith(".js") && !expectedOutputs.has(existing)) {
    fs.unlinkSync(path.join(OUT_DIR, existing));
    console.log(`(purge) api/v1/${existing} retire (route obsolete)`);
  }
}

const entries = ROUTE_ENTRIES.filter((f) => fs.existsSync(path.join(SRC_DIR, f)));

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
