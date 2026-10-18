import fs from "fs";
import path from "path";
import { formaterMontant, synchroniserExemples, synchroniserFaqJsonLd } from "../src/utils/exemplesChiffres";

function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pages(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

describe("exemples chiffrés (data-exemple)", () => {
  test("formate les montants à la française", () => {
    expect(formaterMontant(19453.3, 100)).toBe("19 500");
    expect(formaterMontant(273.69)).toBe("274");
  });

  test("recalcule un marqueur depuis le moteur APL", () => {
    const html = `<span data-exemple="apl" data-params='{"situation":"seul","enfants":0,"revenus_mensuels":1050,"loyer_mensuel":520,"region":"zone2"}'>999</span>`;
    const { html: out, ecarts } = synchroniserExemples(html);
    expect(ecarts).toHaveLength(1);
    expect(out).toContain(">116</span>");
  });

  test("génère la FAQ JSON-LD depuis la FAQ visible", () => {
    const html = `<script type="application/ld+json" data-faq="f"></script>
<h3 data-faq-q="f">Combien d&rsquo;APL ?</h3><p data-faq-a="f">Environ <strong>134&nbsp;€</strong> par mois.</p>`;
    const { html: out, ecarts } = synchroniserFaqJsonLd(html);
    expect(ecarts).toEqual(["f"]);
    const json = JSON.parse(out.match(/data-faq="f">([\s\S]*?)<\/script>/)![1]);
    expect(json.mainEntity[0].name).toBe("Combien d’APL ?");
    expect(json.mainEntity[0].acceptedAnswer.text).toBe("Environ 134 € par mois.");
    expect(synchroniserFaqJsonLd(out).ecarts).toEqual([]);
  });

  test("les pages affichent les montants des moteurs (sinon : npm run exemples:sync)", () => {
    const racine = path.join(__dirname, "../src/pages");
    const ecarts = pages(racine)
      .filter((p) => /data-exemple=|data-faq=/.test(fs.readFileSync(p, "utf8")))
      .flatMap((p) => {
        const { html, ecarts: exemples } = synchroniserExemples(fs.readFileSync(p, "utf8"));
        return [
          ...exemples.map((e) => `${path.relative(racine, p)} : ${e.calcul} ${e.params} -> ${e.affiche} au lieu de ${e.attendu}`),
          ...synchroniserFaqJsonLd(html).ecarts.map((g) => `${path.relative(racine, p)} : FAQ JSON-LD "${g}" à régénérer`),
        ];
      });
    expect(ecarts).toEqual([]);
  });
});
