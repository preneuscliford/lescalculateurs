export interface ResteAVivreCalculData {
  // Revenus
  salaireNetMensuel: number;
  autresRevenus: number; // Revenus locatifs, allocations autres que aides, etc.

  // Aides sociales (optionnelles)
  primActivite: number;
  rsa: number;
  apl: number;
  aah: number;
  autresAides: number;

  // Charges fixes
  loyer: number; // ou mensualité crédit immobilier
  assuranceLogement: number;
  electricite: number;
  eau: number;
  internet: number;
  telephone: number;

  // Autres charges
  transportRoutier: number; // carburant + assurance + entretien
  transportPublic: number;
  assuranceSante: number; // mutuelle non couverte par employeur
  gardienEnfants: number;

  // Charges variables estimées
  alimentation: number;
  hygiene: number;
  vetements: number;
  loisirs: number;
  autres: number;

  // Nombre de personnes dans le foyer
  nbPersonnes: number;
  nbEnfants: number;
}

export interface ResteAVivreResult {
  success: boolean;
  resteAVivre: number; // montant mensuel restant
  toutcharges: number; // total de toutes les charges
  revenus: number; // total de tous les revenus
  tauxEndettement: number; // (charges / revenus) %
  niveauRisque: "faible" | "modéré" | "élevé" | "critique";
  explications: string;
  details: {
    revenusTotal: number;
    chargesLogementi: number;
    chargesTransport: number;
    chargesSante: number;
    chargesAlimentaires: number;
    chargesAffaires: number;
    chargesDiverses: number;
    chargesTotal: number;
    resteDisponible: number;
    resteParPersonne: number;
  };
}

export function calculerResteAVivre(data: ResteAVivreCalculData): ResteAVivreResult {
  // Calcul des revenus totaux
  const revenus =
    data.salaireNetMensuel +
    data.autresRevenus +
    data.primActivite +
    data.rsa +
    data.apl +
    data.aah +
    data.autresAides;

  // Calcul des charges
  const chargesLogement =
    data.loyer +
    data.assuranceLogement +
    data.electricite +
    data.eau +
    data.internet +
    data.telephone;
  const chargesTransport = data.transportRoutier + data.transportPublic;
  const chargesSante = data.assuranceSante;
  const chargesAlimentaires = data.alimentation + data.hygiene;
  const chargesAffaires = data.vetements + data.gardienEnfants;
  const chargesDiverses = data.loisirs + data.autres;

  const chargesTotal =
    chargesLogement +
    chargesTransport +
    chargesSante +
    chargesAlimentaires +
    chargesAffaires +
    chargesDiverses;

  // Reste à vivre
  const resteAVivre = revenus - chargesTotal;

  // Reste par personne
  const resteParPersonne = resteAVivre / Math.max(1, data.nbPersonnes);

  // Taux d'endettement (charges / revenus)
  const tauxEndettement = revenus > 0 ? (chargesTotal / revenus) * 100 : 0;

  // Niveau de risque
  let niveauRisque: "faible" | "modéré" | "élevé" | "critique";
  if (tauxEndettement < 40) {
    niveauRisque = "faible";
  } else if (tauxEndettement < 60) {
    niveauRisque = "modéré";
  } else if (tauxEndettement < 85) {
    niveauRisque = "élevé";
  } else {
    niveauRisque = "critique";
  }

  const riskEmoji = {
    faible: "✅",
    modéré: "⚠️",
    élevé: "⚠️⚠️",
    critique: "🔴",
  };

  return {
    success: true,
    resteAVivre,
    toutcharges: chargesTotal,
    revenus,
    tauxEndettement: Math.round(tauxEndettement * 100) / 100,
    niveauRisque,
    explications: `${riskEmoji[niveauRisque]} Avec des revenus de ${revenus.toFixed(2)}€ et des charges de ${chargesTotal.toFixed(2)}€, il vous reste environ ${resteAVivre.toFixed(2)}€ par mois pour vivre.`,
    details: {
      revenusTotal: revenus,
      chargesLogementi: chargesLogement,
      chargesTransport,
      chargesSante,
      chargesAlimentaires,
      chargesAffaires,
      chargesDiverses,
      chargesTotal,
      resteDisponible: resteAVivre,
      resteParPersonne,
    },
  };
}

export function formatResteAVivreResult(result: ResteAVivreResult): {
  montantDisplay: string;
  explDisplay: string;
  detailsDisplay: string;
  riskColor: string;
} {
  const colorMap = {
    faible: "text-green-600",
    modéré: "text-amber-600",
    élevé: "text-orange-600",
    critique: "text-red-600",
  };

  const montantDisplay = `${result.resteAVivre.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR / mois`;

  const explDisplay = result.explications;

  const detailsDisplay = [
    `• Revenus totaux : ${result.details.revenusTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    ``,
    `Charges détaillées :`,
    `  • Logement : -${result.details.chargesLogementi.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `  • Transport : -${result.details.chargesTransport.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `  • Santé : -${result.details.chargesSante.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `  • Alimentation & hygiène : -${result.details.chargesAlimentaires.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `  • Affaires & enfants : -${result.details.chargesAffaires.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `  • Loisirs & divers : -${result.details.chargesDiverses.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    ``,
    `Total charges : -${result.details.chargesTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `Taux d'endettement : ${result.tauxEndettement}% (${result.niveauRisque})`,
    ``,
    `= Reste à vivre : ${result.details.resteDisponible.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
  ].join("\n");

  return {
    montantDisplay,
    explDisplay,
    detailsDisplay,
    riskColor: colorMap[result.niveauRisque],
  };
}
