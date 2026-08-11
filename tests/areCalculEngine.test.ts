import { calculerARE } from "../src/utils/areCalculEngine";

describe("areCalculEngine", () => {
  test("ancienneté insuffisante (< 6 mois) => non éligible", () => {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: 3,
      salaireReferent: 2000,
      personnesCharge: 0,
      agePersonne: 30,
    });
    expect(r.eligible).toBe(false);
    expect(r.montantEstime).toBe(0);
    expect(r.durationMax).toBe(0);
  });

  test("cas standard éligible : formule officielle appliquée", () => {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: 24,
      salaireReferent: 2200,
      personnesCharge: 0,
      agePersonne: 35,
    });
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeCloseTo(1289.83, 1);
    expect(r.durationMax).toBe(18);
  });

  test("plancher journalier minimum appliqué pour un salaire modeste", () => {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: 24,
      salaireReferent: 1400,
      personnesCharge: 0,
      agePersonne: 30,
    });
    expect(r.eligible).toBe(true);
    // 32.13 EUR/jour (plancher) x 30.42 = ~977.39 EUR/mois
    expect(r.montantEstime).toBeCloseTo(977.39, 1);
  });

  test("plafond de durée relevé à partir de 57 ans", () => {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: 40,
      salaireReferent: 2000,
      personnesCharge: 0,
      agePersonne: 60,
    });
    expect(r.eligible).toBe(true);
    // durée maximale à 57 ans et plus = 822 jours ≈ 27 mois
    expect(r.durationMax).toBe(27);
  });
});
