## Objectif
Afficher plus de détails basés sur les saisies utilisateur et améliorer la lecture et l’export du comparateur.

## Détails par scénario
- Badges en en-tête: département, type de bien, prix d’acquisition, % du prix
- Accordéon « Détails du calcul »: 
  - Émoluments par tranches (contribution par tranche)
  - Droits (taux du département, base, montant)
  - Frais divers (cadastre, conservation, formalités)
  - Hypothèque (selon type d’emprunt et montants)
  - TVA (base HT et montant)
- Synthèse: total et écart vs le moins cher (montant et %), badge « Le moins cher »

## Contrôles & UX
- Tri: par total, par droits, par % du prix
- Filtres: par type de bien (ancien/neuf/terrain)
- Titre enrichi: prix d’acquisition (valeur unique ou plage min–max) et nombre de scénarios

## Graphiques
- Barres empilées par postes (Émoluments, Droits, Frais divers, Hypothèque, TVA)
- Commutateur €/% (montants absolus vs pourcentages du prix)
- Annotations: écart vs le moins cher au-dessus des barres
- Hauteur auto selon nombre de scénarios; DPI forcé pour netteté

## Export
- Nom de fichier dynamique (prix + départements)
- Option PDF paysage
- En-tête export: date, prix, type de bien, scénarios; pied: sources

## Implémentation technique
- Étendre `ComparaisonNotaire`:
  - Données de tranches et postes, calculs dérivés
  - `genererHTML()`: badges, accordéons, tri/filtres (UI marquée `data-export-exclude`)
  - `creerGraphique()`: empilé, toggle €/%, annotations
  - Helpers: format monétaire (0/2 décimales), génération nom export

## Validation
- Tester 1/2/4 scénarios (prix identiques et différents)
- Vérifier export PNG/PDF: contrôles exclus, détails inclus
- Contrôler performance et lisibilité

Je commence avec: badges + accordéons de détails + tri + graphique empilé avec bascule €/% et noms d’export dynamiques.