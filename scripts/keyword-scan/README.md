# Scan de mots-clés « calcul personnel »

Aide à décider quelles questions méritent un calculateur ou une page dédiée (dates, délais,
durées, montants qui dépendent de la situation de la personne). Rien n'est publié : le script
produit un rapport.

## Lancer

```bash
npm run keyword-scan                       # thèmes chomage, caf, logement
node scripts/keyword-scan/scan.cjs --themes=conge-naissance
node scripts/keyword-scan/scan.cjs --dry-run         # aucun appel réseau, cache seul
node scripts/keyword-scan/scan.cjs --sans-expansion  # sans « amorce + a…z »
```

Options : `--cse=40` (nombre maximal de vérifications Custom Search), `--top=60` (lignes du
tableau principal).

## Étapes

1. **Amorces** (`seeds.json`) : amorces explicites par thème, débuts communs (« délai »,
   « date », « quand demander », « combien de temps », « calcul ») combinés aux termes du thème,
   suffixe « dépassé », et expansion « amorce + a…z » pour les amorces listées dans `expansion`.
   Le `filtre` et l'`exclure` de chaque thème décident quelles suggestions lui appartiennent.
2. **Autocomplétion Google** (service non officiel) : 1 requête toutes les 2 à 3 secondes,
   cache disque de 30 jours (`reports/keyword-scan/cache/`), arrêt propre sur une erreur 429
   (le rapport est écrit avec ce qui a été collecté ; relancer réutilise le cache).
3. **Classement** (`lib/classement.cjs`) : calcul personnel (date, délai, durée, montant,
   droits) ou information générale (navigation, contact, formulaire, définition…), et
   paramètres personnels (âge, contrat, situation, montant, lieu).
4. **Résultats Google** (`lib/serp.cjs`) : API Custom Search, seulement si `GOOGLE_CSE_KEY` (clé
   d'API Google Cloud, différente des identifiants OAuth) et `GOOGLE_CSE_CX` (identifiant du moteur
   de recherche programmable) sont définies, en variables d'environnement ou dans `.env` (lu par
   `lib/env.cjs`, jamais dans le code). Quota de
   100 requêtes par jour suivi dans le cache ; seuls les meilleurs candidats sont vérifiés.
   Domaines forts et faibles configurables dans `config.json`.
5. **Croisement** (facultatif) : CSV déposés dans `reports/keyword-scan/input/` (non versionné) :
   export Search Console « Requêtes » (colonnes requête, clics, impressions) et export
   Semrush (Keyword, Volume). Ils renforcent le signal des suggestions et n'ajoutent eux-mêmes
   des candidats que pour les questions de date, de délai ou de durée.
6. **Score et rapport** (`lib/score.cjs`, `lib/rapport.cjs`) : un Markdown et un CSV par
   thème dans `reports/keyword-scan/<date>/`, plus `index.md`.

## Lire le rapport

- **Score** = signal (autocomplétion, impressions, volume) × concurrence (forte 0,6 ; moyenne
  0,85 ; faible 1,25 ; non vérifiée 1). Une information générale vaut 0.
- **Proposition** :
  - « rien » : information générale ;
  - « page principale » : la question est traitée par les saisies du calculateur rattaché ;
  - « page dédiée à étudier » : signal ≥ `seuilPageDediee` (4 : une suggestion directe bien
    classée et répétée sur plusieurs amorces suffit) et paramètre susceptible de changer
    la règle (âge, contrat, situation). Seul le critère 1 du brief (formulation recherchée) est
    établi ; les critères 2 (réponse matériellement différente) et 3 (source propre) sont à
    valider avant toute création.

## Tests

`tests/keywordScan.test.ts` : classement, score, propositions, concurrence, lecture des CSV et
dry-run sans réseau.
