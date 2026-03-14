# PSEO Consolidation Playbook

Date: 2026-03-11
Scope: pages pSEO et pages d'intention SEO du site
Owner: LesCalculateurs

## Objectif

Nous ne sommes plus dans une phase de "preuve de concept".
Google commence deja a indexer certaines pages et a envoyer des impressions puis des clics.

La priorite n'est donc pas de publier des centaines de pages de plus.
La priorite est de:

1. consolider les pages qui montrent deja des signaux positifs
2. comprendre les patterns qui fonctionnent
3. produire les prochaines pages a partir de ces patterns
4. garder un niveau de qualite assez haut pour pouvoir scaler ensuite

## Regle principale

Pendant cette phase, on ne scale pas "par volume".
On scale "par pattern gagnant".

Formule:

signal GSC -> consolidation de la page existante -> derivation en pages proches -> mesure -> extension du cluster

## Signaux actuels a exploiter

Requetes qui ont deja commence a produire des clics ou des impressions utiles:

- `simulation asf`
- `simulation rsa`
- `montant apl chômage`
- `simulation are`
- `calcul are 2026`
- `smic apl`
- `apl personne seule smic`
- `simulateur prime d'activite`
- `simulateur are`
- `apl smic seul`
- `calcul chômage 2026`
- `simulateur cumul are et salaire`
- `montant asf 2026`
- `simulation rsa couple`
- `simulateur rsa`
- `simulation apl`
- `simulateur are france travail 2026`
- `asf 2026`
- `calcul apl 2026`
- `simulateur apl caf 2026`
- `simulateur prime d'activite caf 2026`
- `rsa simulation`
- `apl 2026`
- `simulateur are pole emploi 2026`
- `frais de notaire morbihan`

## Ce que ces signaux disent

Les requetes qui remontent appartiennent deja a 5 familles claires:

1. `APL`
 Exemples: `smic apl`, `apl personne seule smic`, `montant apl chômage`

2. `RSA`
 Exemples: `simulation rsa`, `simulation rsa couple`, `simulateur rsa`

3. `ARE`
 Exemples: `simulation are`, `calcul are 2026`, `simulateur are france travail 2026`

4. `Prime d'activite`
 Exemples: `simulateur prime d'activite`, `simulateur prime d'activite caf 2026`

5. `Longue traine locale / verticale`
 Exemple: `frais de notaire morbihan`

Conclusion:
Google comprend deja le site comme un mix de:

- simulateurs
- estimations rapides
- pages d'intention tres ciblees
- pages utiles sur aides sociales et calculs

## Priorite immediate

Avant de creer de nouveaux lots, on consolide les pages qui sont deja proches de ces intentions.

### Lot 1 - APL

Pages a renforcer en premier:

- `/pages/apl/apl-célibataire-smic`
- `/pages/apl/apl-chômage-loyer-moyen`
- `/pages/apl/apl-célibataire-paris-petit-revenu`
- `/pages/apl/apl-loyer-500-revenu-900`

Intentions a servir mieux:

- `smic apl`
- `apl personne seule smic`
- `apl smic seul`
- `montant apl chômage`

### Lot 2 - RSA

Pages a renforcer / creer selon l'existant:

- page pilier RSA
- scenario `rsa couple`
- scenario `rsa personne seule`
- scenario `rsa temps partiel`

Intentions a servir mieux:

- `simulation rsa`
- `simulation rsa couple`
- `simulateur rsa`
- `rsa simulation`

### Lot 3 - ARE

Pages a renforcer / creer selon l'existant:

- page pilier ARE
- scenario `calcul are 2026`
- scenario `simulation are`
- scenario `cumul are et salaire`

Intentions a servir mieux:

- `simulation are`
- `calcul are 2026`
- `simulateur are`
- `simulateur are france travail 2026`
- `simulateur are pole emploi 2026`
- `simulateur cumul are et salaire`

## Checklist de consolidation d'une page existante

Avant de dupliquer un format, chaque page ciblee doit passer cette checklist.

### 1. Intent match

La page doit coller a une seule intention principale.

Exemples:

- `APL au SMIC pour une personne seule`
- `APL en cas de chômage`
- `Simulation RSA pour un couple`
- `Calcul ARE 2026`

Eviter:

- une page qui essaie de couvrir 4 intentions a la fois
- une page trop generale si la requete est tres precise

### 2. Hero utile

Le haut de page doit donner tout de suite:

- l'intention
- le montant indicatif avec `~`
- le caractere non contractuel
- le CTA vers le simulateur complet

### 3. Scénario visible

Chaque page doit afficher:

- situation familiale
- revenus
- loyer si pertinent
- region / zone si pertinent
- type de logement si pertinent

