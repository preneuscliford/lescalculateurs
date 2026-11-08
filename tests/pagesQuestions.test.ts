import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { QUESTIONS, REDIRECTIONS, SOMMAIRES, majSitemap, redirectionsVercel, urlPage, voisines, type EntreeQuestion } from "../src/utils/questions/pagesQuestions";
import { paramsPageQuestion } from "../src/utils/questions/injectionBarre";

const racine = path.resolve(__dirname, "..");
const lire = (rel: string) => fs.readFileSync(path.join(racine, rel), "utf8");

describe("pages de questions (src/data/questions-validees.json)", () => {
  test("les fichiers générés sont à jour (pages, sitemap, redirections)", () => {
    expect(() => execFileSync("node", ["scripts/generate-pages-questions.cjs", "--check"], { cwd: racine, stdio: "pipe" })).not.toThrow();
  });

  test("chaque page validée existe, avec sa canonique et son fil d'Ariane", () => {
    for (const q of [...QUESTIONS, ...SOMMAIRES]) {
      const html = lire(`src/pages/${q.slug}/index.html`);
      expect(html).toContain(`<link rel="canonical" href="${urlPage(q.slug)}" />`);
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('aria-label="Fil d\'Ariane"');
      expect(html).not.toMatch(/<span data-exemple="[^"]*" data-params='[^']*'[^>]*><\/span>/);
    }
  });

  test("sitemap : pages validées présentes, pages redirigées et /r/ absentes", () => {
    const sitemap = lire("public/sitemap.xml");
    for (const q of [...QUESTIONS, ...SOMMAIRES]) expect(sitemap).toContain(`<loc>${urlPage(q.slug)}</loc>`);
    for (const r of REDIRECTIONS) expect(sitemap).not.toMatch(new RegExp(`<loc>${urlPage(r.de)}/?</loc>`));
    expect(sitemap).not.toMatch(/<loc>[^<]*\/r\//);
  });

  test("redirections 301 présentes dans vercel.json, sans boucle", () => {
    const vercel = JSON.parse(lire("vercel.json"));
    for (const r of redirectionsVercel()) {
      expect(vercel.redirects).toContainEqual(r);
      expect(REDIRECTIONS.some((x) => `/pages/${x.de}` === r.destination)).toBe(false);
    }
    for (const r of REDIRECTIONS) expect(fs.existsSync(path.join(racine, "src/pages", r.de, "index.html"))).toBe(false);
  });

  test("majSitemap : retire la forme « …/ » et les URL /r/, garde le reste tel quel", () => {
    const xml = `<?xml version="1.0"?>\n<urlset>\n  <!-- commentaire -->\n  <url>\n    <loc>https://www.lescalculateurs.fr/pages/apl/a/</loc>\n  </url>\n\n  <url>\n    <loc>https://www.lescalculateurs.fr/r/apl</loc>\n  </url>\n  <url>\n    <loc>https://www.lescalculateurs.fr/pages/autre</loc>\n  </url>\n</urlset>\n`;
    const out = majSitemap(xml, "2026-10-18", ["apl/a"], []);
    expect(out).toContain("<!-- commentaire -->");
    expect(out).toContain("<loc>https://www.lescalculateurs.fr/pages/autre</loc>");
    expect(out).toContain("<loc>https://www.lescalculateurs.fr/pages/apl/a</loc>");
    expect(out).not.toContain("/pages/apl/a/</loc>");
    expect(out).not.toContain("/r/apl");
    expect(majSitemap(out, "2026-10-18", ["apl/a"], [])).toBe(out);
  });

  test("majSitemap : la date de contenu d'une page générée remplace un lastmod plus ancien, jamais un plus récent", () => {
    const entree = (loc: string, d: string) => `  <url>\n    <loc>https://www.lescalculateurs.fr/pages/${loc}</loc>\n    <lastmod>${d}</lastmod>\n  </url>\n`;
    const xml = `<urlset>\n${entree("blog/a", "2026-10-18")}${entree("blog/b", "2026-11-02")}${entree("autre", "2026-01-01")}</urlset>\n`;
    const dates = { "blog/a": "2026-10-26", "blog/b": "2026-10-26", "blog/c": "2026-10-26" };
    const out = majSitemap(xml, "2026-10-18", ["blog/a", "blog/b", "blog/c"], [], dates);
    expect(out).toContain(entree("blog/a", "2026-10-26"));
    expect(out).toContain(entree("blog/b", "2026-11-02"));
    expect(out).toContain(entree("autre", "2026-01-01"));
    expect(out).toContain("<loc>https://www.lescalculateurs.fr/pages/blog/c</loc>\n    <lastmod>2026-10-26</lastmod>");
    expect(majSitemap(out, "2026-10-18", ["blog/a", "blog/b", "blog/c"], [], dates)).toBe(out);
  });

  test("pages voisines : un enfant de plus ou de moins, seul ou couple", () => {
    const parId = (id: string) => QUESTIONS.find((q) => q.id === id) as EntreeQuestion;
    expect(voisines(parId("apl-deux-enfants")).map((q) => q.id).sort()).toEqual(["apl-trois-enfants", "apl-un-enfant"]);
    expect(voisines(parId("apl-personne-seule")).map((q) => q.id)).toEqual(expect.arrayContaining(["apl-couple-sans-enfant", "apl-un-enfant"]));
  });

  test("barre pré-remplie sur une page de questions", () => {
    expect(paramsPageQuestion("apl/apl-parent-isole-deux-enfants")).toEqual({ enfants: 2 });
    expect(paramsPageQuestion("apl/apl-couple-sans-enfant")).toEqual({ enfants: 0, situation: "couple" });
    expect(paramsPageQuestion("apl/apl-smic-seul")).toBeNull();
  });
});
