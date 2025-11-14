## Constats
- Le lien `https://www.service-public.gouv.fr/particuliers/vosdroits/F2377` est obsolète et retourne une erreur.
- Des occurrences de `F2377` existent dans:
  - `src/pages/notaire.html`
  - Nombreuses pages départementales: `src/pages/blog/departements/frais-notaire-XX.html`
- Liens actuels stables/valides à privilégier:
  - Frais de notaire (définition et barème): `https://www.service-public.fr/particuliers/vosdroits/F17701`
  - Simulateur frais de notaire (ANIL via SP): `https://www.service-public.fr/particuliers/vosdroits/R54267`
  - PTZ: `https://www.service-public.fr/particuliers/vosdroits/F10871`
  - Assurance emprunteur (page de référence stable): `https://www.service-public.fr/particuliers/actualites/A15916`
  - Plus-value immobilière: `https://www.service-public.fr/particuliers/vosdroits/F10864`
  - Taxe foncière: `https://www.service-public.fr/particuliers/vosdroits/F59`
  - IK (barèmes et cadre fiscal): `https://www.service-public.fr/particuliers/vosdroits/F1989` + actualité barèmes 2025: `https://www.service-public.fr/particuliers/actualites/A14686`
  - Impots.gouv (plus-values): `https://www.impots.gouv.fr/particulier/plus-values-imposees`
  - Banque de France (taux d’usure): exemple 2025-Q3 `https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2025-q3` (ou page index `https://www.banque-france.fr/statistiques/taux-et-cours/taux-dusure`)

## Modifications prévues
1. Remplacer systématiquement `F2377` par `F17701` et ajouter le simulateur `R54267` là où pertinent:
- `src/pages/notaire.html` → remplacer le lien obsolète par `F17701` et ajouter `R54267` en complément.
- `scripts/generate-departement-articles.js` → mise à jour de la section Références pour générer `F17701` (et possibilité d’ajouter un lien vers `R54267`). Régénérer les 101 pages.

2. Stabiliser les liens des autres calculateurs:
- `src/pages/pret.html` → conserver `F10871` (PTZ) ; remplacer l’actualité `A16111` par `A15916` (assurance emprunteur, plus stable et généraliste).
- `src/pages/plusvalue.html` → conserver `F10864` + `impots.gouv.fr/particulier/plus-values-imposees` (valide).
- `src/pages/taxe.html` → conserver `F59` + `impots.gouv.fr/particulier/la-taxe-fonciere` (si utilisé).
- `src/pages/ik.html` → remplacer `F510` par `F1989` et ajouter l’actualité barèmes 2025 `A14686`.

3. Ajouter une vérification automatique des liens externes:
- Créer un petit script Node (`scripts/verify-links.js`) qui:
  - Parcourt `src/pages/**/*.html`
  - Extrait tous les liens externes
  - Teste les URLs (HEAD/GET) et signale les codes >= 400
  - Génère un rapport en console + fichier (`reports/link-check.json`)
- Lancer ce script avant build/déploiement et corriger les éventuels liens invalides détectés.

## Déroulé
- Étape 1: Mise à jour du générateur (départements) et des pages ciblées (notaire, prêt, IK) pour les nouveaux liens.
- Étape 2: Régénérer les 101 pages départementales.
- Étape 3: Exécuter le vérificateur de liens sur tout `src/pages`.
- Étape 4: Ajustements finaux si le vérificateur signale d’autres liens cassés.

## Validation
- Contrôle manuel sur quelques pages (Morbihan 56, notaire, prêt, IK) pour voir les nouvelles sources affichées.
- Vérifier que les URLs renvoient des pages valides et pertinentes (200/302) au moment du déploiement.

## Remarque
- Le domaine correct est `service-public.fr` (et non `service-public.gouv.fr`). Le remplacement `F2377 → F17701` corrigera l’obsolescence tout en renvoyant vers une page d’explication et barème notarial actualisés.

Confirmez et j’applique ces corrections, puis j’ajoute le vérificateur de liens et régénère toutes les pages.