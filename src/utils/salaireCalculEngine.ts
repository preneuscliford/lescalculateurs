export type StatutSalarie = "cadre" | "non_cadre";

export interface SalaireInput {
  brutMensuel: number;
  statut: StatutSalarie;
  tauxPAS?: number;
}

export interface SalaireResult {
  brut: number;
  statut: StatutSalarie;
  tauxSalarial: number;
  netAvantImpot: number;
  pasMensuel: number;
  netApresImpot: number;
  brutAnnuel: number;
  netAvantImpotAnnuel: number;
  pasAnnuel: number;
  netApresImpotAnnuel: number;
  tauxPAS: number;
}

// Taux de cotisations salariales 2026 (sous le plafond de la Sécurité sociale) : voir calculerSalaire
export const TAUX_SALARIAL: Record<StatutSalarie, number> = { non_cadre: 0.2084, cadre: 0.2101 };

export function calculerSalaire(input: SalaireInput): SalaireResult {
  const brut = Number(input.brutMensuel);
  const statut = input.statut;
  const tauxPAS = Number(input.tauxPAS ?? 0) || 0;

  if (!isFinite(brut) || brut <= 0) throw new Error("Brut invalide");
  if (statut !== "cadre" && statut !== "non_cadre") throw new Error("Statut invalide");
  if (!isFinite(tauxPAS) || tauxPAS < 0 || tauxPAS > 100) throw new Error("Taux PAS invalide");

  // Cotisations salariales 2026 sous le plafond de la Sécurité sociale : vieillesse 7,30 %,
  // Agirc-Arrco T1 4,01 %, CSG-CRDS 9,70 % sur 98,25 % du brut = 20,84 % (identique à
  // salaireNetCalculEngine) ; cadre : + APEC et écart mesuré sur le simulateur Urssaf.
  // Les anciens taux fixes (23 % / 25 %) sous-estimaient le net de 10 à 184 € par mois.
  const tauxSalarial = TAUX_SALARIAL[statut];
  const netAvantImpot = brut * (1 - tauxSalarial);
  const pasMensuel = netAvantImpot * (tauxPAS / 100);
  const netApresImpot = netAvantImpot - pasMensuel;

  return {
    brut,
    statut,
    tauxSalarial,
    netAvantImpot,
    pasMensuel,
    netApresImpot,
    brutAnnuel: brut * 12,
    netAvantImpotAnnuel: netAvantImpot * 12,
    pasAnnuel: pasMensuel * 12,
    netApresImpotAnnuel: netApresImpot * 12,
    tauxPAS,
  };
}
