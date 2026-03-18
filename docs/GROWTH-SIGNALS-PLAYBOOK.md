# Growth Signals Playbook

Date: 2026-03-18
Scope: priorisation SEO + produit a partir de Search Console et Vercel Analytics
Owner: LesCalculateurs

## Objectif

Ce document sert de reference pour:

1. comprendre ce qui marche deja
2. choisir les prochaines pages a lancer
3. renforcer les pages piliers qui performent
4. eviter de publier des pages a l'aveugle

La regle centrale est simple:

`signal reel -> consolidation -> derivation -> mesure -> extension`

On ne scale pas "par volume".
On scale "par pattern valide".

## Sources de verite

Deux sources doivent toujours etre lues ensemble:

1. Search Console
   Sert a voir:
   - les clics SEO
   - les impressions
   - le CTR
   - les pages deja acceptees par Google

2. Vercel Analytics
   Sert a voir:
   - les pages qui servent de vraies portes d'entree
   - les pages qui sont consultees meme si le signal SEO direct est encore faible
   - les pages qui meritent un renforcement produit

## Lecture actuelle des signaux

### Pages piliers aides qui performent deja

- `/pages/apl`
- `/pages/are`
- `/pages/rsa`
- `/pages/asf`
- `/pages/prime-activite`

Ces pages ont deja un volume d'impressions ou de clics suffisant pour etre considerees comme des actifs prioritaires.

### Cluster pSEO deja valide

Les pages APL les plus prometteuses a date sont:

- `/pages/apl/apl-celibataire-smic`
- `/pages/apl/apl-chomage-loyer-moyen`
- `/pages/apl/apl-couple-sans-enfant`
- `/pages/apl/apl-alternant`
- `/pages/apl/apl-personne-seule-smic`

Le pattern gagnant est net:

- foyers modestes
- SMIC
- chomage
- absence de revenu
- personne seule
- couple sans enfant
- parent isole

### Deuxieme moteur de croissance

Le cluster notaire reste un moteur fort, surtout sur les pages locales/departementales.

Pages a surveiller en continu:

- `/pages/notaire`
- `/pages/blog/frais-notaire-ancien-neuf-2026`
- pages `frais-notaire-XX`

## Regles de priorisation

Une nouvelle page peut etre lancee seulement si au moins une de ces conditions est vraie:

1. elle derive directement d'une page qui a deja des clics
2. elle derive d'un pattern qui a deja au moins des impressions significatives
3. elle renforce un cluster produit deja fort
4. elle repond a une intention tres proche d'une requete deja observee

Une page ne doit pas etre lancee si:

- elle est purement theorique
- elle n'est reliee a aucun signal reel
- elle duplique une page deja testee sans angle plus clair
- elle ouvre un nouveau cluster sans besoin visible

## Strategie de croissance retenue

### Axe 1: revenus modestes / absence de revenu / aides essentielles

C'est l'axe prioritaire actuel.

Sous-intentions a dominer:

- sans revenu
- chomage
- fin de droits
- SMIC
- personne seule
- couple sans enfant
- parent isole
- reprise d'emploi
- quelles aides sans revenu
- aides apres perte d'emploi

### Axe 2: pages piliers plus utiles

Le trafic futur ne viendra pas seulement du pSEO.
Il viendra du mix:

- pages piliers fortes
- pSEO utile
- parcours produit
- maillage interne
- pre-remplissage intelligent

### Axe 3: notaire local comme moteur parallele

Le cluster notaire doit continuer a etre entretenu, car plusieurs pages locales performent deja tres bien.

## Framework de decision avant chaque nouvelle vague

Pour chaque vague de pages:

1. relever les pages qui ont des clics
2. relever les pages avec beaucoup d'impressions mais CTR faible
3. relever les pages vues Vercel qui meritent un meilleur support SEO
4. identifier 1 a 3 patterns gagnants maximum
5. lancer un petit lot derive de ces patterns

Taille recommandee par vague:

- 10 a 15 pages si le pattern est deja prouve
- 5 a 8 pages si le pattern est encore en test

## Framework de renforcement des pages piliers

Chaque page pilier forte doit progresser dans cet ordre:

1. clarte immediate de la promesse
2. acces rapide au simulateur
3. variantes utiles a tester
4. cas proches / scenarios proches
5. explication "ce qui change le plus le montant"
6. liens vers pages pSEO du meme cluster
7. liens vers simulateurs complementaires

## Ce qu'on mesure a chaque cycle

### Search Console

- clics par page
- impressions par page
- CTR
- position moyenne
- nouvelles pages indexees

### Vercel Analytics

- visiteurs par page
- pages qui deviennent des portes d'entree
- pages qui meritent un meilleur maillage

## Regles de production

- ne jamais repartir de zero si un pipeline existe deja
- reutiliser les generateurs et renderers pSEO deja en place
- corriger a la source quand une erreur se repete
- garder les URLs stables une fois en observation
- ne pas toucher aux titles des pages en observation sans raison forte

## Lecture operationnelle

Quand on reprend ce chantier plus tard, l'ordre par defaut est:

1. lire les exports Search Console et Vercel
2. mettre a jour la liste des pages gagnantes
3. choisir le prochain lot a partir de ces signaux
4. renforcer 1 a 3 pages piliers
5. seulement ensuite lancer de nouvelles pages

## Etat actuel a garder en tete

Aujourd'hui, les signaux les plus prometteurs sont:

- `APL`
- `ARE`
- `RSA`
- `ASF`
- `Prime d'activite`
- `Notaire local`

Et le pattern pSEO le plus fort reste:

- `revenus modestes / absence de revenu / aides essentielles`
