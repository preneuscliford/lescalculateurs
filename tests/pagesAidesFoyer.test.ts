import fs from "fs";
import path from "path";
import { PAGES_AIDES_FOYER, REDIRECTIONS_AIDES_FOYER, SLUGS_AIDES_FOYER, SOMMAIRES_AIDES_FOYER } from "../src/utils/questions/pagesAidesFoyer";
import { urlPage } from "../src/utils/questions/pagesQuestions";

const racine = path.resolve(__dirname, "..");
const page = (slug: string) => fs.readFileSync(path.join(racine, "src/pages", slug, "index.html"), "utf8");
const colonne = (titre: string) => `<th scope="col" class="border border-gray-300 px-3 py-2 text-right">${titre}</th>`;

describe("pages « combien touche… » (mère célibataire, couple au RSA)", () => {
  test("chaque page : canonique, fil d'Ariane, tableau rempli, FAQ synchronisée", () => {
    for (const p of PAGES_AIDES_FOYER) {
      const html = page(p.slug);
      expect(html).toContain(`<link rel="canonical" href="${urlPage(p.slug)}" />`);
      expect(html).toContain('"@type":"BreadcrumbList"');
      // tous les montants remplis par le moteur
      expect(html).not.toMatch(/data-params='[^']*'[^>]*><\/span>/);
      const questions = (html.match(/data-faq-q="faq"/g) ?? []).length;
      expect(questions).toBe(p.enfants >= 3 ? 5 : 4);
      expect((html.match(/"@type":\s*"Question"/g) ?? []).length).toBe(questions);
      // ASF seulement pour un parent isolé, allocations familiales à partir de 2 enfants
      expect(html.includes(colonne("ASF"))).toBe(p.situation === "parent-isole");
      expect(html.includes(colonne("Allocations familiales"))).toBe(p.enfants >= 2);
      expect(html.includes("Avec la majoration pour isolement")).toBe(p.situation === "parent-isole");
    }
  });

  test("la description reprend les montants affichés dans la page", () => {
    for (const p of PAGES_AIDES_FOYER) {
      const html = page(p.slug);
      const description = /<meta name="description" content="([^"]*)"/.exec(html)![1];
      const aidesSansEmploi = /: ([\d  ]+) € d'aides par mois sans emploi/.exec(description)![1];
      const intro = /<h1[\s\S]*?<\/section>/.exec(html)![0].replace(/<[^>]+>/g, "");
      expect(intro).toContain(`${aidesSansEmploi} €`);
    }
  });

  test("sommaires : un lien par page de la situation, et toutes les pages dans le sitemap", () => {
    for (const s of SOMMAIRES_AIDES_FOYER) {
      const html = page(s.slug);
      for (const p of PAGES_AIDES_FOYER.filter((x) => x.situation === s.situation)) expect(html).toContain(`href="/pages/${p.slug}"`);
    }
    const sitemap = fs.readFileSync(path.join(racine, "public/sitemap.xml"), "utf8");
    for (const slug of SLUGS_AIDES_FOYER) expect(sitemap).toContain(`<loc>${urlPage(slug)}</loc>`);
  });

  test("anciennes pages remplacées : redirigées en 301, supprimées, hors sitemap et plus liées", () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(racine, "vercel.json"), "utf8")) as { redirects: { source: string; destination: string; permanent: boolean }[] };
    const sitemap = fs.readFileSync(path.join(racine, "public/sitemap.xml"), "utf8");
    expect(REDIRECTIONS_AIDES_FOYER.length).toBeGreaterThan(0);
    for (const r of REDIRECTIONS_AIDES_FOYER) {
      for (const source of [`/pages/${r.de}`, `/pages/${r.de}/`]) {
        expect(vercel.redirects).toContainEqual({ source, destination: `/pages/${r.vers}`, permanent: true });
      }
      expect(fs.existsSync(path.join(racine, "src/pages", `${r.de}.html`))).toBe(false);
      expect(fs.existsSync(path.join(racine, "src/pages", r.de))).toBe(false);
      expect(sitemap).not.toContain(`/pages/${r.de}<`);
    }
    // aucune page du site ne pointe encore vers une adresse remplacée
    const anciennes = new RegExp(`href="(?:https://www\\.lescalculateurs\\.fr)?/pages/(?:${REDIRECTIONS_AIDES_FOYER.map((r) => r.de).join("|")})(?:\\.html)?/?"`);
    const parcourir = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parcourir(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []));
    const fautifs = parcourir(path.join(racine, "src/pages")).filter((f) => anciennes.test(fs.readFileSync(f, "utf8")));
    expect(fautifs).toEqual([]);
  });
});
