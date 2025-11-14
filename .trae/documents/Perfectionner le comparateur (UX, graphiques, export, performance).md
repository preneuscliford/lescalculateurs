## Objectif
Rendre la comparaison plus lisible, interactive et exploitable, tout en améliorant la netteté des visuels et l’utilité des exports.

## UX & Contenu
- Titre dynamique enrichi: inclure type de bien (ancien/neuf/terrain) si identique, et le nombre de scénarios.
- Sous-titre par scénario: afficher un résumé (département, type de bien, prix, % du prix) en badges.
- Mise en avant du moins cher: badge "Le moins cher" sur la colonne et la barre correspondante.
- Tri et filtrage: trier par total, par droits, par pourcentage; filtre par type de bien.

## Graphiques
- Barres empilées: émoluments, droits, frais divers, hypothèque, TVA (comparaison visuelle détaillée).
- Commutateur absolu/relatif: montants (€) vs pourcentages (%) du prix.
- Annotations: afficher l’écart vs le moins cher au-dessus des barres.
- Thème accessible: palette contrastée, tailles de police 13–14 px sur axes.

## Interactions
- Édition de libellés: permettre de renommer un scénario (ex: "Vannes – ancien").
- Réorganisation: drag-and-drop pour ordonner les colonnes.
- Partage: lien deep-link des scénarios ajoutés (sérialisation dans l’URL).

## Export
- Noms de fichiers dynamiques: inclure départements et prix (ex: `comparaison-250000-nord_corsee-sud_val-de-marne.pdf`).
- Orientation paysage pour PDF (option), en plus de A4 portrait.
- Entête export: date, prix d’acquisition, nombre de scénarios, type de bien; pied de page avec sources.

## Accessibilité
- aria-labels détaillés pour le tableau et le graphique; focus borne sur actions.
- Mode haut contraste; tooltips clavier.

## Performance
- Lazy-load du module Chart.js et html2canvas/jspdf (déjà en place pour export); dé-synchroniser le redraw lors d’ajouts multiples (debounce).
- Ajustement auto de la hauteur du graphique en fonction du nombre de scénarios.

## Analytics
- Événements: ajout/suppression scénario, tri appliqué, export PNG/PDF, partage de lien.
- Dimensions: type de bien, plage de prix, départements inclus.

## Implémentation
- Étendre `ComparaisonNotaire`:
  - Empilé vs simple (options), absolu vs relatif (toggle)
  - Calcul et rendu des annotations d’écart
  - Génération de nom de fichier export dynamique
  - Badges scénario et tri
- Mise à jour HTML du bloc pour afficher badges et contrôles (marqués `data-export-exclude`).

## Validation
- Tests avec 1, 2 et 4 scénarios, prix identiques et différents.
- Vérifier netteté, export (portrait/paysage), exclusion des contrôles.

Confirmez et je commence l’implémentation par les badges scénario, le tri, le nom dynamique d’export et les barres empilées avec commutateur €/%.