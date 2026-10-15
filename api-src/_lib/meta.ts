/**
 * Registre de métadonnées par calculateur : d'où vient la règle appliquée,
 * quelle version, depuis quand. Volontairement un simple registre statique
 * tenu à la main (pas un "rule engine" ni un système de versionnement
 * automatique) — c'est la version la plus simple qui répond à la question
 * « pourquoi le moteur a-t-il utilisé cette règle ? » sans construire une
 * nouvelle couche d'architecture pour zéro client B2B actuel.
 *
 * Honnêteté par construction : rulesVersion/effectiveDate/source ne sont
 * renseignés que quand une donnée datée et sourcée existe réellement dans
 * le moteur concerné (le plus souvent via src/data/social-baremes.ts, qui a
 * déjà version/dateEffet/sourceUrl par prestation). Pour les calculateurs
 * non réglementaires (agrégations arithmétiques) ou aux barèmes non datés,
 * le champ est omis plutôt qu'inventé.
 *
 * calculator_version suit le contrat de l'endpoint (forme des paramètres et
 * de la réponse), pas le barème lui-même — à incrémenter uniquement si la
 * forme de la requête/réponse change de façon incompatible.
 *
 * Vérification manuelle du 11/08/2026 : chaque `source` ci-dessous a été
 * ouverte et son contenu confronté aux montants codés en dur dans le moteur
 * correspondant. Trois écarts ont été trouvés et corrigés dans les moteurs
 * concernés (pas seulement ici) :
 * - are.ts : plafond corrigé de 70 % à 75 % du salaire journalier de
 *   référence (source : francetravail.fr).
 * - irCalculEngine.ts et salaireNetCalculEngine.ts : barème IR 2026
 *   unifié sur 11600/29579/84577/181917 EUR (Légifrance, article 197 CGI) ;
 *   les deux fichiers utilisaient chacun des seuils différents et erronés.
 * - rsa/asf/prime-activite/aah : date d'effet corrigée du 1er mai au
 *   1er avril 2026 (source : solidarites.gouv.fr).
 */

import { socialBaremes } from "../../src/data/social-baremes";

export interface CalculatorMeta {
  version: string;
  rulesVersion?: string;
  effectiveDate?: string;
  source?: string;
}

export const CALCULATOR_META: Record<string, CalculatorMeta> = {
  rsa: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source:
      "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
  },
  // Version des règles lue dans le barème (source unique) ; 2.0.0 = formule officielle
  apl: {
    version: "2.0.0",
    rulesVersion: socialBaremes.apl.version,
    effectiveDate: socialBaremes.apl.dateEffet,
    source: socialBaremes.apl.sourceUrl,
  },
  are: {
    version: "1.0.0",
    rulesVersion: "2025.07",
    effectiveDate: "2025-07-01",
    source:
      "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html",
  },
  "prime-activite": {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
  },
  asf: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
  },
  aah: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-04-01",
    source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053734356",
  },
  retraite: {
    version: "1.0.0",
    rulesVersion: "reforme-2023 + suspension-LFSS-2026",
    source:
      "https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/reforme-des-retraites/reforme-des-retraites---age-le-1.html",
  },
  "indemnite-licenciement": {
    version: "1.0.0",
    rulesVersion: "en vigueur (quotes-parts légales inchangées)",
    source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035644154",
  },
  ptz: {
    version: "1.0.0",
    rulesVersion: "2026 (inchangé vs 2025)",
    source: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10871",
  },
  "impot-revenu": {
    version: "1.0.0",
    rulesVersion: "2026 (imposition des revenus 2025)",
    source: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954",
  },
  notaire: {
    version: "1.0.0",
    rulesVersion: "2026",
    source: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053593921",
  },
  "apl-etudiant": {
    version: "1.0.0",
    rulesVersion: "2026 (modèle simplifié)",
    source: "Barèmes CROUS/CNOUS 2026, simplifiés",
  },
  "salaire-net": {
    version: "1.0.0",
    rulesVersion: "2026 (non-cadre, tranche 1, régime général)",
    source: "https://www.legisocial.fr/reperes-sociaux/cotisations-agirc-arrco-2026.html",
  },
  salaire: {
    version: "1.0.0",
    rulesVersion: "estimation forfaitaire (non réglementaire)",
  },
  "reste-a-vivre": {
    version: "1.0.0",
    rulesVersion: "agrégation arithmétique (non réglementaire)",
  },
  "cout-reel-voiture": {
    version: "1.0.0",
    rulesVersion: "agrégation arithmétique (non réglementaire)",
  },
};

export function withMeta<T extends object>(
  calculatorId: string,
  result: T,
): T & { meta: CalculatorMeta & { calculator: string } } {
  const entry = CALCULATOR_META[calculatorId] || { version: "1.0.0" };
  return { ...result, meta: { calculator: calculatorId, ...entry } };
}
