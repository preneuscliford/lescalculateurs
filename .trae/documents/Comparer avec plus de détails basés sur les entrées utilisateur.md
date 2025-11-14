## Objectif
Enrichir le comparateur avec des détails pertinents issus des données saisies par l’utilisateur, pour mieux expliquer les écarts et faciliter la décision.

## Détails à afficher (par scénario)
- Informations générales: département (label complet), type de bien, prix d’acquisition, prix net immobilier (déduction du mobilier), % du prix.
- Emprunt: type (sans/sans garantie/avec garantie), montants prêts (PTZ, autres), frais d’hypothèque calculés.
- Barème: taux des droits du département, tranches des émoluments (afficher contribution par tranche), TVA base et montant.
- Débours: frais divers (cadastre/conservation/formalités) avec totals.
- Synthèse: total, écart vs le moins cher (valeur et %), badge “Le moins cher”.

## UI & lisibilité
- Badges en-tête par colonne: résumé compact (département, type bien, prix, %).
- Accordéons “Détails du calcul” par scénario: ouvrir pour voir tranches émoluments, éléments débours, justifications.
- Tri & filtres: tri par total/%/droits; filtres par type de bien; bouton “Réinitialiser”.
- Titre enrichi: prix d’acquisition (unique ou plage min–max) et nombre de scénarios.

## Graphiques
- Barres empilées: datasets (Émoluments, Droits, Frais divers, Hypothèque, TVA).
- Commutateur €/%: bascule entre montants et pourcentages du prix.
- Annoter l’écart vs le moins cher au-dessus des barres; badge vert sur la plus faible.
- Hauteur du canvas adaptative au nombre de scénarios; DPI forcé pour netteté.

## Export
- PDF: en-tête avec date, prix, type bien, nombre de scénarios; génération paysage optionnelle.
- CSV: ajouter lignes détaillées (par tranche, par poste); inclure % du prix.
- Nom de fichier dynamique: inclure prix et départements (ex. `comparaison-250000-paris_lyon_marseille.pdf`).

## Implémentation technique
- `src/utils/comparaisonNotaire.ts`
  - Étendre `CalculNotaire` (ajouter contributions par tranches et postes).
  - `genererHTML()`: badges tête de colonne, accordéons de détails, tri/filtres (UI marquée `data-export-exclude`).
  - `creerGraphique()`: graphique empilé, annotations, toggle €/%. 
  - Helpers: format monétaire (0/2 décimales), génération nom de fichier.
- `src/pages/notaire.html`: s’assurer que `dernierCalculNotaire` contient les champs nécessaires (déjà en grande partie présents).

## Validation
- Tester 1/2/4 scénarios avec prix identiques et variables; vérifier lisibilité et exactitude.
- Export PNG/PDF: vérifier exclusion des contrôles et présence des détails.
- Performance: contrôler fluidité avec 4 scénarios; ajuster debounce si nécessaire.

Confirmez et je commence par: badges scénario, accordéons “Détails du calcul”, tri, graphique empilé avec bascule €/% et nom de fichier d’export dynamique.