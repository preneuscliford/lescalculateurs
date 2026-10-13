/**
 * Date affichée dans les pages pSEO (« Dernière modification ») = date unique du
 * dernier audit des barèmes (src/data/site-update.json), jamais la date de génération.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const siteUpdatePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../src/data/site-update.json");

export function siteUpdateDate() {
  const { lastVerified } = JSON.parse(fs.readFileSync(siteUpdatePath, "utf8"));
  return new Date(`${lastVerified}T12:00:00`);
}
