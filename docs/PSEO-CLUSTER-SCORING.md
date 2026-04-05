# PSEO Cluster Scoring

Ce scoring sert a decider quels clusters pSEO doivent etre pousses en priorite, puis quelles pages d'un cluster doivent etre renforcees ou etendues.

## Ce que le score combine

Le rapport `scripts/report-cluster-scoring.cjs` fusionne trois couches:

1. Search Console
Signal business reel: clics, impressions, CTR et position moyenne des requetes/pages du cluster.

2. Qualite pSEO existante
Signal de readiness produit: score QA issu de `reports/pseo-quality-report.json`.

3. Risque editorial
Signal de fragilite redactionnelle: nombre d'issues actionnables par page dans `reports/languagetool-triage-site.json`.

## Scores calcules

### Cluster score

Formule:

- 35% demande du cluster
- 20% headroom de ranking
- 20% qualite moyenne des pages du cluster
- 15% proprete LanguageTool
- 10% couverture du cluster par les pages pSEO deja publiees

Lecture:

- `70+`: cluster pret a etre scale agressivement
- `55-69`: cluster prometteur, a renforcer puis etendre
- `<55`: cluster a observer ou a tester avant industrialisation

### Priority score par page

Formule:

- 65% performance Search Console de la page
- 35% readiness de la page

La readiness combine:

- 70% score qualite pSEO
- 30% score de proprete LanguageTool

### Expansion score

Ce score cible les pages deja publiees mais encore absentes des pages qui captent la traction du cluster.

Formule:

- 55% readiness de la page
- 45% force observee du cluster dans Search Console

## Commande

```bash
node scripts/report-cluster-scoring.cjs --input="C:/Users/prene/Downloads/lescalculateurs.fr-Performance-on-Search-2026-03-27.xlsx"
```

Sorties:

- `reports/cluster-scoring-report.json`
- `reports/cluster-scoring-report.html`

## Utilisation dans le systeme de scoring global

Le bon usage n'est pas de remplacer le score qualite existant, mais de l'empiler:

- `score qualite`: est-ce que la page est publiable et saine ?
- `score cluster`: est-ce que le noeud lexical merite une expansion agressive ?
- `priority score`: quelle page renforcer en premier ?
- `expansion score`: quelle page deja prete pousser avant d'en creer de nouvelles ?
