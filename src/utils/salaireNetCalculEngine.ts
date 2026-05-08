import { socialBaremes } from "../data/social-baremes";

export interface SalaireNetCalculData {
  salaireBrut: number;
  statut: "salarie" | "independant" | "auto-entrepreneur";
  primes: number;
  heuresSup: number;
  ticketsResto: number;
  mutuelle: number;
  enfants: number;
  mariageOrPacs: boolean;
}

export interface SalaireNetResult {
  success: boolean;
  salaireNetMensuel: number;
  salaireNetAnnuel: number;
  impotPasTotal: number;
  cotisationsSociales: number;
  salaireGrossMensuel: number;
  tauxEffectif: number;
  explications: string;
  details: {
    salaireBase: number;
    primes: number;
    heuresSup: number;
    brutTotal: number;
    cotisationsEmploye: number;
    prelevementSource: number;
    ticketsResto: number;
    mutuelle: number;
    netTotal: number;
  };
}

// Barèmes 2026 (impôt sur le revenu)
const BAREMES_2026 = {
  // Tranches d'imposition 2026 (non-résident)
  tranches: [
    { limite: 11294, taux: 0 },
    { limite: 28797, taux: 0.11 },
    { limite: 82341, taux: 0.3 },
    { limite: 177106, taux: 0.41 },
    { limite: Infinity, taux: 0.45 },
  ],
  // Quotient familial (parts)
  quotientFamilial: {
    seul: 1,
    couple: 2,
    enfant: 0.5,
    troisEntantsOuPlus: 1, // à partir du 3e enfant
  },
  // Décote 2026
  decote: {
    limite: 1686,
  },
  // Abattement de base (10% du revenu imposable)
  abattementBase: 0.1,
};

// Cotisations sociales salarié 2026 (environ)
const COTISATIONS_2026 = {
  secu: 0.082, // 8.2% maladie
  retraite: 0.062, // 6.2% retraite complémentaire
  chômage: 0.0405, // 4.05% chômage
  versementTransport: 0.005, // 0.5% (variable selon région)
};

function calculateCotisations(brutSalaire: number): number {
  const totalCotisations =
    COTISATIONS_2026.secu +
    COTISATIONS_2026.retraite +
    COTISATIONS_2026.chômage +
    COTISATIONS_2026.versementTransport;
  return brutSalaire * totalCotisations;
}

function calculateImportFoncier(revenusImposables: number, quotientFamilial: number): number {
  if (revenusImposables <= 0) return 0;

  const quotient = revenusImposables / quotientFamilial;
  let impot = 0;

  for (const tranche of BAREMES_2026.tranches) {
    if (quotient <= tranche.limite) {
      impot +=
        (quotient -
          (BAREMES_2026.tranches[BAREMES_2026.tranches.indexOf(tranche) - 1]?.limite || 0)) *
        tranche.taux;
      break;
    }
    const precLimite =
      BAREMES_2026.tranches[BAREMES_2026.tranches.indexOf(tranche) - 1]?.limite || 0;
    impot += (tranche.limite - precLimite) * tranche.taux;
  }

  impot *= quotientFamilial;

  // Application décote
  if (impot > 0 && impot < BAREMES_2026.decote.limite) {
    impot = Math.max(0, impot - (BAREMES_2026.decote.limite - impot) * 0.25);
  }

  return Math.max(0, impot);
}

function getQuotientFamilial(enfants: number, mariageOrPacs: boolean): number {
  let parts = mariageOrPacs ? 2 : 1;
  if (enfants > 0) {
    if (enfants <= 2) {
      parts += enfants * 0.5;
    } else {
      parts += 1 + (enfants - 2) * 0.5;
    }
  }
  return parts;
}

export function calculerSalaireNet(data: SalaireNetCalculData): SalaireNetResult {
  // Calcul du salaire brut total
  const brutTotal = data.salaireBrut + data.primes + data.heuresSup;

  // Cotisations sociales salarié
  const cotisations = calculateCotisations(brutTotal);

  // Revenu imposable (brut - cotisations - abattement)
  const revenusImposables = brutTotal - cotisations;
  const revenusImposablesAbattement = Math.max(
    0,
    revenusImposables * (1 - BAREMES_2026.abattementBase),
  );

  // Quotient familial
  const quotientFamilial = getQuotientFamilial(data.enfants, data.mariageOrPacs);

  // Impôt sur le revenu
  const impotAnnuel = calculateImportFoncier(revenusImposablesAbattement * 12, quotientFamilial);
  const impotMensuel = impotAnnuel / 12;

  // Prélèvement à la source mensuel
  const prelevementSource = Math.max(0, impotMensuel);

  // Calcul avantages non-imposables
  const avantageNetFiscal = data.ticketsResto + data.mutuelle;

  // Salaire net
  const salaireNetMensuel = brutTotal - cotisations - prelevementSource;
  const salaireNetAvecAvantages = salaireNetMensuel + avantageNetFiscal;

  const tauxEffectif = brutTotal > 0 ? (prelevementSource + cotisations) / brutTotal : 0;

  return {
    success: true,
    salaireNetMensuel: salaireNetAvecAvantages,
    salaireNetAnnuel: salaireNetAvecAvantages * 12,
    impotPasTotal: prelevementSource * 12,
    cotisationsSociales: cotisations * 12,
    salaireGrossMensuel: brutTotal,
    tauxEffectif,
    explications: `Avec un salaire brut de ${brutTotal.toFixed(2)}€ et ${data.enfants} enfant(s), votre salaire net estimé est ${salaireNetAvecAvantages.toFixed(2)}€ par mois.`,
    details: {
      salaireBase: data.salaireBrut,
      primes: data.primes,
      heuresSup: data.heuresSup,
      brutTotal,
      cotisationsEmploye: cotisations,
      prelevementSource,
      ticketsResto: data.ticketsResto,
      mutuelle: data.mutuelle,
      netTotal: salaireNetAvecAvantages,
    },
  };
}

export function formatSalaireNetResult(result: SalaireNetResult): {
  montantDisplay: string;
  explDisplay: string;
  detailsDisplay: string;
} {
  const montantDisplay = `${result.salaireNetMensuel.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR / mois`;

  const explDisplay = result.explications;

  const detailsDisplay = [
    `• Salaire brut : ${result.details.brutTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `• Cotisations sociales : -${result.details.cotisationsEmploye.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    `• Prélèvement à la source : -${result.details.prelevementSource.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
    result.details.ticketsResto > 0
      ? `• Tickets restaurant : +${result.details.ticketsResto.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
      : "",
    result.details.mutuelle > 0
      ? `• Mutuelle prise en charge : +${result.details.mutuelle.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
      : "",
    `• = Salaire net estimé : ${result.details.netTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`,
  ]
    .filter((line) => line.length > 0)
    .join("\n");

  return {
    montantDisplay,
    explDisplay,
    detailsDisplay,
  };
}
