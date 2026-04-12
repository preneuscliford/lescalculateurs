# Plan pSEO Priorise (GSC 2026-04-12)

## Source
- Export analyse: `C:\Users\prene\Downloads\lescalculateurs.fr-Performance-on-Search-2026-04-12.xlsx`
- Rapport genere: `reports/pseo-opportunity-scoring-2026-04-12.json`
- Resume: 69 pages observees, 60 clics, 4064 impressions, cluster leader `apl`.

## Ce que disent les donnees
- Le moteur principal reste `APL` (60 clics / 3945 impr., position moyenne 6.69).
- Tokens les plus porteurs: `smic`, `chomage`, `trois-enfants`, `loyer`, `parent-isole`.
- Les pages APL gagnantes confirment le pattern: `smic + foyer + contexte`.

## Scoring de priorite (ajout)
Pour prioriser sans intuition:

1. `Observed Priority Score` (pages deja observees):
`OPS = observedImpressions * (1 / observedPosition) * (1 - observedCtr)`

2. `Predictive Priority Score` (pages non observees):
`PPS = 0.6 * opportunityScore + 0.25 * tokenIntentScore + 0.15 * readinessScore`

Regle:
- si la page a des donnees GSC (impr/ctr/position) -> utiliser `OPS`
- sinon -> utiliser `PPS`

## Groupes d'intention (ajout)
### Cluster A - Fin de droits / transition
- `/pages/apl/apl-fin-de-droits-chomage`
- `/pages/apl/apl-fin-de-droits-personne-seule`
- `/pages/are/are-fin-de-droits-aides`
- `/pages/are/are-fin-de-droits-quelles-aides`
- `/pages/are/are-fin-de-droits-rsa-ou-apl`
- `/pages/simulateurs/quelles-aides-fin-de-droits-chomage`
- `/pages/rsa/rsa-fin-de-droits-chomage-personne-seule`

### Cluster B - Profil famille (couple / parent isole / enfant)
- `/pages/apl/apl-chomage-avec-enfant`
- `/pages/apl/apl-couple-sans-enfant`
- `/pages/apl/apl-couple-un-enfant`
- `/pages/apl/apl-sans-revenu-parent-isole`
- `/pages/asf/asf-parent-isole-sans-pension`
- `/pages/asf/asf-parent-isole-sans-revenu`

### Cluster C - Contraintes budget (smic / loyer / sans revenu)
- `/pages/apl/apl-smic-couple-sans-enfant`
- `/pages/apl/apl-sans-revenu-couple-sans-enfant`
- `/pages/apl/apl-couple-loyer-eleve`
- `/pages/apl/apl-celibataire-loyer-eleve`
- `/pages/are/are-reprise-emploi-temps-partiel`
- `/pages/prime-activite/prime-activite-reprise-emploi-apres-chomage`

## Lot 1 (push immediate) - 10 pages
Objectif: pousser les pages deja scorees haut mais sans preuve trafic sur ce snapshot.

1. `/pages/apl/apl-fin-de-droits-chomage`
2. `/pages/apl/apl-chomage-avec-enfant`
3. `/pages/apl/apl-smic-couple-sans-enfant`
4. `/pages/apl/apl-sans-revenu-parent-isole`
5. `/pages/apl/apl-couple-sans-enfant`
6. `/pages/apl/apl-couple-un-enfant`
7. `/pages/apl/apl-sans-revenu-couple-sans-enfant`
8. `/pages/apl/apl-couple-loyer-eleve`
9. `/pages/apl/apl-celibataire-loyer-eleve`
10. `/pages/apl/apl-fin-de-droits-personne-seule`

Ordre interne (PPS):
1. `/pages/apl/apl-fin-de-droits-chomage` (65.7)
2. `/pages/apl/apl-chomage-avec-enfant` (65.0)
3. `/pages/apl/apl-smic-couple-sans-enfant` (64.8)
4. `/pages/apl/apl-sans-revenu-parent-isole` (64.4)
5. `/pages/apl/apl-couple-sans-enfant` (63.1)
6. `/pages/apl/apl-couple-un-enfant` (63.1)
7. `/pages/apl/apl-sans-revenu-couple-sans-enfant` (63.1)
8. `/pages/apl/apl-couple-loyer-eleve` (62.9)
9. `/pages/apl/apl-celibataire-loyer-eleve` (62.1)
10. `/pages/apl/apl-fin-de-droits-personne-seule` (61.3)

