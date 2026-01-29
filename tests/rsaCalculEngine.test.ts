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
});

