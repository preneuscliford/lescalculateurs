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

---

# Plan J+14 (GSC 2026-04-18)

## Snapshot J+7 (pages suivies)

### APL
- Total: **12 clics / 569 impressions / CTR 2,11 % / Position 7,44**
- Gagnantes immédiates:
  - `/pages/apl/apl-chomage-parent-isole-deux-enfants` (3 clics / 85 impr.)
  - `/pages/apl/apl-loyer-500-personne-seule` (2 clics / 78 impr.)
  - `/pages/apl/apl-chomage-personne-seule-sans-enfant` (2 clics / 48 impr.)

### ARE
- Total: **0 clic / 17 impressions / CTR 0,00 % / Position 5,17**
- Signal présent mais faible volume, priorité maillage + snippet direct.

### Prime d’activité
- Total: **0 clic / 147 impressions / CTR 0,00 % / Position 7,63**
- Impression correcte, blocage principal: CTR.

### Impôt
- Total: **6 clics / 957 impressions / CTR 0,63 % / Position 6,77**
- Plus gros levier immédiat:
  - `/pages/impot/impot-decote-2026-simulation` (1 clic / 755 impr. / CTR 0,13 % / pos 7,03)

## Priorité d’exécution (7 prochains jours)

### Bloc A — Gain CTR rapide (priorité absolue)
Objectif: transformer les impressions déjà présentes en clics.

1. `/pages/impot/impot-decote-2026-simulation`
2. `/pages/prime-activite/prime-activite-parent-isole-un-enfant`
3. `/pages/prime-activite/prime-activite-couple-sans-enfant-smic`
4. `/pages/apl/apl-smic-couple-logement-social`

Actions:
- Réécrire Title + H1 au format: **mot-clé + 2026 + montant et simulation**.
- Ajouter un bloc en haut de page: **« Combien pouvez-vous toucher ? »** avec réponse directe en 2 lignes.
- CTA principal uniforme: **« Calculer mon [aide/impôt] en 2 minutes »**.

### Bloc B — Consolidation APL (gagnants J+7)
Objectif: pousser les pages qui ont déjà des clics.

1. `/pages/apl/apl-chomage-parent-isole-deux-enfants`
2. `/pages/apl/apl-loyer-500-personne-seule`
3. `/pages/apl/apl-chomage-personne-seule-sans-enfant`
4. `/pages/apl/apl-smic-couple-deux-enfants`

Actions:
- Ajouter 3 liens internes contextuels:
  - vers `/pages/apl/apl-selon-situation-2026`
  - vers 2 variantes proches (même intention).
- Ajouter mini-FAQ orientée requête exacte.
- Vérifier cohérence de wording et promesse de simulation dès le premier écran.

### Bloc C — Relance ARE/Prime (zéro clic)
Objectif: débloquer le premier clic sur les pages avec impressions.

Pages:
- `/pages/are/are-cumul-salaire-temps-partiel-2026`
- `/pages/are/are-fin-de-droits-aides-2026`
- `/pages/prime-activite/prime-activite-temps-partiel-smic`
- `/pages/prime-activite/prime-activite-reprise-emploi-personne-seule`

Actions:
- Réponse immédiate en haut: montant indicatif, profil concerné, action.
- Ajouter bloc « Cas proche » avec liens vers APL/RSA/ARE selon le contexte.
- Renforcer le signal de confiance (sources officielles + date de vérification).

## KPI J+14 (cibles)
- `impot-decote-2026-simulation`: CTR **0,13 % -> >= 0,60 %**
- Cluster Prime d’activité: CTR global **0,00 % -> >= 0,40 %**
- Cluster ARE: obtenir **>= 3 clics** cumulés.
- Cluster APL suivi: passer de **12 -> >= 18 clics**.

## Tableau de suivi J+14
| Page | Impr J+7 | Impr J+14 | Clics J+7 | Clics J+14 | CTR J+7 | CTR J+14 | Pos J+7 | Pos J+14 | Delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| /pages/impot/impot-decote-2026-simulation | 755 |  | 1 |  | 0,13 % |  | 7,03 |  |  |
| /pages/prime-activite/prime-activite-parent-isole-un-enfant | 68 |  | 0 |  | 0,00 % |  | 6,81 |  |  |
| /pages/prime-activite/prime-activite-couple-sans-enfant-smic | 67 |  | 0 |  | 0,00 % |  | 8,42 |  |  |
| /pages/apl/apl-chomage-parent-isole-deux-enfants | 85 |  | 3 |  | 3,53 % |  | 5,07 |  |  |
| /pages/apl/apl-loyer-500-personne-seule | 78 |  | 2 |  | 2,56 % |  | 8,06 |  |  |
| /pages/are/are-fin-de-droits-aides-2026 | 8 |  | 0 |  | 0,00 % |  | 6,12 |  |  |
