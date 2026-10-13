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
    // bonification : 240,63 x (1 400 - 726,29) / (1 698,78 - 726,29), seuils F2882 (06/2026)
    expect(r.details.bonification).toBeCloseTo(166.7, 1);
    // 638,28 + 166,70 + 59,85 % x 1 400 - 1 400
    expect(r.montantEstime).toBeCloseTo(242.88, 1);
  });

  test("ressources réputées au moins égales au montant forfaitaire (petit salaire)", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 300,
      autresRevenus: 0,
      logement: "loue",
      typeActivite: "salarie",
    });
    // 638,28 + 0 + 59,85 % x 300 - max(638,28 ; 300) = 179,55
    expect(r.montantEstime).toBeCloseTo(179.55, 1);
  });

  test("montant théorique sous le seuil de versement (15 EUR) => forcé à 0", () => {
    const r = calculerPrimeActivite({
      situation: "seul",
      enfants: 0,
      revenusProf: 2165,
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

  test("couple : une bonification par travailleur (individuelle)", () => {
    const deuxActifs = calculerPrimeActivite({
      situation: "couple", enfants: 0, revenusProf: 1100, revenusProfConjoint: 1100,
      autresRevenus: 0, logement: "loue", typeActivite: "salarie",
    });
    const unActif = calculerPrimeActivite({
      situation: "couple", enfants: 0, revenusProf: 2200,
      autresRevenus: 0, logement: "loue", typeActivite: "salarie",
    });
    // 2 x bonification(1 100) contre 1 x bonification(2 200 = maximum 240,63)
    expect(deuxActifs.details.bonification).toBeCloseTo(2 * 240.63 * (1100 - 726.29) / (1698.78 - 726.29), 1);
    expect(unActif.details.bonification).toBeCloseTo(240.63, 2);
  });

  test("parent isolé : montant majoré seulement si la majoration est demandée", () => {
    const base = { situation: "monoparental", enfants: 1, revenusProf: 900, autresRevenus: 0, logement: "loue", typeActivite: "salarie" };
    expect(calculerPrimeActivite(base).details.montantBase).toBeCloseTo(957.42, 2);
    expect(calculerPrimeActivite({ ...base, majorationIsolement: true }).details.montantBase).toBeCloseTo(1092.84, 2);
  });

  test("allocations familiales comptées dans les ressources à partir de 2 enfants", () => {
    const r = calculerPrimeActivite({
      situation: "couple", enfants: 2, revenusProf: 1100, revenusProfConjoint: 1100,
      autresRevenus: 0, logement: "loue", typeActivite: "salarie",
    });
    expect(r.details.allocationsFamiliales).toBeCloseTo(152.25, 2);
    const sansAF = calculerPrimeActivite({
      situation: "couple", enfants: 2, revenusProf: 1100, revenusProfConjoint: 1100,
      autresRevenus: 0, logement: "loue", typeActivite: "salarie", inclureAllocationsFamiliales: false,
    });
    expect(sansAF.montantEstime - r.montantEstime).toBeCloseTo(152.25, 1);
  });
});
