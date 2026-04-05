import { socialBaremes } from "../data/social-baremes";

export interface ASFData {
  situation: "parentisole" | "orphelin" | "depourvu";
  nombreEnfants: number;
  revenus: number;
  enfantACharge: boolean;
}

export interface ASFResult {
  eligible: boolean;
  montantEstime: number;
  explication: string;
  details: {
    montantParEnfant: number;
    ressourcesMaxi: number;
    nombreEnfantsEligibles: number;
  };
}

const asfBaremes = socialBaremes.asf;

export function calculerASF(data: ASFData): ASFResult {
  const { situation, nombreEnfants, enfantACharge } = data;

  if (!enfantACharge || nombreEnfants <= 0) {
    return {
      eligible: false,
      montantEstime: 0,
      explication:
        "L'ASF s'adresse aux foyers qui ont au moins un enfant a charge de moins de 21 ans.",
      details: {
        montantParEnfant: 0,
        ressourcesMaxi: 0,
        nombreEnfantsEligibles: 0,
      },
    };
  }

  const nombreEnfantsEligibles = Math.max(0, Math.floor(nombreEnfants));
  const montantParEnfant =
    situation === "depourvu"
      ? asfBaremes.montantParEnfantPriveDeuxParents
      : asfBaremes.montantParEnfant;
  const montantEstime = Math.round(montantParEnfant * nombreEnfantsEligibles * 100) / 100;

  const explicationBase =
    situation === "depourvu"
      ? "Vous relevez du cas d'un enfant prive du soutien de ses deux parents."
      : "L'ASF est versee sans condition de ressources quand les conditions familiales sont remplies.";

  return {
    eligible: true,
    montantEstime,
    explication: `${explicationBase} Le montant indicatif est d'environ ${montantEstime.toFixed(2)} EUR par mois pour ${nombreEnfantsEligibles} enfant(s). La CAF confirmera le droit exact selon votre dossier.`,
    details: {
      montantParEnfant,
      ressourcesMaxi: 0,
      nombreEnfantsEligibles,
    },
  };
}

