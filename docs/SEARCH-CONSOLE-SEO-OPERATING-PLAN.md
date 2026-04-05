# Search Console SEO Operating Plan

But: transformer les requetes Search Console en un systeme simple pour:

- ameliorer les hubs SEO
- prioriser les prochaines pages pSEO
- renforcer le maillage interne
- eviter de publier ou modifier des pages sans signal utile

## Principe

On ne prend pas de decision SEO sur une intuition seule.

Chaque requete observee doit finir dans un seul de ces 3 bacs:

- `Optimiser le hub`
- `Creer une page pSEO`
- `Ignorer / surveiller`

Les requetes qui ont des impressions **et** des clics sont les meilleurs signaux.
Les requetes qui ont beaucoup d'impressions mais peu de clics sont le meilleur gisement d'optimisation CTR.
Les requetes tres precises sont le meilleur vivier pour les futures pages pSEO.

## Tableau De Pilotage

Creer un seul tableau de suivi avec ces colonnes:

- `requete`
- `clics`
- `impressions`
- `ctr`
- `position`
- `page_actuelle`
- `cluster`
- `type_intention`
- `action`
- `priorite`
- `statut`
- `date_revue`
- `notes`

Valeurs recommandees:

- `cluster`: `apl`, `rsa`, `are`, `prime-activite`, `asf`, `impot`, `notaire`, `charges`, `autre`
- `type_intention`: `hub`, `cas-precis`, `comparatif`, `question`, `local`, `bruit`
- `action`: `hub`, `pseo`, `maillage`, `title-meta`, `attente`
- `priorite`: `P1`, `P2`, `P3`
- `statut`: `a-trier`, `a-faire`, `en-cours`, `publie`, `surveille`, `ignore`

## Regles De Tri

### 1. Optimiser le hub

Choisir `Optimiser le hub` si:

- la requete est large ou semi-large
- une page hub existe deja
- l'intention est bien couverte par une page mere
- le probleme vient surtout du title, de la meta, du hero, du calculateur trop bas ou du maillage

Exemples:

- `simulation rsa`
- `simulation prime activite`
- `simulateur are`
- `simulation apl`
- `calcul apl 2026`

Actions possibles:

- retravailler `title` et `meta`
- clarifier le H1 et la promesse visible
- remonter le bloc de calcul
- ajouter des sections query-intent
- ajouter des liens vers les satellites

### 2. Creer une page pSEO

Choisir `Creer une page pSEO` si:

- la requete est precise
- la situation utilisateur est concrete
- l'angle est distinct d'une page existante
- la requete ressemble a un pattern deja gagnant

Exemples:

- `apl avec un smic`
- `apl personne seule smic`
- `combien d'apl pour un loyer de 700 euros personne seule`
- `simulation prime d'activite temps partiel`
- `simulation rsa couple avec un enfant`

Actions possibles:

- verifier si une page tres proche existe deja
- si non, creer un slug cible
- ajouter la page au cluster, au sitemap et au maillage
- suivre indexation, impressions et clics apres publication

### 3. Ignorer / surveiller

Choisir `Ignorer / surveiller` si:

- la requete est une faute ou une variante quasi identique
- l'intention est trop floue
- la requete est trop locale pour justifier une page seule
- la requete est trop faible pour l'instant

Exemples:

- multiples variantes typo d'une meme requete
- micro-localites avec seulement quelques impressions
- formulations trop ambiguës sans page cible claire

## Score Simple Par Requete

Pour prioriser sans se perdre, attribuer un score sur `20`.

Ajouter:

- `impressions`: `0 a 5`
- `clics`: `0 a 5`
- `intention claire`: `0 a 5`
- `proximite avec un pattern gagnant`: `0 a 5`

Retirer:

- `risque de cannibalisation`: `0 a -5`

Lecture:

- `15+` -> `P1`
- `10 a 14` -> `P2`
- `<10` -> `P3` ou `surveille`

## Regles De Priorite

Traiter toujours dans cet ordre:

1. Requetes avec `clics + impressions`
2. Requetes avec `fortes impressions + CTR faible`
3. Requetes longue traine tres precises
4. Requetes faibles ou bruit

Autrement dit:

