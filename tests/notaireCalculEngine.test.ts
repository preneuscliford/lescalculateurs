import { calculerNotaire } from "../src/utils/notaireCalculEngine";

describe("notaireCalculEngine", () => {
  test("cas standard vérifié : ancien, Paris (75), 250 000 EUR", () => {
    const r = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
    });
    expect(r.success).toBe(true);
    expect(r.droitsEnregistrement).toBeCloseTo(15800, 0);
    expect(r.csi).toBeCloseTo(250, 0);
    expect(r.total).toBeCloseTo(19517.7, 0);
    expect(r.pourcentage).toBeCloseTo(7.81, 1);
  });

  test("bien neuf : taux de droits d'enregistrement réduit (0,715%)", () => {
    const r = calculerNotaire({
      prixAchat: 250000,
      typeBien: "neuf",
      departement: "75",
    });
    expect(r.tauxDroits).toBeCloseTo(0.00715, 5);
    expect(r.droitsEnregistrement).toBeCloseTo(1787.5, 1);
  });

  test("remise notariale : 20 % des émoluments sur la part du prix au-delà de 100 000 €", () => {
    const sansRemise = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
    });
    const avecRemise = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
      remiseNotarialeVariable: true,
    });
    // 150 000 € au-delà de 100 000 €, tranche à 0,799 % : 150 000 × 0,799 % × 20 % = 239,70 €
    expect(avecRemise.remiseMontant).toBeCloseTo(239.7, 1);
    expect(avecRemise.emoluments).toBeCloseTo(sansRemise.emoluments - 239.7, 1);
    const petitPrix = calculerNotaire({ prixAchat: 90000, typeBien: "ancien", departement: "75", remiseNotarialeVariable: true });
    expect(petitPrix.remiseMontant).toBe(0);
  });

  test("frais d'hypothèque appliqués selon le type d'emprunt", () => {
    const sansEmprunt = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
      typeEmprunt: "sans",
    });
    const avecGarantie = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
      typeEmprunt: "avec_garantie",
      autresPrets: 200000,
    });
    expect(sansEmprunt.fraisHypotheque).toBe(0);
    expect(avecGarantie.fraisHypotheque).toBeCloseTo(3000, 0); // 1.5% de 200 000
  });

  test("frais supplémentaires de 100 EUR pour un terrain", () => {
    const r = calculerNotaire({
      prixAchat: 100000,
      typeBien: "terrain",
      departement: "75",
    });
    expect(r.fraisTerrain).toBe(100);
  });

  test("CSI respecte le minimum réglementaire sur un petit montant", () => {
    const r = calculerNotaire({
      prixAchat: 1000,
      typeBien: "ancien",
      departement: "75",
    });
    expect(r.csi).toBe(15);
  });

  test("le mobilier déduit est exclu du prix net immobilier", () => {
    const r = calculerNotaire({
      prixAchat: 250000,
      typeBien: "ancien",
      departement: "75",
      montantMobilier: 10000,
    });
    expect(r.prixNetImmobilier).toBe(240000);
    expect(r.montantMobilier).toBe(10000);
  });

  test("primo-accédant : pas de hausse des DMTO (6,32 % -> 5,80 %), sans effet ailleurs", () => {
    const paris = calculerNotaire({ prixAchat: 250000, typeBien: "ancien", departement: "75", primoAccedant: true });
    expect(paris.tauxDroits).toBeCloseTo(0.058, 6);
    expect(paris.droitsEnregistrement).toBeCloseTo(14500, 0);
    // Département resté à 4,50 % (Drôme) : taux inchangé
    const drome = calculerNotaire({ prixAchat: 250000, typeBien: "ancien", departement: "26", primoAccedant: true });
    expect(drome.tauxDroits).toBeCloseTo(0.058, 6);
    // Indre (3,80 %) : taux inchangé
    const indre = calculerNotaire({ prixAchat: 250000, typeBien: "ancien", departement: "36", primoAccedant: true });
    expect(indre.tauxDroits).toBeCloseTo(0.0509, 6);
    // Neuf : toujours 0,715 %
    const neuf = calculerNotaire({ prixAchat: 250000, typeBien: "neuf", departement: "75", primoAccedant: true });
    expect(neuf.tauxDroits).toBeCloseTo(0.00715, 6);
  });
});
