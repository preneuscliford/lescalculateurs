import fs from "fs";
import path from "path";
import { GoogleAuth } from "google-auth-library";

const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";

/**
 * Résout le chemin du fichier d’identifiants.
 * Priorité: env GOOGLE_APPLICATION_CREDENTIALS → argument --creds → défaut.
 */
function resolveCredsPath() {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const arg = process.argv.find((a) => a.startsWith("--creds="));
  if (arg) {
    const p = arg.split("=")[1];
    if (p && fs.existsSync(p)) return p;
  }
  const defaultPath = path.resolve(
    "c:/Users/prene/OneDrive/Bureau/lesCalculateurs/mes-sass-a09ffa66ca74.json"
  );
  return defaultPath;
}

/**
 * Lit les URLs depuis public/sitemap.xml en extrayant les balises <loc>.
 */
function readUrlsFromSitemap(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const urls = [];
  const regex = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    urls.push(m[1].trim());
  }
  return urls;
}

/**
 * Lit <url> blocs et filtre par includePath et/ou lastmod exact.
 */
function readUrlsFromSitemapFiltered(sitemapPath, includePath, lastmod) {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const results = [];
  const blockRe = /<url>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<lastmod>\s*([^<\s]+)\s*<\/lastmod>[\s\S]*?<\/url>/g;
  let m;
  while ((m = blockRe.exec(xml)) !== null) {
    const loc = m[1].trim();
    const lm = m[2].trim();
    if (includePath && !loc.includes(includePath)) continue;
    if (lastmod && lm !== lastmod) continue;
    results.push(loc);
  }
  return results;
}

/**
 * Lit une liste d’URLs depuis un fichier texte (1 URL par ligne).
 */
function readUrlsFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return content
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter((l) => l);
}

/**
 * Récupère un client authentifié Google pour le scope Indexing API.
 */
async function getAuthClient(credsPath) {
  const auth = new GoogleAuth({ keyFile: credsPath, scopes: [INDEXING_SCOPE] });
  return auth.getClient();
}

/**
 * Publie une notification d’indexation pour une URL donnée.
 */
async function publishUrl(client, url, type) {
  const res = await client.request({
    url: INDEXING_ENDPOINT,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { url, type },
  });
  return res.data;
}

/**
 * Parse les arguments CLI et construit la liste d’URLs + type.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith("--type="));
  const type = typeArg ? typeArg.split("=")[1] : "URL_UPDATED";
  const urls = [];
  const dryRun = args.includes("--dry-run");

  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  const offsetArg = args.find((a) => a.startsWith("--offset="));
  const offset = offsetArg ? Number(offsetArg.split("=")[1]) : 0;

  const delayArg = args.find((a) => a.startsWith("--delay-ms="));
  const delayMs = delayArg ? Number(delayArg.split("=")[1]) : 0;

  const includePathArg = args.find((a) => a.startsWith("--include-path="));
  const includePath = includePathArg ? includePathArg.split("=")[1] : undefined;

  const lastmodArg = args.find((a) => a.startsWith("--lastmod="));
  const lastmod = lastmodArg ? lastmodArg.split("=")[1] : undefined;

  const single = args.find((a) => a.startsWith("--url="));
  if (single) urls.push(single.split("=")[1]);

  const fromFileArg = args.find((a) => a.startsWith("--file="));
  if (fromFileArg) {
    const filePath = path.resolve(fromFileArg.split("=")[1]);
    urls.push(...readUrlsFromFile(filePath));
  }

  if (args.includes("--from-sitemap")) {
    const sitemapPath = path.resolve("public", "sitemap.xml");
    if (includePath || lastmod) {
      urls.push(...readUrlsFromSitemapFiltered(sitemapPath, includePath, lastmod));
    } else {
      urls.push(...readUrlsFromSitemap(sitemapPath));
    }
  }

  let deduped = Array.from(new Set(urls));
  if (offset && offset > 0) deduped = deduped.slice(offset);
  if (typeof limit === "number" && limit > 0) deduped = deduped.slice(0, limit);
  return { type, urls: deduped, dryRun, delayMs, includePath, lastmod };
}

/**
 * Point d’entrée: authentifie et publie les notifications pour toutes les URLs.
 */
/**
 * Petite pause utilitaire.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const credsPath = resolveCredsPath();
  if (!fs.existsSync(credsPath)) {
    console.error(
      `Fichier d’identifiants introuvable: ${credsPath}. Configurez GOOGLE_APPLICATION_CREDENTIALS ou --creds=...`
    );
    process.exit(1);
  }

  const { type, urls, dryRun, delayMs } = parseArgs();
  if (urls.length === 0) {
    console.error(
      "Aucune URL fournie. Utilisez --url=..., --file=..., ou --from-sitemap."
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log(
      `🔎 Dry-run activé. ${urls.length} URL(s) prêtes pour type=${type}, delay=${delayMs}ms.`
    );
    console.log(urls.slice(0, 10).map((u, i) => `${i + 1}. ${u}`).join("\n"));
    if (urls.length > 10) console.log(`... (${urls.length - 10} autres)`);
    return;
  }

  const client = await getAuthClient(credsPath);
  console.log(`🔐 Auth OK. Publication type=${type}. Total URLs=${urls.length}`);

  let ok = 0;
  let ko = 0;
  const errors = [];

  for (const url of urls) {
    /* eslint-disable no-await-in-loop */
    try {
      const data = await publishUrl(client, url, type);
      ok += 1;
      console.log(`✅ ${url}`);
      if (ok % 100 === 0) await new Promise((r) => setTimeout(r, 1000));
      if (delayMs && delayMs > 0) await sleep(delayMs);
    } catch (e) {
      ko += 1;
      const msg = String(e && e.message ? e.message : e);
      errors.push({ url, error: msg });
      console.log(`❌ ${url} → ${msg}`);
      await sleep(500);
    }
  }

  console.log(`\nRésumé: OK=${ok} / KO=${ko} / total=${urls.length}`);
  if (errors.length) {
    const reportPath = path.resolve("reports", "indexing-errors.json");
    try {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(errors, null, 2), "utf-8");
      console.log(`📝 Erreurs sauvegardées dans ${reportPath}`);
    } catch (_) {
      // noop
    }
  }
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
