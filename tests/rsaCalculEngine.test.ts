import { calculerRSA } from "../src/utils/rsaCalculEngine";

describe("rsaCalculEngine", () => {
  test("données incomplètes => success false", () => {
    const r = calculerRSA({
      situation: "",
      enfants: 0,
      revenus: 0,
      logement: "",
      activite: "",
    });
    expect(r.success).toBe(false);
  });

  test("revenus très élevés => montant 0 et non éligible", () => {
    const r = calculerRSA({
      situation: "seul",
      enfants: 0,
      revenus: 2000,
      logement: "loue",
      activite: "actif",
    });
    expect(r.success).toBe(true);
    expect(r.montantEstime).toBe(0);
    expect(r.eligibilite).toMatch(/non/i);
  });

  test("revenus faibles => montant positif", () => {
    const r = calculerRSA({
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "loue",
      activite: "inactif",
    });
    expect(r.success).toBe(true);
    expect(r.montantEstime).toBeGreaterThan(0);
  });

  test("salaire déduit en totalité (pas de pente de 62 % depuis 2016)", () => {
    const r = calculerRSA({
      situation: "seul",
      enfants: 0,
      revenus: 400,
      logement: "loue",
      activite: "actif",
    });
    // 651,69 - 400 = 251,69
    expect(r.montantEstime).toBeCloseTo(251.69, 1);
  });

  test("forfait logement officiel déduit pour une personne seule hébergée", () => {
    const r = calculerRSA({
      situation: "seul",
      enfants: 0,
      revenus: 0,
      logement: "heberge",
      activite: "inactif",
    });
    // 651,69 - 78,20 = 573,49
    expect(r.montantEstime).toBeCloseTo(573.49, 1);
  });
});
