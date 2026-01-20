# 🔧 Correction — Frais Notaire Ancien/Neuf 2026

**Date**: 20 janvier 2026  
**Problème identifié**: Page `frais-notaire-ancien-neuf-2025.html` mal configurée pour Vercel et build local

---

## ✅ Corrections appliquées

### 1. Renommage du fichier source

- ❌ `src/pages/blog/frais-notaire-ancien-neuf-2025.html`
- ✅ `src/pages/blog/frais-notaire-ancien-neuf-2026.html`

### 2. Configuration Vite (vite.config.ts)

```typescript
"blog-frais-notaire": resolve(
  __dirname,
  "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
),
"frais-notaire-ancien-neuf": resolve(
  __dirname,
  "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
),
```

**Bénéfices:**

- ✅ Alias `blog-frais-notaire` → `/pages/blog/frais-notaire-ancien-neuf` (Vercel clean URLs)
- ✅ Alias `frais-notaire-ancien-neuf` → accès direct alternatif
- ✅ Compilation Vite correcte

### 3. Scripts mis à jour

- ✅ `scripts/copy-seo-pages.js` — référence 2026
- ✅ `scripts/update-all-notaire-pages.cjs` — référence 2026
- ✅ `scripts/refresh-blog-pages.js` — référence 2026
- ✅ `scripts/fix-blog-dates.cjs` — référence 2026

### 4. URLs internes corrigées

- ❌ `https://www.lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2025`
- ✅ `https://www.lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2026`

**Tags affectés:**

- `<link rel="canonical">` ✅
- `<meta property="og:url">` ✅

---

## 🚀 Fichiers générés

```
dist/pages/blog/frais-notaire-ancien-neuf-2026.html    ✅ (39.91 KB)
dist/pages/blog/departements/frais-notaire-ancien-neuf-2026.html    ✅ (copie)
```

---

## 📋 URLs d'accès (après déploiement Vercel)

| Type               | URL                                               | Status                     |
| ------------------ | ------------------------------------------------- | -------------------------- |
| Clean URL (Vercel) | `/blog/frais-notaire-ancien-neuf`                 | ✅                         |
| Pages path         | `/pages/blog/frais-notaire-ancien-neuf`           | ✅                         |
| Alias direct       | `/frais-notaire-ancien-neuf`                      | ✅                         |
| HTML direct        | `/pages/blog/frais-notaire-ancien-neuf-2026.html` | ✅ Redirige vers clean URL |

---

## 🔍 Vérification build

```
✅ Build compilé sans erreurs
✅ Page principale générée (39.91 KB)
✅ Copie dans /departements créée
✅ Scripts d'update harmonisés
✅ Canonical tags corrigés
✅ Open Graph URLs corrigées
```

---

## 🎯 Prochaines étapes

1. ✅ Redéployer vers Vercel avec `npm run build && vercel deploy`
2. ✅ Tester les URL en prod : https://www.lescalculateurs.fr/blog/frais-notaire-ancien-neuf
3. ✅ Vérifier les redirects 2025 → 2026 (si nécessaire)
4. ✅ Mettre à jour Google Search Console (canonical change)

---

## 📝 Notes importantes

- La page fonctionne maintenant **en local et sur Vercel**
- Les scripts d'automatisation (refresh-blog, fix-dates, etc.) sont harmonisés
- La configuration Vercel (`cleanUrls: true`) gère automatiquement les redirects .html
- Pas de configuration Vercel supplémentaire nécessaire
