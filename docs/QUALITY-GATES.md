# Quality Gates

Ce guide fixe le minimum technique et editorial avant de pousser un lot pSEO en production.

## Objectif

On veut eviter trois familles de regressions :

- UTF-8 / BOM / mojibake
- francais corrige a la main d'un cote puis recasse a la generation
- pages pSEO poussees sans controle qualite lisible

## Scopes utiles

- `publish-pseo`
  Scope large pour verifier l'encodage des sources, scripts et pages pSEO avant publication.
- `pseo-rendered`
  Les pages HTML generees. C'est le scope a utiliser pour la qualite editoriale.
- `pseo-source`
  Datasets, renderers et generateurs.
- `repo`
  Controle large du depot entier.
- `site-rendered`
  Toutes les pages HTML du site a relire cote contenu.
- `french-pilot-20`
  Lot pilote de 20 pages strategiques pour tester les corrections de francais avant passage en mode complet.

## Commandes

### UTF-8

```bash
npm run utf8:check
npm run utf8:check:pseo
npm run utf8:check:publish:pseo
npm run utf8:fix
npm run utf8:fix:pseo
```

### Francais

```bash
npm run text:normalize:check:pseo
npm run text:normalize:check:seo:pseo
npm run text:languagetool:pseo
npm run text:languagetool:publish:pseo
npm run text:openai:pilot20
npm run text:openai:pilot20:seo
```

LanguageTool utilise aussi une liste d'exceptions maintenable dans :

- `scripts/lib/languagetool-ignore-rules.json`

Cette liste sert uniquement a ignorer les faux positifs recurrentes :

- noms propres
- choix editoriaux assumes
- alertes de style non bloquantes

On n'y met pas de vraies fautes. Si une alerte est legitime, on corrige la page.

## Secours OpenAI

Quand LanguageTool est indisponible, on peut lancer une revue assistee par OpenAI en mode rapport uniquement.

Prerrequis :

- definir `OPENAI_API_KEY` dans l'environnement
- ne jamais mettre la cle dans le repo ni dans un script

Commandes utiles :

```bash
npm run text:openai:pilot20
npm run text:openai:pilot20:seo
```

Le script :

- lit le scope cible
- extrait le texte visible ou SEO
- conserve toutes les alertes remontees par OpenAI dans le rapport
- distingue ensuite les corrections safe applicables automatiquement
- genere un JSON et une vue HTML dans `reports/`

On reste en mode `report-only` tant que le comportement n'est pas valide sur le pilote.

### Pipeline hybride

Pour enchaîner les corrections mecaniques locales puis la revue OpenAI sur le pilote :

```bash
npm run text:hybrid:pilot20
```

Par defaut, ce pipeline :

- verifie l'UTF-8
- applique la normalisation locale sur le visible et le SEO
- lance LanguageTool
- produit les rapports OpenAI
- applique uniquement les corrections OpenAI classees `safe`
- regenere un rapport qualite final

## Mode semi-automatique

Quand le rapport OpenAI du pilote est juge suffisamment propre, on peut sortir une shortlist de corrections vraiment mecaniques :

```bash
npm run report:openai:safe:pilot20
```

Puis appliquer seulement ces corrections sures :

```bash
npm run apply:openai:safe:pilot20
```

Le filtre semi-auto garde uniquement :

- `accent`
- `encodage`
- `espacement`
- `apostrophe`

avec :

- `confidence = high`
- `safe_to_apply = true`
- pas de reecriture longue
- pas de grammaire / orthographe interpretative

Les alertes `grammaire` et `orthographe` restent visibles dans le rapport OpenAI, mais ne sont pas appliquees automatiquement.

### Rapport et gate

```bash
npm run report:pseo
npm run report:site
npm run report:pilot20
npm run qa:publish:pseo
```

Les rapports generent :

- `reports/pseo-quality-report.json`
- `reports/pseo-quality-report.html`
- `reports/site-quality-report.json`
- `reports/site-quality-report.html`

## Regle de publication

Avant d'ajouter une nouvelle vague pSEO au sitemap ou a la prod :

1. `npm run utf8:check:publish:pseo`
2. `npm run text:normalize:check:pseo`
3. `npm run text:normalize:check:seo:pseo`
4. `npm run text:languagetool:publish:pseo`
5. `npm run report:pseo`

Le gate `qa:publish:pseo` orchestre ces etapes avec :

- UTF-8 sur `publish-pseo`
- normalisation et LanguageTool sur `pseo-rendered`
- rapport qualite sur `pseo-rendered`

Si un check echoue, on corrige a la source :

- dataset
- renderer
- generateur

On evite les corrections manuelles page par page, sauf bug isole urgent.

## Lecture du score

Le rapport qualite attribue un score simple par page HTML. Ce n'est pas un score SEO marketing.
Il sert a reperer rapidement les pages qui cumulent :

- problemes UTF-8
- texte visible encore normalisable
- texte SEO encore normalisable
- manque de FAQ / breadcrumb / methode / sources / CTA simulateur

Le score n'est pas une fin en soi. Il sert a prioriser les pages a relire.

## Lecture visuelle

Les vues HTML de `reports/` affichent :

- l'URL publique quand elle peut etre derivee
- le score
- le titre
- le fichier source
- les alertes principales

Cela permet de filtrer rapidement les pages a corriger sans relire tout le JSON a la main.

## Mode pilote 20 pages

Pour tester les corrections sur un lot limite avant un passage global :

```bash
npm run report:pilot20
npm run text:normalize:check:pilot20
npm run text:normalize:pilot20
npm run text:languagetool:pilot20
npm run qa:pilot20
```

Le lot `french-pilot-20` couvre :

- pages piliers aides
- pages piliers business
- pages pSEO APL / RSA / ARE deja strategiques
- une page simulateur transverse
- une page locale notaire

## Ajouter une exception LanguageTool

Quand LanguageTool remonte une alerte manifestement fausse ou non bloquante :

1. relever le message, le mot cible et la page
2. ajouter une regle minimale dans `scripts/lib/languagetool-ignore-rules.json`
3. limiter la regle par `pathIncludes` si possible
4. relancer `npm run text:languagetool:pilot20` ou le scope cible

Le but est de garder un signal propre, pas de faire disparaitre les vraies erreurs.
