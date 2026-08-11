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

// Barème IR 2026 (revenus 2025) - Article 197 du CGI, loi n°2026-103 du
// 19/02/2026. Verifie sur Legifrance (LEGIARTI000051212954) le 11/08/2026 :
// https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954
export const baremeIR2026: BaremeTranche[] = [
  { plafond: 11600, taux: 0 }, // 0%
  { plafond: 29579, taux: 0.11 }, // 11%
  { plafond: 84577, taux: 0.3 }, // 30%
  { plafond: 181917, taux: 0.41 }, // 41%
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
