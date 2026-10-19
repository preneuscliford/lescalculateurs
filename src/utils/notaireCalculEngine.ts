/**
 * Frais de notaire - moteur complet (émoluments dégressifs, droits de
 * mutation par département, débours/formalités, CSI, frais d'hypothèque,
 * TVA). Logique portée telle quelle depuis le calculateur historique
 * (src/pages/notaire.html, calcul inline) pour pouvoir être réutilisée par
 * l'API sans dupliquer une seconde formule divergente.
 *
 * Note : src/utils/calculNotaire.ts est un module plus ancien qui exige des
 * émoluments déjà calculés en entrée ; ce fichier-ci calcule tout de bout en
 * bout à partir du seul prix d'achat, comme le fait la page en production.
 */

import baremesJson from "../data/baremes.json";

interface NotaireBaremes {
  notaire: {
    tranches: { min: number; max: number; taux: number }[];
    fraisDivers: { hypotheque: number; cadastre: number; conservation: number; formalites: number };
    fraisDiversParDepartement?: Record<
      string,
      { cadastre: number; conservation: number; formalites: number }
    >;
    csi: { taux: number; minimum: number };
    droitsMutation: {
      standard: number;
      neuf: number;
      reduit: number;
      departementsReduits: string[];
    };
  };
  dmto?: Record<string, number>;
}

const bjson = baremesJson as unknown as NotaireBaremes;

export type TypeBienNotaire = "ancien" | "neuf" | "terrain";
export type TypeEmpruntNotaire = "sans" | "sans_garantie" | "avec_garantie";

export interface NotaireCalculData {
  prixAchat: number;
  typeBien: TypeBienNotaire;
  departement: string;
  montantMobilier?: number;
  typeEmprunt?: TypeEmpruntNotaire;
  pretsAides?: number;
  autresPrets?: number;
  /** Remise maximale autorisée : 20 % des émoluments proportionnels sur la part du prix ≥ 100 000 € */
  remiseNotarialeVariable?: boolean;
  /** Premier achat de la résidence principale : pas de hausse des DMTO (art. 116 LF 2025) */
  primoAccedant?: boolean;
}

export interface NotaireCalculResult {
  success: boolean;
  emoluments: number;
  emolumentsSansRemise: number;
  remiseMontant: number;
  debours: number;
  formalites: number;
  csi: number;
  fraisHypotheque: number;
  fraisTerrain: number;
  droitsEnregistrement: number;
  tauxDroits: number;
  tva: number;
  total: number;
  pourcentage: number;
  prixAchat: number;
  prixNetImmobilier: number;
  montantMobilier: number;
  montantTotalPrets: number;
}

// Taux global DMTO sans la hausse de l'article 116 (taux de base 4,50 %), barème DGFiP 01/06/2026
const PRIMO_ACCEDANT_TAUX_MAX = 0.058;

function getDmtoTaux(departement: string): number {
  const c = String(departement);
  if (bjson.dmto && bjson.dmto[c] != null) {
    return Number(bjson.dmto[c]) / 100;
  }
  return Number(bjson.notaire?.droitsMutation?.standard || 0.0581);
}

function getDeboursFormalites(departement: string): { debours: number; formalites: number } {
  const c = String(departement);
  const dep = bjson.notaire?.fraisDiversParDepartement?.[c];
  if (dep) {
    return {
      debours: Number(dep.cadastre || 0) + Number(dep.conservation || 0),
      formalites: Number(dep.formalites || 0),
    };
  }
  const fd = bjson.notaire?.fraisDivers || { cadastre: 0, conservation: 0, formalites: 0 };
  return {
    debours: Number(fd.cadastre || 0) + Number(fd.conservation || 0),
    formalites: Number(fd.formalites || 0),
  };
}

const REMISE_SEUIL = 100000;
const REMISE_TAUX_MAX = 0.2;

