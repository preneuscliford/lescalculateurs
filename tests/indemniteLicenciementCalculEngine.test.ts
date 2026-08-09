import {
  calculerIndemniteLicenciement,
  formatAnciennete,
} from "../src/utils/indemniteLicenciementCalculEngine";

describe("indemniteLicenciementCalculEngine", () => {
  test("moins de 8 mois d'ancienneté => non éligible", () => {
    const r = calculerIndemniteLicenciement({
      dateEntree: new Date("2026-01-01T00:00:00Z"),
      dateSortie: new Date("2026-06-01T00:00:00Z"),
      salaireMensuelBrutMoyen: 2500,
    });
    expect(r.eligible).toBe(false);
    expect(r.montantTotal).toBe(0);
  });

  test("exactement 8 mois => éligible", () => {
    const r = calculerIndemniteLicenciement({
      dateEntree: new Date("2026-01-01T00:00:00Z"),
      dateSortie: new Date("2026-09-01T00:00:00Z"),
      salaireMensuelBrutMoyen: 2500,
    });
    expect(r.eligible).toBe(true);
  });

  test("8 ans pile, salaire 2500€ => 5000€ (8 x 1/4 x 2500)", () => {
    const r = calculerIndemniteLicenciement({
      dateEntree: new Date("2018-01-01T00:00:00Z"),
      dateSortie: new Date("2026-01-01T00:00:00Z"),
      salaireMensuelBrutMoyen: 2500,
    });
    expect(r.ancienneteMois).toBe(96);
    expect(r.montantTotal).toBeCloseTo(5000, 2);
  });

  test("12 ans pile, salaire 3000€ => 9500€ (10x1/4x3000 + 2x1/3x3000)", () => {
    const r = calculerIndemniteLicenciement({
      dateEntree: new Date("2014-01-01T00:00:00Z"),
      dateSortie: new Date("2026-01-01T00:00:00Z"),
      salaireMensuelBrutMoyen: 3000,
    });
    // 10 * 0.25 * 3000 = 7500 ; 2 * (1/3) * 3000 = 2000 ; total 9500
    expect(r.montantTotal).toBeCloseTo(9500, 2);
  });

  test("années incomplètes comptent au prorata (8 ans 6 mois, salaire 2000€)", () => {
    const r = calculerIndemniteLicenciement({
      dateEntree: new Date("2017-06-01T00:00:00Z"),
      dateSortie: new Date("2026-01-01T00:00:00Z"),
      salaireMensuelBrutMoyen: 2000,
    });
    // 8.5833... ans (103 mois / 12) * 1/4 * 2000
    const anneesAttendues = 103 / 12;
    expect(r.montantTotal).toBeCloseTo(anneesAttendues * 0.25 * 2000, 1);
  });

  test("formatAnciennete formate correctement", () => {
    expect(formatAnciennete(8)).toBe("8 mois");
    expect(formatAnciennete(12)).toBe("1 an");
    expect(formatAnciennete(96)).toBe("8 ans");
    expect(formatAnciennete(100)).toBe("8 ans et 4 mois");
  });
});
