import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parcourt récursivement un dossier et renvoie la liste des fichiers HTML.
 */
async function listHtmlFiles(rootDir) {
  const results = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && full.endsWith(".html")) results.push(full);
    }
  }
  return results;
}

/**
 * Extrait les liens externes d’un contenu HTML simple.
 */
function extractLinks(html) {
  const links = [];
  const regex = /href=\"(https?:[^\"]+)\"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    links.push(m[1]);
  }
  return links;
}

/**
 * Vérifie une URL (HEAD puis GET en repli) et renvoie statut et éventuelle erreur.
 */
async function checkUrl(url) {
  try {
    let res = await fetch(url, { method: "HEAD" });
    if (!res.ok) {
      res = await fetch(url, { method: "GET" });
    }
    return { status: res.status, ok: res.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.message };
  }
}

/**
 * Point d’entrée: vérifie tous les liens externes sous src/pages et génère un rapport.
 */
async function main() {
  const pagesDir = path.resolve(__dirname, "../src/pages");
  const files = await listHtmlFiles(pagesDir);
  const report = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf-8");
    const links = extractLinks(html).filter((u) => u.startsWith("http"));
    for (const url of links) {
      const r = await checkUrl(url);
      report.push({ file, url, ...r });
      const statusText = r.ok ? "OK" : `KO (${r.status || r.error})`;
      console.log(`${statusText} ${url} <- ${path.relative(pagesDir, file)}`);
    }
  }
  const outDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "link-check.json"), JSON.stringify(report, null, 2), "utf-8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});