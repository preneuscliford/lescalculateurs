/**
 * Vérifie toutes les URLs listées dans public/sitemap.xml.
 * Suit les redirections et rapporte le statut final.
 */
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

/**
 * Lecture des URLs depuis le sitemap (extraction simple des <loc>).
 */
function readSitemapLocs(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const locs = [];
  const regex = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const url = m[1].trim();
    locs.push(url);
  }
  return locs;
}

/**
 * GET simple sans suivre automatiquement les redirections.
 */
function fetchOnce(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.request(url, { method: "GET" }, (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

/**
 * Suit la chaîne de redirections (max 6) et renvoie le statut final et les hops.
 */
async function follow(url) {
  const hops = [];
  let current = url;
  let res = await fetchOnce(current);
  hops.push({ url: current, status: res.statusCode, location: res.headers.location || "" });
  let i = 0;
  while (i < 6 && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    const next = res.headers.location.startsWith("http") ? res.headers.location : new URL(res.headers.location, current).toString();
    current = next;
    res = await fetchOnce(current);
    hops.push({ url: current, status: res.statusCode, location: res.headers.location || "" });
    i++;
  }
  return { finalStatus: res.statusCode, finalUrl: current, hops };
}

/**
 * Point d'entrée: lit le sitemap et teste toutes les URLs.
 */
async function main() {
  const sitemapPath = path.resolve("public", "sitemap.xml");
  let urls = readSitemapLocs(sitemapPath);
  // Option: override domain (e.g., test www instead of apex)
  const arg = process.argv.find((a) => a.startsWith("--override-domain="));
  if (arg) {
    const domain = arg.split("=")[1];
    if (domain) {
      urls = urls.map((u) => u.replace("https://lescalculateurs.fr", `https://${domain}`));
    }
  }
  console.log(`Total URLs dans sitemap: ${urls.length}`);

  const results = [];
  for (const url of urls) {
    /* eslint-disable no-await-in-loop */
    try {
      const { finalStatus, finalUrl, hops } = await follow(url);
      results.push({ url, finalStatus, finalUrl, hops });
      console.log(`[OK] ${url} -> ${finalStatus}`);
    } catch (e) {
      results.push({ url, error: String(e && e.message ? e.message : e) });
      console.log(`[ERR] ${url} -> ${String(e && e.message ? e.message : e)}`);
    }
  }

  const ok200 = results.filter((r) => r.finalStatus === 200).length;
  const redirect4xx = results.filter((r) => r.finalStatus >= 400 && r.finalStatus < 500).length;
  const other = results.length - ok200 - redirect4xx;
  console.log(`\nRésumé: 200=${ok200} / 4xx=${redirect4xx} / autres=${other} / total=${results.length}`);

  const kos = results.filter((r) => r.finalStatus && r.finalStatus >= 400);
  if (kos.length > 0) {
    console.log("\nDétails des 4xx:");
    for (const r of kos.slice(0, 20)) {
      console.log(`- ${r.url} -> final=${r.finalStatus} via ${r.hops && r.hops.length} hops (dernier: ${r.finalUrl})`);
    }
    if (kos.length > 20) {
      console.log(`... (${kos.length - 20} autres)`);
    }
  }
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
