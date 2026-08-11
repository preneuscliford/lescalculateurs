import { calculerPrimeActivite } from "../src/utils/primeActiviteCalculEngine";

describe("primeActiviteCalculEngine", () => {
  test("champs obligatoires manquants => success false", () => {
    const r = calculerPrimeActivite({
      situation: "",
      enfants: 0,
      revenusProf: 1400,
      autresRevenus: 0,
      logement: "",
      typeActivite: "",
    });
    expect(r.success).toBe(false);
  });

  test("pas de revenus professionnels => non éligible", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 0,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    });
    expect(r.success).toBe(true);
    expect(r.montantEstime).toBe(0);
    expect(r.eligibilite).toMatch(/non eligible/i);
  });

  test("cas standard éligible : forfait + bonification calculés correctement", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 1400,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    });
    expect(r.success).toBe(true);
    expect(r.details.montantBase).toBeCloseTo(638.28, 1);
    expect(r.details.bonification).toBeCloseTo(175.06, 1);
    expect(r.montantEstime).toBeCloseTo(267.34, 1);
  });

  test("montant théorique sous le seuil de versement (15 EUR) => forcé à 0", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 2240,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    });
    expect(r.montantEstime).toBe(0);
    expect(r.eligibilite).toMatch(/trop faible/i);
  });

  test("forfait logement appliqué quand le logement n'est pas loué", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 1000,
      autresRevenus: 0,
      logement: "proprio",
      typeActivite: "salarie",
    });
    expect(r.details.forfaitLogement).toBeCloseTo(76.59, 1);
  });
});
