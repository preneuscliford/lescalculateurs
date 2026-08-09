import { calculerAgeLegalRetraite, formatAge } from "../src/utils/retraiteCalculEngine";

describe("retraiteCalculEngine", () => {
  test("né en 1955 (avant réforme) => 62 ans, 166 trimestres", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1955-06-01T00:00:00Z") });
    expect(r.ageLegalYears).toBe(62);
    expect(r.ageLegalMonths).toBe(0);
    expect(r.trimestresRequis).toBe(166);
  });

  test("né en janvier 1961 (avant seuil sept. 1961) => 62 ans, 168 trimestres", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1961-01-15T00:00:00Z") });
    expect(r.ageLegalYears).toBe(62);
    expect(r.ageLegalMonths).toBe(0);
    expect(r.trimestresRequis).toBe(168);
  });

  test("né en octobre 1961 (après seuil sept. 1961) => 62 ans 3 mois, 169 trimestres", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1961-10-01T00:00:00Z") });
    expect(r.ageLegalYears).toBe(62);
    expect(r.ageLegalMonths).toBe(3);
    expect(r.trimestresRequis).toBe(169);
  });

  test("né en juin 1964 (suspension LFSS 2026) => 62 ans 9 mois, 170 trimestres, date légale = 15/03/2027", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1964-06-15T00:00:00Z") });
    expect(r.ageLegalYears).toBe(62);
    expect(r.ageLegalMonths).toBe(9);
    expect(r.trimestresRequis).toBe(170);
    expect(r.dateAgeLegal.toISOString().slice(0, 10)).toBe("2027-03-15");
  });

  test("né en avril 1965 (hors suspension) => 63 ans, 171 trimestres", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1965-04-01T00:00:00Z") });
    expect(r.ageLegalYears).toBe(63);
    expect(r.ageLegalMonths).toBe(0);
    expect(r.trimestresRequis).toBe(171);
  });

  test("né en 1969 ou après => 64 ans, 172 trimestres", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1969-03-01T00:00:00Z") });
    expect(r.ageLegalYears).toBe(64);
    expect(r.ageLegalMonths).toBe(0);
    expect(r.trimestresRequis).toBe(172);
  });

  test("taux plein automatique = date de naissance + 67 ans", () => {
    const r = calculerAgeLegalRetraite({ dateNaissance: new Date("1970-01-01T00:00:00Z") });
    expect(r.dateTauxPleinAutomatique.toISOString().slice(0, 10)).toBe("2037-01-01");
  });

  test("trimestres validés suffisants => 0 trimestre manquant", () => {
    const r = calculerAgeLegalRetraite({
      dateNaissance: new Date("1964-06-15T00:00:00Z"),
      trimestresValides: 170,
    });
    expect(r.trimestresManquants).toBe(0);
  });

  test("trimestres validés insuffisants => manque calculé correctement", () => {
    const r = calculerAgeLegalRetraite({
      dateNaissance: new Date("1964-06-15T00:00:00Z"),
      trimestresValides: 150,
    });
    expect(r.trimestresManquants).toBe(20);
  });

  test("formatAge gère singulier/pluriel", () => {
    expect(formatAge(1, 0)).toBe("1 an");
    expect(formatAge(62, 9)).toBe("62 ans et 9 mois");
    expect(formatAge(62, 0)).toBe("62 ans");
  });
});