### 4. Hypotheses explicites

Chaque page doit rappeler:

- que l'estimation est indicative
- que le montant réel depend de la situation declaree
- que la CAF / France Travail / organisme payeur reste la référence finale

### 5. FAQ courte et ciblee

2 a 4 questions suffisent, mais elles doivent repondre aux objections réelles.

### 6. Maillage interne

Chaque page doit pointer vers:

- 3 a 4 pages tres proches
- la page pilier
- le simulateur principal

### 7. Tracking

Verifier que la page expose bien son contexte pour Analytics:

- page type
- cluster
- slug
- intent
- variant

## Regles de derivation des nouvelles pages

On ne cree pas les prochaines pages "au hasard".
On les derive a partir des motifs qui montent deja.

### Pattern A - aide + profil + revenu

Exemples:

- `apl personne seule smic`
- `apl célibataire petit revenu`
- `rsa couple petit salaire`

### Pattern B - aide + situation de vie

Exemples:

- `montant apl chômage`
- `rsa fin de droits`
- `are cumul salaire`

### Pattern C - aide + annee + mot simulateur / calcul

Exemples:

- `calcul are 2026`
- `simulateur apl caf 2026`
- `simulateur prime d'activite caf 2026`

### Pattern D - aide + ville seulement si signaux suffisants

Exemples:

- `apl étudiant paris`
- `apl célibataire marseille`

Important:
les pages ville ne doivent venir qu'apres validation d'un pattern national deja performant.
On ne lance pas 150 villes sans signal.

## Regles de publication

Une nouvelle page n'est publiable que si:

1. elle cible une intention deja observee ou un pattern deja valide
2. elle a un vrai scenario
3. elle affiche un montant indicatif avec `~`
4. elle a une FAQ courte
5. elle a un maillage propre
6. elle pointe vers le simulateur
7. elle passe une relecture francaise
8. elle ne cannibalise pas une page deja en place sans raison

## Derivations a produire en premier

### APL

Premiere vague de derivation:

- `apl-personne-seule-smic`
- `apl-smic-seul`
- `apl-chômage`
- `apl-chômage-personne-seule`
- `apl-célibataire-petit-salaire`

### RSA

Premiere vague de derivation:

- `rsa-simulation-couple`
- `rsa-simulation-personne-seule`
- `rsa-couple-petit-salaire`
- `rsa-temps-partiel`

### ARE

Premiere vague de derivation:

- `calcul-are-2026`
- `simulation-are-2026`
- `are-cumul-salaire`
- `simulateur-are-france-travail-2026`

## KPI a surveiller avant tout scale

On n'ouvre pas un nouveau gros lot tant que ces KPI ne sont pas lisibles sur 4 a 6 semaines.

- impressions par page
- clics par page
- CTR
- position moyenne
- pages qui obtiennent des impressions sans liens externes
- cannibalisation entre pages proches
- pages qui ne recoivent aucune impression

## Seuil de passage a la phase suivante

On peut passer d'une logique de consolidation a une logique d'extension si:

- plusieurs pages d'un même cluster prennent des impressions
- au moins quelques pages obtiennent des clics
- le CTR est defendable sur les pages d'intention forte
- Google continue d'indexer les nouvelles pages sans ralentissement net

## Ce qui fera vraiment l'ecart contre les gros sites

Le moat ne sera pas seulement le nombre de pages.
Le moat sera:

1. un simulateur meilleur
2. des pages plus precises sur l'intention
3. des scenarios réels mieux presentes
4. une vitesse d'execution plus forte
5. une future couche de donnees proprietaires / observatoire

## Resume operationnel

Pendant les prochaines semaines:

1. consolider les pages APL, RSA et ARE qui matchent deja des requetes visibles
2. creer seulement les pages derivees les plus proches de ces requetes
3. mesurer
4. ne scaler que les patterns qui prouvent leur traction

La bonne logique n'est pas:

- "faire le plus de pages possible"

La bonne logique est:

- "faire d'abord plus de pages du type que Google commence deja a tester"

## Pilote produit - 3 pages a renforcer sans toucher aux titles

Le but de ce pilote n'est pas de changer les balises SEO principales.
Le but est d'ameliorer la valeur produit des pages qui prennent deja des impressions ou des clics.

Pages pilotes:

1. `APL`: `/pages/apl/apl-célibataire-smic`
2. `RSA`: une page existante la plus proche de `simulation rsa` ou `simulation rsa couple`
3. `ARE`: une page existante la plus proche de `simulation are` ou `cumul are et salaire`

Regle:

- ne pas modifier le `title`
- ne pas modifier le `slug`
- ne pas modifier le `H1` tant que la page reste en observation

