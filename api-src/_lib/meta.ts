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
 */

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
    effectiveDate: "2026-05-01",
    source:
      "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
  },
  apl: {
    version: "1.0.0",
    rulesVersion: "2025.10",
    effectiveDate: "2025-10-01",
    source: "https://www.service-public.fr/particuliers/actualites/A16807",
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
    effectiveDate: "2026-05-01",
    source:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
  },
  asf: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-05-01",
    source:
      "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
  },
  aah: {
    version: "1.0.0",
    rulesVersion: "2026.05",
    effectiveDate: "2026-05-01",
    source: "Décret du 29 mars 2025 (revalorisation AAH +0,9%, applicable au 1er mai 2026)",
  },
  retraite: {
    version: "1.0.0",
    rulesVersion: "reforme-2023 + suspension-LFSS-2026",
    source: "https://www.info-retraite.fr",
  },
  "indemnite-licenciement": {
    version: "1.0.0",
    rulesVersion: "en vigueur (quotes-parts légales inchangées)",
    source: "Code du travail, article L1234-9",
  },
  ptz: {
    version: "1.0.0",
    rulesVersion: "2026 (inchangé vs 2025)",
    source: "Barème PTZ 2026 — service-public.fr (F19941)",
  },
  "impot-revenu": {
    version: "1.0.0",
    rulesVersion: "2026 (imposition des revenus 2025)",
    source: "Article 197 du CGI — service-public.fr",
  },
  notaire: {
    version: "1.0.0",
    rulesVersion: "2026",
    source: "Barèmes notariés 2026 — Conseil supérieur du notariat",
  },
  "apl-etudiant": {
    version: "1.0.0",
    rulesVersion: "2026 (modèle simplifié)",
    source: "Barèmes CROUS/CNOUS 2026, simplifiés",
  },
  "salaire-net": {
    version: "1.0.0",
    rulesVersion: "2026 (cotisations moyennes approximatives)",
    source: "Barèmes DGFIP 2026 — approximation, hors cas particuliers",
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
