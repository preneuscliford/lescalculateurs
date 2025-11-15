/**
 * Vérifie que les pages clés du site répondent bien avec un statut final 200.
 */
import https from "https";

/**
 * Effectue une requête GET simple.
 */
function fetchOnce(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET" }, (res) => {
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
 * Suit les redirections (max 5) et renvoie le statut final.
 */
async function follow(url, origin) {
  const hops = [];
  let current = url;
  let res = await fetchOnce(current);
  hops.push({ url: current, status: res.statusCode, location: res.headers.location || "" });
  let i = 0;
  while (i < 5 && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    const next = res.headers.location.startsWith("http") ? res.headers.location : `${origin}${res.headers.location}`;
    current = next;
    res = await fetchOnce(current);
    hops.push({ url: current, status: res.statusCode, location: res.headers.location || "" });
    i++;
  }
  return { finalStatus: res.statusCode, hops };
}

/**
 * Point d'entrée: teste un ensemble d'URLs clés.
 */
async function main() {
  const origin = "https://lescalculateurs.fr";
  const paths = [
    "/",
    "/index.html",
    "/pages/notaire.html",
    "/pages/pret.html",
    "/pages/plusvalue.html",
    "/pages/charges.html",
    "/pages/ik.html",
    "/pages/ponts.html",
    "/pages/taxe.html",
    "/pages/financement.html",
    "/pages/blog.html",
    "/pages/blog/frais-notaire-departements.html",
    "/pages/blog/departements/frais-notaire-75.html",
  ];

  const results = [];
  for (const p of paths) {
    /* eslint-disable no-await-in-loop */
    const url = `${origin}${p}`;
    try {
      const { finalStatus, hops } = await follow(url, origin);
      results.push({ path: p, finalStatus, hops });
      console.log(`[${p}] final=${finalStatus}`);
    } catch (e) {
      results.push({ path: p, error: String(e && e.message ? e.message : e) });
      console.log(`[${p}] ERR ${String(e && e.message ? e.message : e)}`);
    }
  }

  const ok = results.filter((r) => r.finalStatus === 200).length;
  const ko = results.length - ok;
  console.log(`\nRésumé: OK=${ok} / KO=${ko} / Total=${results.length}`);
  if (ko > 0) {
    console.log("Détails KO:");
    for (const r of results.filter((x) => x.finalStatus !== 200)) {
      console.log(`- ${r.path} final=${r.finalStatus} hops=${JSON.stringify(r.hops || [])}`);
    }
  }
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});