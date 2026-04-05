import { socialBaremes } from "../data/social-baremes";

export interface RSACalculData {
  situation: string;
  enfants: number;
  revenus: number;
  logement: string;
  activite: string;
}

export interface RSAResult {
  success: boolean;
  montantEstime: number;
  eligibilite: string;
  explication: string;
  details: {
    montantBase: number;
    majorations: number;
    revenusPris: number;
    abattement: number;
    forfaitLogement: number;
    montantFinal: number;
  };
}

const rsaBaremes = socialBaremes.rsa;

function getBaseCoefficient(situation: string, enfants: number): number {
  const nbEnfants = Math.max(0, Math.floor(enfants || 0));

  if (situation === "couple") {
    if (nbEnfants <= 0) return rsaBaremes.coefficientsFoyer.coupleOuSeulAvec1Enfant;
    if (nbEnfants === 1) return rsaBaremes.coefficientsFoyer.coupleAvec1OuSeulAvec2Enfants;
    return (
      rsaBaremes.coefficientsFoyer.coupleAvec2Enfants +
      (nbEnfants - 2) * rsaBaremes.coefficientsFoyer.personneSupplementaire
    );
  }

  if (nbEnfants <= 0) return rsaBaremes.coefficientsFoyer.seulSansEnfant;
  if (nbEnfants === 1) return rsaBaremes.coefficientsFoyer.coupleOuSeulAvec1Enfant;
  return (
    rsaBaremes.coefficientsFoyer.coupleAvec1OuSeulAvec2Enfants +
    (nbEnfants - 2) * rsaBaremes.coefficientsFoyer.personneSupplementaire
  );
}

function getForfaitLogement(logement: string, situation: string, enfants: number): number {
  if (logement === "loue" || logement === "sans-abri") return 0;

  const foyerSize = (situation === "couple" ? 2 : 1) + Math.max(0, Math.floor(enfants || 0));
  if (foyerSize <= 1) return rsaBaremes.forfaitLogement.unePersonne;
  if (foyerSize === 2) return rsaBaremes.forfaitLogement.deuxPersonnes;
  return rsaBaremes.forfaitLogement.troisPersonnesOuPlus;
}

export function calculerRSA(data: RSACalculData): RSAResult {
  if (!data.situation || !data.logement || !data.activite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Donnees incompletes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusPris: 0,
        abattement: 0,
        forfaitLogement: 0,
        montantFinal: 0,
      },
    };
  }

  const coefficient = getBaseCoefficient(data.situation, data.enfants);
  const montantBase = Math.round(rsaBaremes.montantForfaitaireBase * coefficient * 100) / 100;
  const forfaitLogement = getForfaitLogement(data.logement, data.situation, data.enfants);
  const revenusPris =
    data.activite === "actif"
      ? Math.round((data.revenus || 0) * rsaBaremes.revenusActivitePrisEnCompte * 100) / 100
      : Math.max(0, Math.round((data.revenus || 0) * 100) / 100);
  const abattement = Math.max(0, Math.round(((data.revenus || 0) - revenusPris) * 100) / 100);

  let montantFinal = montantBase - revenusPris - forfaitLogement;
  montantFinal = Math.max(0, Math.round(montantFinal * 100) / 100);

  let eligibilite = "Probablement eligible";
  let explication =
    "Cette estimation utilise le bareme RSA en vigueur, vos ressources mensuelles et, si besoin, le forfait logement applique par la CAF.";

  if (montantFinal === 0) {
    eligibilite = "Non eligible";
    explication =
      "Avec les ressources et le logement renseignes, le RSA estime est nul. Le resultat peut changer si vos revenus baissent, si votre foyer evolue ou si votre situation de logement change.";
  } else if (data.situation === "monoparental" && data.enfants > 0) {
    explication +=
      " Si vous relevez de la majoration parent isole, la CAF peut retenir un montant plus favorable que cette estimation de base.";
  }

  return {
    success: true,
    montantEstime: montantFinal,
    eligibilite,
    explication,
    details: {
      montantBase,
      majorations: Math.round((montantBase - rsaBaremes.montantForfaitaireBase) * 100) / 100,
      revenusPris,
      abattement,
      forfaitLogement: Math.round(forfaitLogement * 100) / 100,
      montantFinal,
    },
  };
}

export function formatRSAResult(result: RSAResult): {
  montantDisplay: string;
  explDisplay: string;
} {
  return {
    montantDisplay:
      result.montantEstime > 0
        ? `${Math.round(result.montantEstime)} EUR / mois`
        : "Non eligible",
    explDisplay: result.explication,
  };
}

