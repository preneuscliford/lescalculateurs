## Objectif
- Vérifier que chaque ancienne URL `/pages/blog/frais-notaire-XX.html` renvoie bien un 301 vers `/pages/blog/departements/frais-notaire-XX.html` et que la cible retourne 200.

## Méthode
- Créer un script Node `scripts/test-redirects.js` (sans dépendances externes) qui:
  - Parcourt les 44 codes fournis par Google Search Console.
  - Fait une requête GET sur l’ancienne URL en **sans suivi de redirection**.
  - Valide le `statusCode === 301` et la `Location` vers l’URL attendue.
  - Fait une requête GET sur l’URL de destination et valide `statusCode === 200`.
  - Affiche un rapport clair (OK/KO par code) et un résumé.

## Sécurité et environnement
- Script autonome, compatible Windows.
- Aucun serveur démarré, uniquement des requêtes HTTP sortantes.

## Livrable
- Rapport console: liste des codes, l’état du 301, l’URL cible, et le 200 final.

Si tu confirmes, je crée le script, je l’exécute et je te donne le rapport immédiatement.