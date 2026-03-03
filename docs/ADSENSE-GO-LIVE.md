# Go-live AdSense (checklist rapide)

## 1) Vérification technique automatisée

Lancer le check:

```bash
npm run adsense:go-live-check
```

Ce script valide automatiquement:
- `public/ads.txt` présent avec un publisher Google.
- `public/third-party-loader.js` présent avec consent mode par défaut en `denied` et fallback banner.
- `src/index.html` + toutes les pages HTML complètes de `src/pages` **et** `src/simulateurs` chargent `/third-party-loader.js`.
- Aucun chargement direct GTM / GA4 / AdSense n'est resté dans `src/pages` et `src/simulateurs` (hors fichiers backup).

## 2) Vérification build

```bash
npm run build
```

## 3) Vérifications manuelles avant prod

- Tester le bandeau cookie en navigation privée:
  - premier chargement: bannière visible;
  - **Refuser**: pas de tracking avec cookies;
  - **Accepter**: consentement appliqué et persistant.
- Vérifier `https://<domaine>/ads.txt` en production.
- Vérifier que le domaine est bien validé dans AdSense.

## 4) Décision go-live

- Si les checks auto + build sont verts et les tests manuels OK: **go-live autorisé**.
- Sinon: corriger les points bloquants, relancer le check, puis revalider.
