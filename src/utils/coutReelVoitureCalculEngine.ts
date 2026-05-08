export interface CoutReelVoitureCalculData {
  // Infos voiture
  carburant: "essence" | "diesel" | "hybride" | "electrique";
  kilometrageAnnuel: number;
  consommation: number; // L/100km pour essence/diesel, kWh/100km pour électrique
  prixCarburant: number; // € pour essence/diesel (par litre), € pour électrique (par kWh)

  // Coûts fixes annuels
  assuranceAnnuelle: number;
  carteGriseAnnuelle: number; // ou 0 si payée une seule fois
  revisionAnnuelle: number;
  parking: number; // mensuel × 12

  // Coûts variables
  peagesAnnuels: number;
  contraventions: number;

  // Financement (optionnel)
  creditMensuel: number;
}

export interface CoutReelVoitureResult {
  success: boolean;
  coutMensuelTotal: number;
  coutAnnuelTotal: number;
  coutParKm: number;
  details: {
    carburantMensuel: number;
    carburantAnnuel: number;
    assuranceMensuel: number;
    entretienMensuel: number;
    parkingMensuel: number;
    othersMensuel: number;
    creditMensuel: number;
    totalMensuel: number;
  };
  explications: string;
}

export function calculerCoutReelVoiture(data: CoutReelVoitureCalculData): CoutReelVoitureResult {
  // Calcul du coût carburant/énergie
  const consommationAnnuelle = (data.kilometrageAnnuel / 100) * data.consommation;
  const coutCarburantAnnuel = consommationAnnuelle * data.prixCarburant;
  const coutCarburantMensuel = coutCarburantAnnuel / 12;

  // Calcul des coûts fixes mensuels
  const assuranceMensuel = data.assuranceAnnuelle / 12;
  const carteGriseMensuel = data.carteGriseAnnuelle / 12;
  const revisionMensuel = data.revisionAnnuelle / 12;
  const parkingMensuel = data.parking;

  // Autres coûts
  const othersMensuel = (data.peagesAnnuels + data.contraventions) / 12;

  // Total mensuel
  const entretienMensuel = carteGriseMensuel + revisionMensuel;
  const totalSansCredit =
    coutCarburantMensuel + assuranceMensuel + entretienMensuel + parkingMensuel + othersMensuel;
  const coutMensuelTotal = totalSansCredit + data.creditMensuel;

  // Annuel
  const coutAnnuelTotal = coutMensuelTotal * 12;

  // Coût par km
  const coutParKm = data.kilometrageAnnuel > 0 ? coutAnnuelTotal / data.kilometrageAnnuel : 0;

  return {
    success: true,
    coutMensuelTotal,
    coutAnnuelTotal,
    coutParKm,
    details: {
      carburantMensuel: coutCarburantMensuel,
      carburantAnnuel: coutCarburantAnnuel,
      assuranceMensuel,
      entretienMensuel,
      parkingMensuel,
      othersMensuel,
      creditMensuel: data.creditMensuel,
      totalMensuel: coutMensuelTotal,
    },
    explications: `Avec une voiture consommant ${data.consommation}${data.carburant === "electrique" ? " kWh/100km" : " L/100km"} et ${data.kilometrageAnnuel} km par an, le coût réel estimé est ${coutMensuelTotal.toFixed(2)}€ par mois.`,
  };
}

export function formatCoutReelVoitureResult(result: CoutReelVoitureResult): {
  montantDisplay: string;
  explDisplay: string;
  detailsDisplay: string;
} {
  const montantDisplay = `${result.coutMensuelTotal.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR / mois`;

  const explDisplay = result.explications;

  const detailsDisplay = [
    `• Carburant/Électricité : -${result.details.carburantMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `• Assurance : -${result.details.assuranceMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `• Entretien (révisions + carte grise) : -${result.details.entretienMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    result.details.parkingMensuel > 0
      ? `• Parking : -${result.details.parkingMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
      : "",
    result.details.othersMensuel > 0
      ? `• Péages & autres : -${result.details.othersMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
      : "",
    result.details.creditMensuel > 0
      ? `• Crédit auto : -${result.details.creditMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
      : "",
    `• = Coût total estimé : ${result.details.totalMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  return {
    montantDisplay,
    explDisplay,
    detailsDisplay,
  };
}
