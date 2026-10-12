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

  test("plafond de l'allocation à 75% du SJR (pas 70%)", () => {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: 24,
      salaireReferent: 800,
      personnesCharge: 0,
      agePersonne: 30,
    });
    // SJR = 800*12/365 = 26.30 EUR ; 75% du SJR = 19.73 EUR/jour (plafond actif)
    // Avec un plafond à 70% (bug corrigé), le montant aurait été plus bas.
    expect(r.eligible).toBe(true);
    expect(r.montantEstime).toBeCloseTo(600.06, 0);
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

  test("rupture conventionnelle après le 01/09/2026 : 15 mois avant 55 ans, 20,5 mois ensuite", () => {
    const base = {
      situation: "seul" as const,
      ancienneteEmploi: 36,
      salaireReferent: 2200,
      personnesCharge: 0,
      ruptureConventionnelle: true,
    };
    const apres = new Date("2026-10-01T00:00:00Z");
    expect(calculerARE({ ...base, agePersonne: 40, dateFinContrat: apres }).durationMax).toBe(15);
    expect(calculerARE({ ...base, agePersonne: 58, dateFinContrat: apres }).durationMax).toBe(20.5);
    // Contrat rompu avant la réforme : anciennes durées
    const avant = new Date("2026-08-31T00:00:00Z");
    expect(calculerARE({ ...base, agePersonne: 40, dateFinContrat: avant }).durationMax).toBe(18);
  });
});
