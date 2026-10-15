/**
 * Pages pSEO retirées = pages redirigées en 301 dans vercel.json (source unique).
 * Les générateurs les retirent de leur liste de scénarios : elles ne sont plus
 * générées, et aucune autre page ne leur fait de lien.
 *
 * Seules les règles de forme simple sont lues : chemin fixe (/pages/rsa/x) ou
 * alternatives (/pages/rsa/(x|y)). Les règles génériques ((.*), :path*) ne
 * concernent pas les pages pSEO.
 */
import fs from "fs";
import path from "path";

export function loadRetiredPaths(repoRoot) {
  const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, "vercel.json"), "utf8"));
  const retired = new Set();
  for (const r of vercel.redirects || []) {
    if (r.has || r.missing) continue;
    const s = r.source;
    if (/^[a-z0-9/-]+$/.test(s)) {
      retired.add(s.replace(/\/$/, ""));
      continue;
    }
    const alt = s.match(/^([a-z0-9/-]*)\(([a-z0-9|-]+)\)$/);
    if (alt) alt[2].split("|").forEach((slug) => retired.add(alt[1] + slug));
  }
  return retired;
}

/** Retire de `scenarios` ceux dont la page /pages/<pillar>/<slug> est redirigée. */
export function withoutRetired(scenarios, pillar, repoRoot) {
  const retired = loadRetiredPaths(repoRoot);
  const kept = scenarios.filter((s) => !retired.has(`/pages/${pillar}/${s.slug}`));
  const removed = scenarios.length - kept.length;
  if (removed) console.log(`  ${removed} scénario(s) ${pillar} retiré(s) (redirigés dans vercel.json)`);
  return kept;
}
