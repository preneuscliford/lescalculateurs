const fs = require("fs");
const path = require("path");

/**
 * Chemin du fichier de clé du compte de service Google (Search Console, Indexing API).
 * Ordre : variable GOOGLE_APPLICATION_CREDENTIALS, puis fichier mes-sass-*.json le plus récent
 * à la racine du dépôt (ignoré par git). Aucun nom de clé n'est écrit dans le code : après une
 * rotation de clé, il suffit de remplacer le fichier.
 */
function resolveGoogleCredentials(racine = path.resolve(__dirname, "../..")) {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv) {
    if (!fs.existsSync(fromEnv)) throw new Error(`GOOGLE_APPLICATION_CREDENTIALS pointe vers un fichier absent : ${fromEnv}`);
    return fromEnv;
  }
  const candidats = fs
    .readdirSync(racine)
    .filter((f) => /^mes-sass-[\w-]+\.json$/.test(f))
    .map((f) => path.join(racine, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!candidats.length) {
    throw new Error(
      "Clé du compte de service introuvable : définissez GOOGLE_APPLICATION_CREDENTIALS ou placez le fichier mes-sass-*.json à la racine du dépôt.",
    );
  }
  return candidats[0];
}

module.exports = { resolveGoogleCredentials };