Ce que l'on change:

- la structure produit sous le hero
- les blocs de comparaison
- la guidance utilisateur
- le maillage interne
- les explications sur les facteurs qui font varier le montant

## Bloc produit commun a ajouter

Chaque page pilote doit recevoir 4 blocs nouveaux ou renforces.

### Bloc 1 - Tester 3 variantes

Objectif:
donner a l'utilisateur trois chemins evidents, sans effort.

Format:

- 3 cartes ou boutons
- chaque carte correspond a une variation concrete
- chaque carte mene soit vers une autre page scenario, soit vers le simulateur avec contexte proche

Exemples de labels:

- `Tester avec un loyer plus bas`
- `Comparer avec le chômage`
- `Voir le cas avec un enfant`

### Bloc 2 - Ce qui change le plus le montant

Objectif:
faire gagner du temps a l'utilisateur et montrer une vraie expertise metier.

Format:

- 3 a 5 facteurs maximum
- chaque facteur explique l'effet concret sur l'estimation

Exemples:

- niveau de revenu retenu
- loyer retenu dans la limite du plafond
- composition du foyer
- situation d'emploi
- type de logement

### Bloc 3 - Comparer avec un autre cas

Objectif:
faire progresser l'utilisateur dans un parcours, pas juste sur une page isolee.

Format:

- 3 liens tres proches
- 1 lien "plus contrastant"

Exemple:

- cas proche 1
- cas proche 2
- cas proche 3
- cas tres different pour comparer

### Bloc 4 - Parcours recommande

Objectif:
transformer la page en point d'entree produit.

Format:

1. comprendre le scenario
2. tester une variante
3. lancer le simulateur complet

Texte court, tres actionnable, sans jargon.

## Plan exact - page APL pilote

Page:

- `/pages/apl/apl-célibataire-smic`

Pourquoi cette page:

- elle a deja un bon signal initial de CTR
- l'intention est tres claire
- elle peut servir de modele pour d'autres pages `profil + revenu`

### Bloc a ajouter ou renforcer

#### 1. Tester 3 variantes

Ajouter un bloc sous `Estimation rapide` ou juste apres le scenario:

- `Tester avec un loyer de 500 EUR`
- `Tester avec un loyer de 700 EUR`
- `Comparer avec une personne seule au chômage`

Destination cible:

- page scenario proche si elle existe deja
- sinon page pilier APL avec ancre vers le simulateur

#### 2. Ce qui change le plus le montant

Texte a couvrir:

- le loyer retenu par rapport au plafond
- le niveau réel de revenus retenus
- l'eventuelle prime d'activite
- la difference entre province et zone plus tendue

Promesse:
expliquer pourquoi deux personnes au SMIC peuvent obtenir des montants differents.

#### 3. Comparer avec un autre cas

Liens prioritaires:

- `/pages/apl/apl-loyer-500-revenu-900`
- `/pages/apl/apl-chômage-loyer-moyen`
- `/pages/apl/apl-célibataire-paris-petit-revenu`
- `/pages/apl`

#### 4. Parcours recommande

Texte type:

1. Commencez par comparer votre loyer au scenario affiche.
2. Verifiez si vos revenus varient d'un mois a l'autre.
3. Lancez ensuite une simulation complete pour tester votre situation exacte.

## Plan exact - page RSA pilote

Page cible:

- la page existante la plus proche de `simulation rsa` ou `simulation rsa couple`

Objectif:
faire de cette page une entree claire vers les variantes de foyer.

### Bloc a ajouter ou renforcer

#### 1. Tester 3 variantes

- `Tester une personne seule`
- `Tester un couple sans enfant`
- `Tester un couple avec enfant`

#### 2. Ce qui change le plus le montant

Points a couvrir:

- composition du foyer
- presence d'enfants
- revenus d'activite
- hebergement gratuit ou charge logement
- cumul avec APL si pertinent

#### 3. Comparer avec un autre cas

Liens prioritaires:

- scenario personne seule
- scenario couple
- scenario temps partiel
- page pilier RSA

#### 4. Parcours recommande

Texte type:

1. Choisissez d'abord la bonne composition de foyer.
2. Comparez ensuite avec ou sans revenu d'activite.
3. Utilisez enfin le simulateur complet pour affiner votre cas.

## Plan exact - page ARE pilote

Page cible:

- la page existante la plus proche de `simulation are`, `calcul are 2026` ou `cumul are et salaire`

Objectif:
faire de cette page une entree produit sur les cas de reprise d'emploi.

### Bloc a ajouter ou renforcer

#### 1. Tester 3 variantes

