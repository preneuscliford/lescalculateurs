import { calculerTaxeFonciere, allegementsPossibles } from "../src/utils/taxeFonciereCalculEngine";

describe("taxeFonciereCalculEngine", () => {
  test("taxe = (valeur locative − 50 %) × taux global (CGI art. 1388)", () => {
    const r = calculerTaxeFonciere({ valeurLocative: 3000, tauxPct: 40 });
    expect(r.base).toBe(1500);
    expect(r.taxeFonciere).toBeCloseTo(600, 2);
    expect(r.taux).toBeCloseTo(0.4, 6);
    expect(r.allegementsPossibles).toEqual([]);
  });

  test("aucune exonération ni dégrèvement déduit du montant", () => {
    const r = calculerTaxeFonciere({ valeurLocative: 3000, tauxPct: 40, age: 80, allocataire: true });
    expect(r.taxeFonciere).toBeCloseTo(600, 2);
    expect(r.allegementsPossibles).toHaveLength(2);
  });

  test("65 à 75 ans : dégrèvement de 100 € signalé ; 75 ans et plus : exonération", () => {
    expect(allegementsPossibles(64)).toEqual([]);
    expect(allegementsPossibles(65)[0]).toMatch(/100 €/);
    expect(allegementsPossibles(74)[0]).toMatch(/100 €/);
    expect(allegementsPossibles(75)[0]).toMatch(/exonération totale/);
  });

  test("base de l'avis saisie : pas de second abattement", () => {
    const r = calculerTaxeFonciere({ valeurLocative: 1500, tauxPct: 40, montantSaisi: "base" });
    expect(r.base).toBe(1500);
    expect(r.valeurLocative).toBe(3000);
    expect(r.taxeFonciere).toBeCloseTo(600, 2);
  });

  test("valeurs invalides ramenées à 0", () => {
    const r = calculerTaxeFonciere({ valeurLocative: -5, tauxPct: Number.NaN });
    expect(r.taxeFonciere).toBe(0);
  });
});
