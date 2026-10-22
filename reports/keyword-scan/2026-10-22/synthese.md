# Scan de mots-clés du 22/10/2026 : synthèse pour décision

Thèmes : chômage, CAF, logement. 517 requêtes d'autocomplétion Google, croisées avec les
requêtes Search Console (top 100 de juillet-août et longue traîne d'octobre) et les exports
Semrush ARE, APL et prime d'activité (février 2026). Détail par thème : `chomage.md`,
`caf.md`, `logement.md` (et les CSV).

## Ce que le scan confirme

1. **Calculateur « Date de fin de droits chômage » (pilote n° 1) : demande confirmée.**
   C'est le plus gros groupe du thème chômage : 298 formulations, contre 36 pour le calcul du
   montant ARE déjà couvert par `/pages/are`. Les recherches portent sur la date
   (« fin de droits chômage que faire », « … jusqu'à quand ») et surtout sur les **situations
   qui modifient la date** : arrêt maladie, invalidité, travailleur handicapé, senior,
   60, 61 et 62 ans, retraite.
2. **Module délai de carence : 104 formulations**, souvent croisées avec le motif de rupture
   (inaptitude, rupture conventionnelle) ou l'arrêt maladie.
3. **Module dégressivité : 23 formulations**, dont « après 57 ans », « senior », « 59 ans »,
   « formation », « création d'entreprise ».
4. **Observatoire « délais CAF mesurés » : premier groupe CAF (329 formulations).** On y trouve
   beaucoup de recherches **par département** (« délai caf du Nord », « Bouches-du-Rhône »,
   « Gironde », « Haute-Garonne ») et par aide (prime d'activité, APL, RSA, changement de
   situation). Cela confirme l'intérêt d'une publication par département, une fois le seuil de
   30 réponses atteint.

## Ce que le scan fait apparaître en plus du brief

- **Date de paiement CAF : 115 formulations** (« date paiement caf septembre 2026 », « … rentrée
  scolaire »). Une page principale « calendrier des versements », avec une date par mois, plutôt
  qu'une page par mois. À étudier : la règle de versement doit être sourcée.
- **Préavis de départ du locataire : 255 formulations**, le plus gros groupe logement, devant le
  dépôt de garantie (48), la révision IRL (34) et le DPE (25). Il ne figurait pas dans la liste
  des thèmes suivants.

## Pages dédiées proposées (critère 1 rempli : formulation recherchée)

Il reste à valider pour chacune les critères 2 (réponse matériellement différente) et 3
(source propre). Je n'ai rien créé.

| Formulation | Règle qui pourrait différer (à vérifier) |
|---|---|
| fin de droit chômage et invalidité | effet d'une pension d'invalidité sur l'ARE |
| fin de droit chômage et arrêt maladie | report de la date de fin pendant l'arrêt |
| fin de droit chômage travailleur handicapé | durée ou maintien spécifiques |
| fin de droit chômage senior / à 62 ans (60 et 61 ans juste sous le seuil) | maintien des droits jusqu'à la retraite |
| délai de carence et rupture conventionnelle ; durée d'indemnisation après rupture conventionnelle | différé spécifique, durée réduite au 1er septembre 2026 |
| délai de carence et licenciement pour inaptitude | indemnité spéciale et différé |
| délai de carence et trimestre retraite ; délai de carence et arrêt maladie | validation de trimestres, report |
| délai RSA après démission | conditions d'ouverture du RSA après une démission |

Les candidats du brief « fin de droits à 60, 61 ou 62 ans » et « dégressivité à 57 ans et
plus » apparaissent bien, mais avec un signal plus faible (3,1 à 4) : ils peuvent rester
traités par les saisies du calculateur principal, avec un paragraphe dédié.

## Concurrence (recherche web classique, 20 formulations)

L'API Custom Search est fermée aux nouveaux projets (arrêt le 01/01/2027) : la concurrence a été
relevée par une recherche web classique, consignée dans `input/serp-recherche-web-2026-10-22.json`.
L'ordre des résultats n'est pas celui de Google France, mais les sites présents sont indicatifs.

| Concurrence | Formulations | Lecture |
|---|---|---|
| **Faible** (PDF, forums, questions parlementaires, sites suisses ou belges) | fin de droits et invalidité ; travailleur handicapé ; carence et licenciement pour inaptitude ; « date fin de droits chômage » | aucune page française n'y répond avec un calcul : meilleures opportunités, si la règle est vérifiée (critère 2) |
| Moyenne | durée après rupture conventionnelle (code.travail.gouv.fr, legisocial) ; dégressivité ; dépôt de garantie | une réponse officielle existe, mais pas de calculateur de date |
| Forte | arrêt maladie (Unédic, aide-sociale), senior et 62 ans, carence et rupture conventionnelle (legalplace, legalstart, shine), délais et paiement CAF, préavis, DPE, IRL (bailfacile, hellowatt, effy, selectra) | terrain occupé : la page principale et l'observatoire (données propres) doivent faire la différence |

Points relevés au passage :
- **travailleur handicapé** : aucune règle de durée ou de date propre n'apparaît dans les résultats,
  donc le critère 2 n'est probablement pas rempli. À traiter par un paragraphe de la page principale ;
- **invalidité** et **inaptitude** : des règles spécifiques existent (cumul avec une pension
  d'invalidité ; préavis non payé et indemnité spéciale en cas d'inaptitude). À vérifier sur les
  sources officielles avant toute page ;
- plusieurs sites affirment que le délai de carence part de l'inscription : c'est inexact quand il
  y a des différés (fiche Unédic), et c'est un angle pour le calculateur.

## Limites de ce premier rapport

- **Concurrence vérifiée sur 20 formulations seulement**, par recherche web classique (voir
  ci-dessus) ; les autres restent « non vérifiées ».
- **Pas de volume pour la longue traîne** : les exports Semrush disponibles portent sur les
  simulateurs existants. Un export Semrush sur « fin de droits chômage », « délai caf » et
  « préavis location », déposé dans `reports/keyword-scan/input/`, affinerait le score.
- **L'autocomplétion indique qu'une formulation est recherchée, pas combien.** Les scores
  servent à classer, pas à prévoir un trafic.

## Décisions attendues

1. Valider le lancement du calculateur « Date de fin de droits chômage », avec les modules
   carence et dégressivité (livrable 2).
2. Dire lesquelles des pages dédiées proposées passent à l'étude des critères 2 et 3.
3. Ajouter ou non à la liste des thèmes suivants le préavis du locataire et le calendrier de
   paiement CAF.
4. Fournir, si possible, des clés Custom Search et un export Semrush sur les nouveaux thèmes.
