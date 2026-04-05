# PSEO Opportunity Scoring

Ce scoring sert a prioriser les pages pSEO simulateurs sans raisonner "naivement" en mode:

- plus de pages = plus de trafic
- tel cluster a marche une fois donc il faut tout dupliquer
- telle periode de 28 jours suffit a conclure

L'objectif est different:

- comprendre quelles pages pSEO attirent du trafic
- comprendre pourquoi elles attirent du trafic
- reutiliser ces motifs pour scorer les prochaines pages a pousser ou a creer

## Ce que le systeme apprend

Le script `scripts/report-pseo-opportunity-scoring.cjs` prend toutes les pages pSEO observees dans Search Console et extrait:

1. Les clusters qui convertissent la demande en trafic
2. Les tokens d'intention qui reviennent sur les pages gagnantes
3. Le niveau de readiness des pages deja generees

Le systeme ne depend pas d'une "date" comme signal de score.
Il utilise la photo Search Console comme un jeu d'observation pour apprendre quels motifs fonctionnent.

## Les trois couches du score

### 1. Preuve de trafic

Pour les pages deja visibles dans Search Console:

- clics
- impressions
- CTR
- position

Ces signaux servent a mesurer la preuve reelle, pas juste la qualite editoriale.

### 2. Motifs d'intention

Le systeme tokenize les slugs pSEO et mesure quels motifs reviennent sur les pages qui performent, y compris des motifs composes.

Exemples de motifs:

- `smic`
- `chomage`
- `couple`
- `celibataire`
- `parent-isole`
- `loyer-moyen`

Une future page obtient donc un score d'intention selon sa proximite avec les motifs qui ont deja prouve leur capacite a capter du trafic.

### 3. Readiness de la page

Une page prometteuse ne doit pas etre poussee si elle est faible.

Le score de readiness combine:

- score qualite pSEO
- proprete LanguageTool

## Comment lire le rapport

- `topObservedPages`: pages qui prouvent deja la demande
- `topTokens`: motifs qui expliquent le trafic
- `clusterInsights`: familles de simulateurs les plus fertiles
- `nextToPush`: pages sans preuve directe encore, mais avec les meilleurs motifs + readiness

## Commande

```bash
node scripts/report-pseo-opportunity-scoring.cjs --input="C:/Users/prene/Downloads/lescalculateurs.fr-Performance-on-Search-2026-03-27 (1).xlsx"
```

Sorties:

- `reports/pseo-opportunity-scoring.json`
- `reports/pseo-opportunity-scoring.html`

## Idee directrice

Le bon systeme n'est pas "on score les pages qui ont des dates recentes".

Le bon systeme est:

- quelles pages prouvent deja l'existence d'une demande ?
- quels motifs d'intention expliquent cette demande ?
- quelles pages prêtes ressemblent le plus a ces motifs gagnants ?