- `Tester sans reprise d'emploi`
- `Tester avec un salaire a temps partiel`
- `Comparer avec un cumul ARE + salaire`

#### 2. Ce qui change le plus le montant

Points a couvrir:

- salaire journalier de référence si applicable
- duree / situation d'indemnisation
- reprise d'activite
- temps partiel
- minimum d'allocation / fourchette indicative

#### 3. Comparer avec un autre cas

Liens prioritaires:

- page `calcul are 2026`
- page `simulation are`
- page `cumul are et salaire`
- page pilier ARE

#### 4. Parcours recommande

Texte type:

1. Identifiez si vous etes en simple estimation ou en cumul avec reprise d'emploi.
2. Comparez un cas sans salaire et un cas a temps partiel.
3. Lancez ensuite le simulateur complet pour approcher votre situation réelle.

## Ce qu'on cherche a mesurer avec ce pilote

On ne mesure pas seulement le SEO.
On mesure aussi l'usage produit.

Indicateurs a suivre:

- clics vers les liens de variantes
- clics vers le simulateur principal
- profondeur de navigation depuis la page pilote
- pages proches ouvertes apres la premiere page
- maintien ou progression des impressions et clics SEO

## Critere de validation du pilote

Le pilote est juge positif si, sans changer les titles:

- les utilisateurs cliquent sur les variantes proposees
- les pages ouvrent davantage d'autres pages du cluster
- les clics vers le simulateur augmentent
- les pages continuent a prendre des impressions

Si c'est positif:

- on duplique ce format sur les autres pages en observation
- on ajoute ensuite une couche `observatoire leger`

## Definition de l'observatoire leger

Avant un vrai observatoire base sur de la donnee agregée, on peut deja ajouter des blocs utiles issus des scenarios et de la navigation.

Exemples:

- `Variantes les plus proches de ce profil`
- `Cas qui font le plus varier le montant`
- `Profils souvent compares`
- `Si votre situation change, testez aussi`

Ce n'est pas encore une base de donnees proprietaire forte.
Mais c'est deja une experience plus riche et plus dure a copier qu'une page texte standard.

## Shortlist - 10 fonctionnalites pSEO a tester

Classement:

- impact SEO
- impact utilisateur
- difficulte d'implementation

### 1. Variantes testables dans la page

- Impact SEO: fort
- Impact utilisateur: tres fort
- Difficulte: faible a moyenne

But:
faire tester 2 a 4 cas proches sans quitter le cluster.

### 2. Tableau de comparaison entre scenarios proches

- Impact SEO: moyen a fort
- Impact utilisateur: tres fort
- Difficulte: faible

But:
montrer tout de suite comment le montant varie entre plusieurs cas.

### 3. Bloc "ce qui change le plus le montant"

- Impact SEO: moyen
- Impact utilisateur: tres fort
- Difficulte: faible

But:
apporter de la vraie valeur metier lisible en 10 secondes.

### 4. Parcours recommande

- Impact SEO: moyen
- Impact utilisateur: fort
- Difficulte: faible

But:
transformer une page en point d'entree vers un mini-parcours.

### 5. Bloc methodologie et sources

- Impact SEO: fort sur YMYL
- Impact utilisateur: fort
- Difficulte: faible

But:
augmenter la credibilite avec methode, limites et sources officielles.

### 6. Prefill intelligent du simulateur

- Impact SEO: indirect
- Impact utilisateur: tres fort
- Difficulte: moyenne

But:
ouvrir le simulateur avec des valeurs deja pre-remplies depuis la page pSEO.

### 7. Comparaison "si votre situation change"

- Impact SEO: moyen
- Impact utilisateur: fort
- Difficulte: moyenne

But:
montrer l'impact d'un enfant, d'un loyer plus haut, d'un passage au chômage, d'un temps partiel, etc.

### 8. Observatoire leger par cluster

- Impact SEO: fort
- Impact utilisateur: fort
- Difficulte: moyenne

But:
afficher les cas les plus compares, les variantes les plus consultees ou les fourchettes typiques.

### 9. Tracking des blocs pSEO

- Impact SEO: indirect
- Impact utilisateur: indirect
- Difficulte: faible a moyenne

But:
mesurer quels blocs generent des clics et quels parcours meritent d'etre dupliques.

### 10. Recommandation de page suivante

- Impact SEO: moyen
- Impact utilisateur: fort
- Difficulte: faible

But:
dire clairement a l'utilisateur quoi lire ou simuler ensuite.

## Ordre de test recommande

1. variantes testables
2. tableau de comparaison
3. bloc "ce qui change le plus le montant"
4. methodologie et sources
5. tracking des blocs
6. prefill intelligent du simulateur
