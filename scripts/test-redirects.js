/**
 * Teste les redirections 301 des anciennes URLs des pages départementales
 * vers les nouvelles URLs sous /pages/blog/departements/.
 */
import https from "https";

/**
 * Effectue une requête GET sans suivre automatiquement les redirections.
 */
function fetchOnce(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET" }, (res) => {
      // Lire un petit bout de corps pour éviter les sockets pendantes
      res.on("data", () => {});
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

/**
 * Teste la redirection pour un code département donné.
 */
async function testRedirect(code) {
  const origin = "https://lescalculateurs.fr";
  const oldPath = `/pages/blog/frais-notaire-${code}.html`;
  const newPath = `/pages/blog/departements/frais-notaire-${code}.html`;
  const oldUrl = `${origin}${oldPath}`;
  const expectedLocation = newPath;

  try {
    const hops = [];
    let currentUrl = oldUrl;
    let res = await fetchOnce(currentUrl);
    hops.push({ url: currentUrl, status: res.statusCode, location: res.headers["location"] || "" });
    let i = 0;
    while (i < 5 && res.statusCode >= 300 && res.statusCode < 400 && res.headers["location"]) {
      const next = res.headers["location"];
      currentUrl = next.startsWith("http") ? next : `${origin}${next}`;
      res = await fetchOnce(currentUrl);
      hops.push({ url: currentUrl, status: res.statusCode, location: res.headers["location"] || "" });
      i++;
    }

    const expectedAbs = `${origin}${expectedLocation}`;
    const sawExpected = hops.some((h) => h.location === expectedLocation || h.location === expectedAbs || h.url === expectedAbs);
    const finalStatus = res.statusCode;
    const finalOk = finalStatus === 200;

    return {
      code,
      oldUrl,
      status: hops[0].status,
      location: hops[0].location,
      redirectOk: sawExpected,
      targetStatus: finalStatus,
      targetOk: finalOk,
      hops,
    };
  } catch (err) {
    return {
      code,
      oldUrl,
      error: String(err && err.message ? err.message : err),
    };
  }
}

/**
 * Point d'entrée: parcourt la liste fournie par GSC et affiche un rapport.
 */
async function main() {
  const codes = [
    "77","06","35","79","01","49","10","60","04","07","44","56","48","84","51","30","73","34","40","72","27","13","28","64","83","32","65","62","95","18","55","21","68","02","33","90","43","47","971","42","26","89","14","24",
  ];

  const results = [];
  for (const code of codes) {
    /* eslint-disable no-await-in-loop */
    const r = await testRedirect(code);
    results.push(r);
    const statusStr = r.error
      ? `ERR ${r.error}`
      : `${r.status} -> ${r.location || "(no location)"} => ${r.targetStatus ?? "n/a"}`;
    console.log(`[${code}] ${statusStr} | redirectOk=${r.redirectOk} targetOk=${r.targetOk}`);
  }

  const okCount = results.filter((r) => r.redirectOk && r.targetOk).length;
  const koCount = results.length - okCount;
  console.log(`\nRésumé: OK=${okCount} / KO=${koCount} / Total=${results.length}`);
  if (koCount > 0) {
    console.log("Détails KO:");
    for (const r of results.filter((x) => !(x.redirectOk && x.targetOk))) {
      console.log(`- code=${r.code} status=${r.status} location='${r.location}' targetStatus=${r.targetStatus} error=${r.error || ""}`);
    }
  }
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});