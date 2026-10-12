import { baremes } from "../data/baremes";
import baremesJson from "../data/baremes.json";

// Taux DMTO globaux par département (barème DGFiP), même source que la page notaire
const dmtoParDepartement = (baremesJson as { dmto?: Record<string, number> }).dmto ?? {};

export interface CalculNotaireParams {
  prixAchat: number;
  typeBien: "ancien" | "neuf" | "terrain";
  departement: string; // ex: "38"
  emoluments: number; // calculés ailleurs selon barème
  fraisDivers: number; // hors CSI
  fraisHypotheque?: number;
  fraisTerrain?: number;
  tva?: number;
}

export interface CalculNotaireResult {
  droitsEnregistrement: number;
  csi: number;
  totalFraisDivers: number;
  total: number;
  pourcentage: number;
}

export function getTauxDroitsMutation(
  departement: string,
  typeBien: string
): number {
  const { droitsMutation } = baremes.notaire;
  if (typeBien === "neuf") return droitsMutation.neuf;
  const tauxDepartement = dmtoParDepartement[departement];
  if (tauxDepartement != null) return tauxDepartement / 100;
  if (droitsMutation.departementsReduits.includes(departement))
    return droitsMutation.reduit;
  return droitsMutation.standard;
}

export function calculerFraisNotaire(
  params: CalculNotaireParams
): CalculNotaireResult {
  const {
    prixAchat,
    typeBien,
    departement,
    emoluments,
    fraisDivers,
    fraisHypotheque = 0,
    fraisTerrain = 0,
    tva = 0,
  } = params;
  const tauxMutation = getTauxDroitsMutation(departement, typeBien);
  const droitsEnregistrement = Math.round(prixAchat * tauxMutation);
  const csiTaux = baremes.notaire.csi.taux;
  const csiMin = baremes.notaire.csi.minimum;
  const csi = Math.max(Math.round(prixAchat * csiTaux), csiMin);
  const totalFraisDivers = fraisDivers + csi;
  const total =
    emoluments +
    droitsEnregistrement +
    totalFraisDivers +
    fraisHypotheque +
    fraisTerrain +
    tva;
  const pourcentage = prixAchat > 0 ? (total / prixAchat) * 100 : 0;
  return {
    droitsEnregistrement,
    csi,
    totalFraisDivers,
    total,
    pourcentage,
  };
}
