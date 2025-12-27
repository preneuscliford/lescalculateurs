# Checklist de Vérification - Site Health Fixes

## ✅ Pré-Déploiement

### Fichiers Créés/Modifiés

- [ ] `/public/llms.txt` existe et contient informations site
- [ ] `/public/.htaccess` contient redirects 301 et GZIP
- [ ] `/src/pages/ik.html` - URLs JSON-LD sans `.html`
- [ ] `/src/pages/notaire.html` - URLs JSON-LD sans `.html`
- [ ] Vérifier 5-10 autres pages HTML

### Scripts de Test

- [ ] `node scripts/health-check.js` - Exécutable
- [ ] `node scripts/analyze-wordcount.js` - Exécutable
- [ ] `node scripts/analyze-h1-tags.js` - Exécutable
- [ ] `node scripts/analyze-internal-links.js` - Exécutable

### Build & Vérification

- [ ] `npm run build` - Succès (aucune erreur)
- [ ] `dist/` existe avec fichiers générés
- [ ] Pas de fichiers `.html` dans les URLs de sortie

## 🚀 Déploiement

### Avant Push

```bash
# 1. Vérifier les changements
git status

# 2. Stage les fichiers
git add .

# 3. Commit
git commit -m "fix: Site health corrections - llms.txt, redirects, structured data"

# 4. Vérifier avant push
git log --oneline -n 5

# 5. Push
git push origin main
```

### Sur Production

- [ ] Redémarrer serveur
- [ ] `npm run build` sur le serveur
- [ ] Vérifier `/dist/` a été généré
- [ ] Vérifier `/public/llms.txt` accessible

## 🔍 Tests Post-Déploiement

### Fichiers

- [ ] https://www.lescalculateurs.fr/llms.txt → 200 OK
- [ ] https://www.lescalculateurs.fr/sitemap.xml → 200 OK
- [ ] https://www.lescalculateurs.fr/pages/ik → 200 OK (pas 301/302)
- [ ] https://www.lescalculateurs.fr/pages/notaire → 200 OK

### Redirects

- [ ] https://www.lescalculateurs.fr/pages/ik.html → 301 (permanent)
- [ ] https://www.lescalculateurs.fr/pages/notaire.html → 301 (permanent)
- [ ] Utiliser: `curl -I https://www.lescalculateurs.fr/pages/ik.html`

### Structured Data

- [ ] Valider: https://validator.schema.org/
  - Copier source HTML d'une page
  - Coller dans le validator
  - Vérifier "Valid JSON-LD" (zéro erreur)

### Google Tools

- [ ] Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Google Search Console:
  - [ ] Allez à "Coverage"
  - [ ] Vérifiez 0 erreurs "Invalid"
  - [ ] Vérifiez "Valid" augmenté
  - [ ] Allez à "Enhancements" → vérifiez schemas reconnus

## 📊 Métriques à Tracker

### Baseline (Avant)

```
Site Health:           85%
AI Search Health:      88%
Crawled Pages:         100
Healthy Pages:         1
Pages with Issues:     15
Broken Pages:          1
```

### Cibles (Après)

```
Site Health:           92%+
AI Search Health:      95%+
Crawled Pages:         100
Healthy Pages:         ~95+
Pages with Issues:     ~5
Broken Pages:          0
```

### Suivi

- [ ] Ajouter à monitoring hebdomadaire
- [ ] Configurer alertes si problèmes augmentent
- [ ] Vérifier tous les 2-3 jours premier mois

## 🐛 Troubleshooting

### Si llms.txt retourne 404

```bash
# Vérifier que le fichier existe
ls -la public/llms.txt

# Regénérer
npm run build
```

### Si redirects ne fonctionnent pas

```bash
# Vérifier .htaccess
cat public/.htaccess

# Tester
curl -I https://www.lescalculateurs.fr/pages/charges.html
# Devrait voir: HTTP/2 301 ou HTTP/1.1 301
```

### Si JSON-LD toujours invalide

```bash
# Vérifier les URLs dans les fichiers source
grep -r "\.html" src/pages/ | grep -E "@type|@context" | head -5

# Réexécuter le fix
powershell -ExecutionPolicy Bypass -File fix-html-urls.ps1
```

## 📋 Quick Reference

### Commandes Utiles

```bash
# Tester santé complète
node scripts/health-check.js

# Voir pages avec peu de contenu
node scripts/analyze-wordcount.js | grep "< 500"

# Voir pages mal liées
node scripts/analyze-internal-links.js | grep "link(s)"

# Vérifier redirects
curl -I https://www.lescalculateurs.fr/pages/charges.html

# Tester URL structure
curl https://www.lescalculateurs.fr/pages/notaire | head -20
```

### Important URLs

- Sitemap: https://www.lescalculateurs.fr/sitemap.xml
- LLMs: https://www.lescalculateurs.fr/llms.txt
- Search Console: https://search.google.com/search-console
- Rich Results: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/

## 📅 Timeline

| Date        | Action                         | Status     |
| ----------- | ------------------------------ | ---------- |
| 2025-12-27  | Corrections appliquées         | ✅ Done    |
| 2025-12-28  | Push & Deploy                  | ⏳ Pending |
| 2025-12-29  | Vérifications post-déploiement | ⏳ Pending |
| 2025-12-30+ | Google recrawl                 | ⏳ Pending |
| 2026-01-03  | Analyse résultats              | ⏳ Pending |

---

**Créé**: 27 Décembre 2025  
**Responsable**: [Your Name]  
**Status**: 🟡 EN ATTENTE DÉPLOIEMENT
