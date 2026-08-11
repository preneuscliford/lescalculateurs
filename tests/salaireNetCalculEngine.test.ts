import { calculerSalaireNet } from "../src/utils/salaireNetCalculEngine";

describe("salaireNetCalculEngine", () => {
  test("cas standard vérifié : 2800 EUR brut, salarié, sans enfant", () => {
    const r = calculerSalaireNet({
      salaireBrut: 2800,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 0,
      mariageOrPacs: false,
    });
    expect(r.success).toBe(true);
    expect(r.salaireNetMensuel).toBeCloseTo(2153.1, 1);
    expect(r.salaireGrossMensuel).toBe(2800);
  });

  test("primes et heures supplémentaires augmentent le brut total", () => {
    const base = calculerSalaireNet({
      salaireBrut: 2000,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 0,
      mariageOrPacs: false,
    });
    const avecPrimes = calculerSalaireNet({
      salaireBrut: 2000,
      statut: "salarie",
      primes: 300,
      heuresSup: 100,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 0,
      mariageOrPacs: false,
    });
    expect(avecPrimes.details.brutTotal).toBe(base.details.brutTotal + 400);
  });

  test("tickets restaurant et mutuelle s'ajoutent au net sans charge", () => {
    const sansAvantages = calculerSalaireNet({
      salaireBrut: 2500,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 0,
      mariageOrPacs: false,
    });
    const avecAvantages = calculerSalaireNet({
      salaireBrut: 2500,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 150,
      mutuelle: 40,
      enfants: 0,
      mariageOrPacs: false,
    });
    expect(avecAvantages.salaireNetMensuel).toBeCloseTo(sansAvantages.salaireNetMensuel + 190, 1);
  });

  test("le quotient familial réduit l'impôt pour une famille nombreuse", () => {
    const seul = calculerSalaireNet({
      salaireBrut: 4000,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 0,
      mariageOrPacs: false,
    });
    const famille = calculerSalaireNet({
      salaireBrut: 4000,
      statut: "salarie",
      primes: 0,
      heuresSup: 0,
      ticketsResto: 0,
      mutuelle: 0,
      enfants: 3,
      mariageOrPacs: true,
    });
    expect(famille.impotPasTotal).toBeLessThan(seul.impotPasTotal);
  });
});
