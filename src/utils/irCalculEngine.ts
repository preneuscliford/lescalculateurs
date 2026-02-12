export interface BaremeTranche {
  plafond: number;
  taux: number;
}

export interface IRInput {
  revenu: number;
  parts: number;
}

export interface IRResult {
  revenu: number;
  parts: number;
  qf: number;
  irBrut: number;
  tauxMoyen: number;
  tauxMarginal: number;
  mensualiteMoyenne: number;
}

// Barème IR 2026 (revenus 2025) - Source : Article 197 du CGI - service-public.fr
export const baremeIR2026: BaremeTranche[] = [
  { plafond: 11497, taux: 0 },      // 0%
  { plafond: 29315, taux: 0.11 },   // 11% (corrigé : 28 797 → 29 315)
  { plafond: 83823, taux: 0.3 },    // 30% (corrigé : 82 341 → 83 823)
  { plafond: 180000, taux: 0.41 },  // 41% (corrigé : 177 106 → 180 000)
  { plafond: Number.POSITIVE_INFINITY, taux: 0.45 }, // 45%
];

export function calculerIR(input: IRInput, bareme: BaremeTranche[] = baremeIR2026): IRResult {
  const revenu = Number(input.revenu);
  const parts = Number(input.parts);
  if (!isFinite(revenu) || revenu < 0 || !isFinite(parts) || parts <= 0) {
    throw new Error("Entrées invalides");
  }

  const qf = revenu / parts;
  let impotsParPart = 0;
  let prev = 0;

  for (const tranche of bareme) {
    const plafond = tranche.plafond;
    const taux = tranche.taux;
    const base = Math.max(0, Math.min(qf, plafond) - prev);
    impotsParPart += base * taux;
    prev = plafond;
    if (qf <= plafond) break;
  }

  const irBrut = impotsParPart * parts;
  const tauxMoyen = revenu > 0 ? irBrut / revenu : 0;
  const mensualiteMoyenne = irBrut / 12;
  const tauxMarginal = bareme.find((b) => qf <= b.plafond)?.taux ?? bareme[bareme.length - 1]?.taux ?? 0;

  return {
    revenu,
    parts,
    qf,
    irBrut,
    tauxMoyen,
    tauxMarginal,
    mensualiteMoyenne,
  };
}
