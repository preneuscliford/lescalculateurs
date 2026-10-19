import fs from "fs";
import path from "path";

// Google exige que le balisage FAQPage reprenne des questions affichées sur la page.
// Comparaison approximative (accents, ponctuation, espaces des nombres, € = EUR ignorés) :
// au moins 60 % des paires de mots de la question doivent figurer dans le texte visible.

function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pages(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

function norm(t: string): string {
  return t
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, " ")
    .toLowerCase()
    .replace(/€/g, " eur ")
    .replace(/œ/g, "oe")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/(?<=\d) (?=\d)/g, "");
}

function bigrammes(t: string): Set<string> {
  const w = t.split(" ").filter(Boolean);
  if (w.length < 2) return new Set(w);
  return new Set(w.slice(1).map((x, i) => `${w[i]} ${x}`));
}

describe("FAQ JSON-LD", () => {
  test("chaque question FAQPage est affichée sur sa page", () => {
    const racine = path.join(__dirname, "../src/pages");
    const manquantes: string[] = [];
    for (const p of pages(racine)) {
      const html = fs.readFileSync(p, "utf8");
      if (!html.includes('"FAQPage"')) continue;
      const blocs = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
      const visible = norm(
        html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " "),
      );
      const corpus = bigrammes(visible);
      for (const [, json] of blocs) {
        let d: { "@type"?: string; mainEntity?: { name?: string }[] };
        try {
          d = JSON.parse(json);
        } catch {
          continue;
        }
        if (d["@type"] !== "FAQPage") continue;
        for (const q of d.mainEntity ?? []) {
          const b = bigrammes(norm(q.name ?? ""));
          const trouves = [...b].filter((x) => corpus.has(x)).length;
          if (b.size === 0 || trouves / b.size < 0.6) manquantes.push(`${path.relative(racine, p)} : ${q.name}`);
        }
      }
    }
    expect(manquantes).toEqual([]);
  });
});
