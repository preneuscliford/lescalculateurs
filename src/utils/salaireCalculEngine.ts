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

export function calculerSalaire(input: SalaireInput): SalaireResult {
  const brut = Number(input.brutMensuel);
  const statut = input.statut;
  const tauxPAS = Number(input.tauxPAS ?? 0) || 0;

  if (!isFinite(brut) || brut <= 0) throw new Error("Brut invalide");
  if (statut !== "cadre" && statut !== "non_cadre") throw new Error("Statut invalide");
  if (!isFinite(tauxPAS) || tauxPAS < 0 || tauxPAS > 100) throw new Error("Taux PAS invalide");

  const tauxSalarial = statut === "cadre" ? 0.25 : 0.23;
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
