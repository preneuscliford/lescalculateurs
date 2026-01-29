import { baremes } from "../src/data/baremes";
import { calculerFraisNotaire, getTauxDroitsMutation } from "../src/utils/calculNotaire";

describe("calculNotaire", () => {
  test("getTauxDroitsMutation: neuf utilise le taux neuf", () => {
    expect(getTauxDroitsMutation("75", "neuf")).toBe(baremes.notaire.droitsMutation.neuf);
  });

  test("getTauxDroitsMutation: département réduit applique le taux réduit", () => {
    expect(getTauxDroitsMutation("36", "ancien")).toBe(baremes.notaire.droitsMutation.reduit);
    expect(getTauxDroitsMutation("976", "terrain")).toBe(baremes.notaire.droitsMutation.reduit);
  });

  test("getTauxDroitsMutation: standard sinon", () => {
    expect(getTauxDroitsMutation("75", "ancien")).toBe(baremes.notaire.droitsMutation.standard);
  });

  test("calculerFraisNotaire: CSI respecte le minimum", () => {
    const r = calculerFraisNotaire({
      prixAchat: 1000,
      typeBien: "ancien",
      departement: "75",
      emoluments: 0,
      fraisDivers: 0,
    });
    expect(r.csi).toBe(baremes.notaire.csi.minimum);
  });

  test("calculerFraisNotaire: total inclut tous les postes", () => {
    const r = calculerFraisNotaire({
      prixAchat: 200000,
      typeBien: "ancien",
      departement: "75",
      emoluments: 1000,
      fraisDivers: 500,
      fraisHypotheque: 200,
      fraisTerrain: 0,
      tva: 123,
    });
    const droits = Math.round(200000 * baremes.notaire.droitsMutation.standard);
    const csi = Math.max(Math.round(200000 * baremes.notaire.csi.taux), baremes.notaire.csi.minimum);
    const totalAttendu = 1000 + droits + (500 + csi) + 200 + 0 + 123;
    expect(r.total).toBe(totalAttendu);
  });
});

