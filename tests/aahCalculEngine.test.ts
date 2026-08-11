import { calculerAAH } from "../src/utils/aahCalculEngine";

describe("aahCalculEngine", () => {
  test("taux d'incapacité sous le minimum (< 50%) => données incomplètes", () => {
    const r = calculerAAH({
      situation: "seul",
      enfants: 0,
      tauxIncapacite: 30,
      revenus: 0,
      logement: "locataire",
    });
    expect(r.success).toBe(false);
    expect(r.montantEstime).toBe(0);
  });

  test("aucun revenu => montant plafond plein", () => {
    const r = calculerAAH({
      situation: "seul",
      enfants: 0,
      tauxIncapacite: 80,
      revenus: 0,
      logement: "locataire",
    });
    expect(r.success).toBe(true);
    expect(r.montantEstime).toBeCloseTo(1041.59, 1);
  });

  test("cas standard avec revenus modestes", () => {
    const r = calculerAAH({
      situation: "seul",
      enfants: 0,
      tauxIncapacite: 80,
      revenus: 300,
      logement: "locataire",
    });
    expect(r.success).toBe(true);
    expect(r.montantEstime).toBeCloseTo(771.59, 1);
  });

  test("revenus au-delà du seuil maximum => non éligible", () => {
    const r = calculerAAH({
      situation: "seul",
      enfants: 0,
      tauxIncapacite: 80,
      revenus: 1600,
      logement: "locataire",
    });
    expect(r.montantEstime).toBe(0);
    expect(r.eligibilite).toMatch(/non/i);
  });

  test("le montant ne dépasse jamais le plafond réglementaire", () => {
    const r = calculerAAH({
      situation: "couple",
      enfants: 3,
      tauxIncapacite: 100,
      revenus: 0,
      logement: "proprio",
    });
    expect(r.montantEstime).toBeLessThanOrEqual(1041.59);
  });
});