## Lot 2 (expansion transverse) - 8 pages
Objectif: transferer le pattern gagnant APL vers hubs proches.

ARE:
1. `/pages/are/are-fin-de-droits-aides`
2. `/pages/are/are-fin-de-droits-quelles-aides`
3. `/pages/are/are-fin-de-droits-rsa-ou-apl`
4. `/pages/are/are-reprise-emploi-temps-partiel`

Prime activite:
5. `/pages/prime-activite/prime-activite-reprise-emploi-apres-chomage`
6. `/pages/prime-activite/montant-prime-activite-2026`
7. `/pages/prime-activite/plafond-prime-activite-2026`
8. `/pages/prime-activite/prime-activite-reprise-emploi-personne-seule`

Ordre interne (PPS):
1. `/pages/prime-activite/prime-activite-reprise-emploi-apres-chomage` (56.3)
2. `/pages/are/are-fin-de-droits-aides` (52.7)
3. `/pages/are/are-fin-de-droits-quelles-aides` (52.7)
4. `/pages/are/are-fin-de-droits-rsa-ou-apl` (52.7)
5. `/pages/prime-activite/montant-prime-activite-2026` (52.7)
6. `/pages/are/are-reprise-emploi-temps-partiel` (52.0)
7. `/pages/prime-activite/plafond-prime-activite-2026` (48.1)
8. `/pages/prime-activite/prime-activite-reprise-emploi-personne-seule` (43.1)

## Lot 3 (support cluster) - 4 pages
Objectif: renforcer maillage et conversion inter-hubs.

1. `/pages/simulateurs/quelles-aides-fin-de-droits-chomage`
2. `/pages/simulateurs/aide-financiere-famille`
3. `/pages/asf/asf-parent-isole-sans-pension`
4. `/pages/asf/asf-parent-isole-sans-revenu`

Ordre interne (PPS):
1. `/pages/simulateurs/quelles-aides-fin-de-droits-chomage` (63.9)
2. `/pages/asf/asf-parent-isole-sans-pension` (60.5)
3. `/pages/asf/asf-parent-isole-sans-revenu` (60.5)
4. `/pages/simulateurs/aide-financiere-famille` (58.6)

## Hub manquant (ajout critique)
Creer:
- `/pages/apl/apl-selon-situation-2026`

Objectif du hub:
1. tableau des cas (fin de droits, couple, parent isole, smic, loyer, sans revenu),
2. liens vers toutes les pages satellites APL prioritaires,
3. bloc de synthese + lien vers `/pages/apl`.

## Regles d'execution (avec le skill pseo-fr-quality)
1. Appliquer la structure obligatoire (H1, intro courte, action, cas, FAQ).
2. Ajouter 2 liens internes + 1 lien hub parent par page.
3. Mettre un signal de confiance (source + annee + logique de calcul).
4. Verifier QA texte avant commit.
5. Regle titre CTR: `mot-cle principal + 2026 + montant/simulation`.

## Checkpoint J+7
Suivre pour chaque lot:
1. impressions
2. clics
3. CTR
4. position moyenne

Decision:
- garder et etendre les motifs qui montent,
- geler les variantes qui n'ouvrent pas de traction.

## Tableau J+7 (delta)
| Page | Impr J0 | Impr J+7 | Clics J0 | Clics J+7 | CTR J0 | CTR J+7 | Pos J0 | Pos J+7 | Delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| /pages/apl/apl-fin-de-droits-chomage | 0 |  | 0 |  | 0.00% |  | - |  |  |
| /pages/apl/apl-chomage-avec-enfant | 0 |  | 0 |  | 0.00% |  | - |  |  |
| /pages/apl/apl-smic-couple-sans-enfant | 0 |  | 0 |  | 0.00% |  | - |  |  |
| /pages/are/are-fin-de-droits-aides | 0 |  | 0 |  | 0.00% |  | - |  |  |
| /pages/prime-activite/prime-activite-reprise-emploi-apres-chomage | 0 |  | 0 |  | 0.00% |  | - |  |  |
