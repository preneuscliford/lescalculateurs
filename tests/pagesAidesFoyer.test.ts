import fs from "fs";
import path from "path";
import { PAGES_AIDES_FOYER, SLUGS_AIDES_FOYER, SOMMAIRE_AIDES_FOYER } from "../src/utils/questions/pagesAidesFoyer";
import { urlPage } from "../src/utils/questions/pagesQuestions";

const racine = path.resolve(__dirname, "..");
const page = (slug: string) => fs.readFileSync(path.join(racine, "src/pages", slug, "index.html"), "utf8");

describe("pages « combien touche une mère célibataire »", () => {
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
      // allocations familiales seulement à partir de 2 enfants
      expect(html.includes("<th scope=\"col\" class=\"border border-gray-300 px-3 py-2 text-right\">Allocations familiales</th>")).toBe(p.enfants >= 2);
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

  test("sommaire : un lien par page, et toutes les pages dans le sitemap", () => {
    const html = page(SOMMAIRE_AIDES_FOYER.slug);
    for (const p of PAGES_AIDES_FOYER) expect(html).toContain(`href="/pages/${p.slug}"`);
    const sitemap = fs.readFileSync(path.join(racine, "public/sitemap.xml"), "utf8");
    for (const slug of SLUGS_AIDES_FOYER) expect(sitemap).toContain(`<loc>${urlPage(slug)}</loc>`);
  });
});
