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
  // Tranches d'imposition 2026 (revenus 2025) - Article 197 du CGI, loi
  // n°2026-103 du 19/02/2026, identiques à src/utils/irCalculEngine.ts.
  // Verifie sur Legifrance (LEGIARTI000051212954) le 11/08/2026.
  tranches: [
    { limite: 11600, taux: 0 },
    { limite: 29579, taux: 0.11 },
    { limite: 84577, taux: 0.3 },
    { limite: 181917, taux: 0.41 },
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

// Cotisations sociales salarié 2026 - régime général, non-cadre, tranche 1
// (sous le plafond mensuel de la Sécurité sociale). Vérifié le 11/08/2026 :
// - Depuis la réforme de 2018, le salarié ne paie plus de cotisation
//   maladie ni chômage (transférées côté employeur et compensées par une
//   hausse de la CSG) - un ancien modèle de ce fichier calculait encore
//   8,2% de "maladie" et 4,05% de "chômage", ce qui est obsolète depuis 2018.
// - "Versement transport" est une taxe patronale, jamais déduite du
//   salarié : retiré du calcul.
// Sources : legisocial.fr (Agirc-Arrco 2026, CSG/CRDS 2026).
const COTISATIONS_2026 = {
  retraiteBase: 0.073, // Assurance vieillesse plafonnée (6,90%) + déplafonnée (0,40%)
  retraiteComplementaire: 0.0401, // Agirc-Arrco T1 (3,15%) + CEG T1 (0,86%)
  // CSG/CRDS : assises sur 98,25% du brut (abattement forfaitaire de 1,75%
  // pour frais professionnels, dans la limite de 4 PASS)
  assietteCsgCrds: 0.9825,
  csgDeductible: 0.068, // déductible du revenu imposable
  csgNonDeductible: 0.024, // non déductible
  crds: 0.005, // non déductible
};

interface Cotisations {
  /** Réduit le salaire net versé (retraite + CSG déductible et non déductible + CRDS). */
  totalNetPay: number;
  /** Réduit uniquement le revenu imposable (retraite + CSG déductible, pas la CRDS ni la CSG non déductible). */
  deductibleImpot: number;
}

function calculateCotisations(brutSalaire: number): Cotisations {
  const assiette = brutSalaire * COTISATIONS_2026.assietteCsgCrds;
  const retraite = brutSalaire * (COTISATIONS_2026.retraiteBase + COTISATIONS_2026.retraiteComplementaire);
  const csgDeductible = assiette * COTISATIONS_2026.csgDeductible;
  const csgNonDeductibleEtCrds = assiette * (COTISATIONS_2026.csgNonDeductible + COTISATIONS_2026.crds);

  return {
    totalNetPay: retraite + csgDeductible + csgNonDeductibleEtCrds,
    deductibleImpot: retraite + csgDeductible,
  };
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

  // Cotisations sociales salarié (retraite + CSG/CRDS, voir calculateCotisations)
  const cotisations = calculateCotisations(brutTotal);

  // Revenu imposable (brut - part des cotisations déductible de l'impôt - abattement)
  const revenusImposables = brutTotal - cotisations.deductibleImpot;
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
  const salaireNetMensuel = brutTotal - cotisations.totalNetPay - prelevementSource;
  const salaireNetAvecAvantages = salaireNetMensuel + avantageNetFiscal;

  const tauxEffectif = brutTotal > 0 ? (prelevementSource + cotisations.totalNetPay) / brutTotal : 0;

  return {
    success: true,
    salaireNetMensuel: salaireNetAvecAvantages,
    salaireNetAnnuel: salaireNetAvecAvantages * 12,
    impotPasTotal: prelevementSource * 12,
    cotisationsSociales: cotisations.totalNetPay * 12,
    salaireGrossMensuel: brutTotal,
    tauxEffectif,
    explications: `Avec un salaire brut de ${brutTotal.toFixed(2)}€ et ${data.enfants} enfant(s), votre salaire net estimé est ${salaireNetAvecAvantages.toFixed(2)}€ par mois.`,
    details: {
      salaireBase: data.salaireBrut,
      primes: data.primes,
      heuresSup: data.heuresSup,
      brutTotal,
      cotisationsEmploye: cotisations.totalNetPay,
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
