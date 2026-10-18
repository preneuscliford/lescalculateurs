import fs from "fs";
import path from "path";
import { formaterMontant, synchroniserExemples } from "../src/utils/exemplesChiffres";

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

  test("les pages affichent les montants des moteurs (sinon : npm run exemples:sync)", () => {
    const racine = path.join(__dirname, "../src/pages");
    const ecarts = pages(racine)
      .filter((p) => fs.readFileSync(p, "utf8").includes("data-exemple="))
      .flatMap((p) =>
        synchroniserExemples(fs.readFileSync(p, "utf8")).ecarts.map(
          (e) => `${path.relative(racine, p)} : ${e.calcul} ${e.params} -> ${e.affiche} au lieu de ${e.attendu}`,
        ),
      );
    expect(ecarts).toEqual([]);
  });
});