export function calculerNotaire(data: NotaireCalculData): NotaireCalculResult {
  const prixAchat = Math.max(0, data.prixAchat || 0);
  const montantMobilier = Math.max(0, data.montantMobilier || 0);
  const typeBien = data.typeBien;
  const departement = data.departement;
  const typeEmprunt = data.typeEmprunt || "sans";
  const pretsAides = Math.max(0, data.pretsAides || 0);
  const autresPrets = Math.max(0, data.autresPrets || 0);
  const remiseVar = data.remiseNotarialeVariable === true;

  const prixNetImmobilier = prixAchat - montantMobilier;
  const montantTotalPrets = pretsAides + autresPrets;

  const tranches = (bjson.notaire?.tranches || []).map((t) => ({
    min: t.min,
    max: t.max === 999999999 ? Infinity : t.max,
    taux: Number(t.taux),
  }));
  const trancheDefaut =
    tranches.length > 0
      ? tranches
      : [
          { min: 0, max: 6500, taux: 0.0387 },
          { min: 6500, max: 17000, taux: 0.01596 },
          { min: 17000, max: 60000, taux: 0.01064 },
          { min: 60000, max: Infinity, taux: 0.00799 },
        ];

  let emoluments = 0;
  let emolumentsSansRemise = 0;
  let reste = prixNetImmobilier;
  for (const tranche of trancheDefaut) {
    if (reste <= 0) break;
    const montantTranche = Math.min(reste, tranche.max - tranche.min);
    emoluments += montantTranche * tranche.taux;
    emolumentsSansRemise += montantTranche * tranche.taux;
    reste -= montantTranche;
  }

  // Remise (art. R444-10 du code de commerce, depuis le 1er janvier 2021) : 20 % au plus,
  // uniquement sur les émoluments calculés sur la part du prix égale ou supérieure à 100 000 €
  let remiseMontant = 0;
  if (remiseVar) {
    for (const tranche of trancheDefaut) {
      const bas = Math.max(tranche.min, REMISE_SEUIL);
      const haut = Math.min(tranche.max, prixNetImmobilier);
      if (haut > bas) remiseMontant += (haut - bas) * tranche.taux * REMISE_TAUX_MAX;
    }
    emoluments -= remiseMontant;
  }

  const { debours, formalites } = getDeboursFormalites(departement);

  const csi = Math.max(
    prixNetImmobilier * Number(bjson.notaire?.csi?.taux || 0.001),
    Number(bjson.notaire?.csi?.minimum || 15),
  );

  let fraisHypotheque = 0;
  if (typeEmprunt === "avec_garantie" && montantTotalPrets > 0) {
    fraisHypotheque = Math.max(375, montantTotalPrets * 0.015);
  } else if (typeEmprunt === "sans_garantie" && montantTotalPrets > 0) {
    fraisHypotheque = 150;
  }

  const fraisTerrain = typeBien === "terrain" ? 100 : 0;

  const tva = Math.round((emoluments + formalites) * 0.2 * 100) / 100;

  let tauxDroits = getDmtoTaux(departement);
  // Primo-accédant : la hausse à 5 % (art. 116 LF 2025) ne s'applique pas ; les
  // départements à 6,32 % avaient tous un taux de base de 4,50 % (5,80 % au total).
  if (data.primoAccedant === true && typeBien !== "neuf" && tauxDroits > PRIMO_ACCEDANT_TAUX_MAX) {
    tauxDroits = PRIMO_ACCEDANT_TAUX_MAX;
  }
  let droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;
  if (typeBien === "neuf") {
    tauxDroits = 0.00715;
    droitsEnregistrement = Math.round(prixNetImmobilier * tauxDroits * 100) / 100;
  }

  const total =
    Math.round(
      (emoluments +
        droitsEnregistrement +
        debours +
        formalites +
        csi +
        fraisHypotheque +
        fraisTerrain +
        tva) *
        100,
    ) / 100;
  const pourcentage = prixAchat > 0 ? Math.round((total / prixAchat) * 10000) / 100 : 0;

  return {
    success: true,
    emoluments: Math.round(emoluments * 100) / 100,
    emolumentsSansRemise: Math.round(emolumentsSansRemise * 100) / 100,
    remiseMontant: Math.round(remiseMontant * 100) / 100,
    debours: Math.round(debours * 100) / 100,
    formalites: Math.round(formalites * 100) / 100,
    csi: Math.round(csi * 100) / 100,
    fraisHypotheque: Math.round(fraisHypotheque * 100) / 100,
    fraisTerrain: Math.round(fraisTerrain * 100) / 100,
    droitsEnregistrement,
    tauxDroits,
    tva,
    total,
    pourcentage,
    prixAchat: Math.round(prixAchat * 100) / 100,
    prixNetImmobilier: Math.round(prixNetImmobilier * 100) / 100,
    montantMobilier: Math.round(montantMobilier * 100) / 100,
    montantTotalPrets: Math.round(montantTotalPrets * 100) / 100,
  };
}
