import { calculerTaxeFonciere, allegementsPossibles } from "../src/utils/taxeFonciereCalculEngine";

describe("taxeFonciereCalculEngine", () => {
  test("taxe = base × taux global, sans abattement inventé", () => {
    const r = calculerTaxeFonciere({ valeurLocative: 3000, tauxPct: 40 });
    expect(r.taxeFonciere).toBeCloseTo(1200, 2);
    expect(r.taux).toBeCloseTo(0.4, 6);
    expect(r.allegementsPossibles).toEqual([]);
  });

  test("aucune exonération ni dégrèvement déduit du montant", () => {
    const r = calculerTaxeFonciere({ valeurLocative: 3000, tauxPct: 40, age: 80, allocataire: true });
    expect(r.taxeFonciere).toBeCloseTo(1200, 2);
    expect(r.allegementsPossibles).toHaveLength(2);
  });

  test("65 à 75 ans : dégrèvement de 100 € signalé ; 75 ans et plus : exonération", () => {
    expect(allegementsPossibles(64)).toEqual([]);
    expect(allegementsPossibles(65)[0]).toMatch(/100 €/);
    expect(allegementsPossibles(74)[0]).toMatch(/100 €/);
    expect(allegementsPossibles(75)[0]).toMatch(/exonération totale/);
  });

  test("valeurs invalides ramenées à 0", () => {
    const r = calculerTaxeFonciere({ valeurLocative: -5, tauxPct: Number.NaN });
    expect(r.taxeFonciere).toBe(0);
  });
});
