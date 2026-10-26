import fs from "fs";
import path from "path";
import { PAGES_NOTAIRE, REDIRECTIONS_NOTAIRE, SLUGS_NOTAIRE, SLUG_PAGE_GLOBALE } from "../src/utils/questions/pagesNotaire";
import { urlPage } from "../src/utils/questions/pagesQuestions";
import { paramsPageQuestion } from "../src/utils/questions/injectionBarre";

const racine = path.resolve(__dirname, "..");
const lire = (rel: string) => fs.readFileSync(path.join(racine, rel), "utf8");
const page = (slug: string) => lire(`src/pages/${slug}.html`);

/** Mots de 4 lettres ou plus d'un texte (sans chiffres), pour comparer le contenu de deux pages */
const mots = (t: string) => new Set(t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z]{4,}/g) ?? []);
const jaccard = (a: Set<string>, b: Set<string>) => [...a].filter((m) => b.has(m)).length / new Set([...a, ...b]).size;

describe("pages frais de notaire par département", () => {
  test("chaque page : canonique, fil d'Ariane, image locale créditée, 3 questions", () => {
    for (const p of PAGES_NOTAIRE) {
      const html = page(p.slug);
      expect(html).toContain(`<link rel="canonical" href="${urlPage(p.slug)}" />`);
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(fs.existsSync(path.join(racine, "public", p.image.fichier))).toBe(true);
      expect(html).toContain(`src="${p.image.fichier}"`);
      expect(html).toContain("Wikimedia Commons");
      expect(html).toContain(p.image.licence);
      expect((html.match(/data-faq-q="faq"/g) ?? []).length).toBe(3);
      expect(html).not.toMatch(/data-params='[^']*'[^>]*><\/span>/);
    }
  });

  test("contenu local propre à chaque page : histoire et particularité sans recoupement", () => {
    for (let i = 0; i < PAGES_NOTAIRE.length; i++) {
      for (let j = i + 1; j < PAGES_NOTAIRE.length; j++) {
        const a = PAGES_NOTAIRE[i], b = PAGES_NOTAIRE[j];
        const sim = jaccard(mots(`${a.histoire} ${a.particularite} ${a.faqLocale.q}`), mots(`${b.histoire} ${b.particularite} ${b.faqLocale.q}`));
        expect({ pages: `${a.code}/${b.code}`, sim: sim < 0.25 }).toEqual({ pages: `${a.code}/${b.code}`, sim: true });
      }
    }
    const phrases = PAGES_NOTAIRE.flatMap((p) => `${p.histoire} ${p.particularite}`.split(/(?<=\.)\s+/));
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  test("liens vers des pages qui existent", () => {
    for (const p of PAGES_NOTAIRE) {
      for (const href of page(p.slug).match(/href="\/pages\/[^"#]+"/g) ?? []) {
        const slug = href.slice(13, -1);
        const existe = fs.existsSync(path.join(racine, "src/pages", `${slug}.html`)) || fs.existsSync(path.join(racine, "src/pages", slug, "index.html"));
        expect({ page: p.slug, lien: slug, existe }).toEqual({ page: p.slug, lien: slug, existe: true });
      }
    }
  });

  test("aucune redirection de vercel.json ne capture une page générée ; 2A et 2B mènent à la Corse", () => {
    const { redirects } = JSON.parse(lire("vercel.json")) as { redirects: { source: string; destination: string }[] };
    for (const slug of SLUGS_NOTAIRE) {
      const chemin = `/pages/${slug}`;
      const capturee = redirects.find((r) => new RegExp(`^${r.source}$`).test(chemin));
      expect({ chemin, redirection: capturee?.source ?? null }).toEqual({ chemin, redirection: null });
    }
    for (const r of REDIRECTIONS_NOTAIRE) {
      const regle = redirects.find((x) => new RegExp(`^${x.source}$`).test(`/pages/${r.de}`));
      expect(regle?.destination).toBe(`/pages/${r.vers}`);
    }
  });

  test("sitemap : pages du lot et page globale présentes", () => {
    const sitemap = lire("public/sitemap.xml");
    for (const slug of SLUGS_NOTAIRE) expect(sitemap).toContain(`<loc>${urlPage(slug)}</loc>`);
    for (const r of REDIRECTIONS_NOTAIRE) expect(sitemap).not.toContain(`<loc>${urlPage(r.de)}</loc>`);
  });

  test("page globale : une ligne par département, liens vers les guides", () => {
    const html = page(SLUG_PAGE_GLOBALE);
    expect((html.match(/<tr><td class="border/g) ?? []).length).toBeGreaterThanOrEqual(100);
    for (const p of PAGES_NOTAIRE) expect(html).toContain(`href="/pages/${p.slug}"`);
  });

  test("barre pré-remplie avec le département", () => {
    expect(paramsPageQuestion("blog/departements/frais-notaire-75")).toEqual({ departement: "75" });
    expect(paramsPageQuestion("blog/departements/frais-notaire-02")).toEqual({ departement: "02" });
    expect(paramsPageQuestion("blog/departements/frais-notaire-corse")).toEqual({});
  });
});
