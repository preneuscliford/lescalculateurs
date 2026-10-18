import { baremeIR2026, calculerIR } from "../src/utils/irCalculEngine";

describe("irCalculEngine", () => {
  test("refuse les entrées invalides", () => {
    expect(() => calculerIR({ revenu: -1, parts: 1 })).toThrow();
    expect(() => calculerIR({ revenu: 10000, parts: 0 })).toThrow();
  });

  test("IR nul sous la première tranche", () => {
    const r = calculerIR({ revenu: 11000, parts: 1 });
    expect(r.irBrut).toBe(0);
    expect(r.tauxMarginal).toBe(0);
  });

  test("calcule l'IR et le taux marginal pour un cas simple", () => {
    const r = calculerIR({ revenu: 40000, parts: 1 });
    expect(r.irBrut).toBeGreaterThan(0);
    expect(r.tauxMarginal).toBeGreaterThanOrEqual(0.11);
  });

  test("parts divise le revenu (quotient familial) et réduit l'IR", () => {
    const r1 = calculerIR({ revenu: 60000, parts: 1 });
    const r2 = calculerIR({ revenu: 60000, parts: 2 });
    expect(r2.qf).toBeCloseTo(r1.qf / 2, 6);
    expect(r2.irBrut).toBeLessThan(r1.irBrut);
  });

  test("le taux marginal correspond à la tranche du quotient familial", () => {
    const r = calculerIR({ revenu: 100000, parts: 2 });
    const tranche = baremeIR2026.find((t) => r.qf <= t.plafond);
    expect(r.tauxMarginal).toBe(tranche?.taux);
  });

  test("décote : personne seule, 20 000 EUR, impôt ramené d'environ 924 à 445 EUR", () => {
    const r = calculerIR({ revenu: 20000, parts: 1 });
    expect(Math.round(r.irBrut)).toBe(924);
    expect(r.impotNet).toBe(445);
  });

  test("seuil de recouvrement : impôt net inférieur à 61 EUR non recouvré", () => {
    expect(calculerIR({ revenu: 15000, parts: 1 }).impotNet).toBe(0);
  });

  test("plafonnement du quotient familial pour un couple aisé avec 2 enfants", () => {
    const r = calculerIR({ revenu: 200000, parts: 3, couple: true });
    const base = calculerIR({ revenu: 200000, parts: 2, couple: true });
    expect(r.plafonnementQF).toBeGreaterThan(0);
    expect(Math.round(base.irBrut - r.irBrut)).toBe(2 * 1807);
  });

  test("parent isolé : plafond spécifique de la part du premier enfant", () => {
    const r = calculerIR({ revenu: 120000, parts: 2, couple: false, parentIsole: true });
    const seul = calculerIR({ revenu: 120000, parts: 1 });
    expect(Math.round(seul.irBrut - r.irBrut)).toBe(4262);
  });
});