- les requetes qui cliquent nous disent quoi pousser
- les requetes qui s'affichent sans cliquer nous disent quoi corriger
- les requetes tres precises nous disent quoi creer

## Routine Hebdomadaire

### Lundi

- exporter Search Console en `7 jours`
- exporter Search Console en `28 jours`
- relever les hubs et pages avec le plus d'impressions
- relever les nouvelles pages qui commencent a prendre des impressions

### Mardi

- trier les requetes dans les 3 bacs
- attribuer un score
- choisir `5 actions maximum` pour la semaine

### Mercredi

- optimiser `2 hubs maximum`
- retoucher seulement les parties qui influencent vraiment le CTR et l'usage:
  - `title`
  - `meta`
  - hero
  - bloc calcul
  - maillage
  - sections hautes

### Jeudi

- publier `3 a 5 pages pSEO maximum`
- seulement si l'angle est distinct et justifie par les requetes

### Vendredi

- verifier:
  - indexation
  - impressions
  - premiers clics
  - pages qui demarrent vite
- preparer la prochaine vague

## Limites A Respecter

Pour eviter de se disperser:

- `2` hubs maximum modifies par semaine
- `3 a 5` nouvelles pages pSEO maximum par semaine
- `1` seul tableau de pilotage
- `1` seule revue hebdo

Si on fait plus, on publie plus vite qu'on apprend.

## Moteurs A Alimenter

Le site doit tourner avec 3 moteurs en meme temps:

### 1. Hubs SEO

Pages a fort volume et fort potentiel CTR:

- `/pages/apl`
- `/pages/rsa`
- `/pages/are`
- `/pages/prime-activite`
- `/pages/asf`
- `/pages/impot`
- `/pages/notaire`
- `/pages/charges`

### 2. Pages pSEO

Pages de longue traine basees sur des cas concrets:

- loyer
- smic
- chomage
- reprise-emploi
- temps partiel
- couple
- parent isole
- enfants

### 3. Maillage

Chaque nouvelle page doit renforcer:

- son hub parent
- 2 pages proches
- si pertinent, 1 hub voisin

## Signaux A Suivre

Les vraies metriques utiles sont:

- `impressions`
- `clics`
- `ctr`
- `position`
- `indexation`
- `revenu par page` une fois qu'une page commence a prendre du trafic

## Regles De Qualite

Avant de creer une page, verifier:

1. Est-ce qu'une page tres proche existe deja ?
2. Est-ce que la requete decrit une vraie situation utilisateur ?
3. Est-ce que l'angle est distinct ?
4. Est-ce qu'on sait deja vers quel hub et quelles pages la relier ?
5. Est-ce qu'on pourra suivre son impact dans Search Console ?

Si la reponse est `non` a plusieurs de ces questions, ne pas creer la page tout de suite.

## Premiere Shortlist A Utiliser

### A optimiser surtout dans les hubs

- `simulation rsa`
- `simulation prime activite`
- `prime d'activite simulation`
- `simulateur are`
- `simulation apl`
- `calcul apl 2026`
- `montant asf 2026`

### A transformer en pages ou variantes pSEO

- `apl avec un smic`
- `apl personne seule smic`
- `apl smic seul`
- `combien d'apl pour un loyer de 700 euros personne seule`
- `combien d'apl pour un loyer de 600 euros`
- `combien d'apl pour un loyer de 700 euros avec 2 enfants`
- `simulation prime d'activite temps partiel`
- `simulation rsa couple avec un enfant`

### A surveiller sans surinvestir

- variantes typo ou accent d'une meme requete
- micro-localites trop faibles
- requetes ambiguës sans page cible claire

## Definition Du Succes

Le systeme fonctionne si:

- chaque requete importante a une action claire
- on ne cree plus de pages au hasard
- les hubs gagnent en CTR et en clarté
- les nouvelles pages pSEO sont liees a de vrais signaux
- le maillage interne suit la logique des clusters

## Resume Executif

La regle la plus importante est simple:

- `clics + impressions` -> ce qu'il faut pousser
- `impressions sans clics` -> ce qu'il faut corriger
- `requete precise` -> ce qu'il faut peut-etre creer

Ce document doit servir de cadre unique avant toute:

- retouche SEO
- creation de page pSEO
- priorisation de sprint contenu
