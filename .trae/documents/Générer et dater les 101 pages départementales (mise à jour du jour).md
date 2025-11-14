## Objectif
Mettre à jour et régénérer les 101 pages "frais de notaire" par département avec:
- Date de mise à jour du jour (affichage + JSON-LD `dateModified`)
- Canonical/OG/Breadcrumb pointant vers l’URL départementale
- FAQ visible + `FAQPage` JSON-LD alignée avec les requêtes fréquentes
- Maillage interne vers départements de la même région

## Modifications techniques
1. Générateur (`scripts/generate-departement-articles.js`)
- Ajouter une fonction utilitaire pour la date du jour:
  - `formatDateFr(today)` → "14 novembre 2025"
  - `formatISO(today)` → "2025-11-14T00:00:00Z"
- Utiliser la date du jour pour:
  - JSON-LD `dateModified`
  - Pied d’article: "Article mis à jour le <date_fr>"
- Conserver `datePublished` (6 octobre 2025) tel quel.
- Vérifier/mettre à jour:
  - `link rel="canonical"` et `og:url` → `/pages/blog/departements/frais-notaire-XX.html`
  - Breadcrumb niveau 3 → même route départementale
  - Bloc FAQ visible (4 questions) + `FAQPage` JSON-LD (reprises des top requêtes: frais, calcul, neuf vs ancien, notaire à <ville1>)
  - Bloc "Voir aussi" (3–4 liens vers départements de la même région)
- Ajouter des commentaires au niveau des fonctions modifiées, selon votre préférence.

## Régénération et vérifications
1. Vérifier qu’aucun serveur n’est déjà en cours d’exécution.
2. Lancer la génération: `node scripts/generate-departement-articles.js`.
3. Vérifier un échantillon (ex.: 56, 29, 35, 22):
- Canonical/OG/Breadcrumb → route départementale
- JSON-LD: `Article` (dateModified du jour), `FAQPage` présent
- Pied d’article: "Article mis à jour le <date_fr>"
- Liens internes régionaux OK
4. Mettre à jour `public/sitemap.xml` si des routes y pointent encore vers l’ancienne structure (remplacer par `/pages/blog/departements/...`).
5. Build/preview:
- Vérifier qu’aucun autre process n’est actif
- Lancer le preview local et ouvrir les pages pour valider le rendu

## Contrôles SEO
- Cohérence meta description: calcul, ancien/neuf, simulateur
- CTR: titres avec année + "Simulateur gratuit"
- Maillage interne: hub ↔ départements, départements ↔ simulateur
- Search Console: inspection URL (couverture + canonical choisi par Google)

## Livrables
- 101 pages régénérées avec date du jour (affichage + `dateModified`)
- Sitemap aligné
- Validation locale (preview) sur plusieurs pages

Confirmez et je procède à la mise à jour et à la régénération immédiatement.