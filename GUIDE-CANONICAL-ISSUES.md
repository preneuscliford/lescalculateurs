# 🔗 Guide Complet - Problèmes Canonical (43 URLs)

**Date:** 18 décembre 2025  
**Problème:** 43 URLs "avec balise canonical correcte" ne sont pas indexées  
**Status:** ⚠️ Nécessite investigation + monitoring

---

## 📊 Problème Identifié

Google Search Console rapporte **43 URLs non indexées** avec "balise canonique correcte", mais elles ne sont pas indexées pour autant.

### Distribution:

- **38 URLs**: avec `www.lescalculateurs.fr` (format correct)
- **5 URLs**: sans `www` (apex domain)
- **7 URLs**: contiennent encore `.html` (format incorrect)
- **5 cas**: doublons www/non-www du même contenu

### Raison principale:

Ces URLs sont détectées mais Google ne les indexe pas à cause de:

1. ⛓️ Possible chaîne de redirects
2. 🔗 Contenu dupliqué (www vs apex domain)
3. 🚫 Meta robots noindex possiblement présent
4. 💾 Contenu court ou qualité insuffisante
5. ⏱️ Épuisement du crawl budget

---

## 🔍 Analyse Détaillée

### Problème 1: 7 URLs encore avec .html

```
❌ https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-54.html
❌ https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-21.html
...
```

**Solution:** ✅ **Déjà géré par vercel.json**

- Les redirects `/(.*).html → /$1` vont nettoyer ces URLs
- Google va les 301 vers la version sans `.html`

### Problème 2: 5 URLs apex domain sans www

```
⚠️ https://lescalculateurs.fr/pages/blog/departements/frais-notaire-73
⚠️ https://lescalculateurs.fr/pages/blog/departements/frais-notaire-95
⚠️ https://lescalculateurs.fr/pages/blog/departements/frais-notaire-83
⚠️ https://lescalculateurs.fr/pages/blog/frais-notaire-72
⚠️ https://lescalculateurs.fr/pages/blog/frais-notaire-971
```

**Problème:** Google a trouvé les deux versions:

- `https://lescalculateurs.fr/pages/blog/departements/frais-notaire-73`
- `https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-73`

Les deux pointent au même contenu → Google est confus

**Solution:** ✅ **Déjà géré par vercel.json**

- Redirect: `lescalculateurs.fr → www.lescalculateurs.fr` (301)
- Une seule URL canonique

### Problème 3: Doublons de contenu

5 paires trouvées:

```
• /frais-notaire-73    (www vs apex)
• /frais-notaire-95    (www vs apex)
• /frais-notaire-83    (www vs apex)
• /frais-notaire-68    (.html vs sans .html)
• /frais-notaire-90    (.html vs sans .html)
```

**Solution:** ✅ **Résolu par les deux redirects**

- Toutes les variantes pointent vers une URL unique
- Sitemap ne contient que la canonique

---

## 🛠️ Actions Recommandées

### 1. **Déploiement (IMMÉDIAT)**

```bash
git push
# Vercel re-déploie vercel.json
```

✅ Les redirects vont gérer:

- `.html → sans .html`
- `apex → www`
- `http → https`

### 2. **Vérification Sitemap (IMMÉDIAT)**

```bash
# Vérifier qu'il n'y a plus d'apex URLs
grep "lescalculateurs.fr/" public/sitemap.xml | grep -v "www"

# Vérifier qu'il n'y a plus de .html
grep "\.html" public/sitemap.xml
```

✅ Résultat attendu: zéro résultat (déjà corrigé)

### 3. **Vérifier robots.txt (COURT TERME)**

```bash
# Vérifier que /pages/blog/* n'est pas bloqué
cat public/robots.txt
```

À vérifier:

```
# ❌ MAUVAIS - bloque l'indexation
Disallow: /pages/blog

# ✅ BON - permet l'indexation
Allow: /pages/blog
```

### 4. **Vérifier Meta Robots (COURT TERME)**

Chercher dans les fichiers HTML:

```html
❌ <meta name="robots" content="noindex" /> ❌
<meta name="googlebot" content="noindex" />
```

Si trouvé, retirer ou remplacer par:

```html
✅ <meta name="robots" content="index, follow" />
```

### 5. **Vérifier Qualité Contenu (MOYEN TERME)**

Vérifier que chaque page a:

- ✅ 300-500 mots minimum
- ✅ Meta description: 155-160 caractères
- ✅ Titre H1: pertinent et unique
- ✅ Liens internes vers d'autres pages

### 6. **Monitoring (LONG TERME)**

Checker chaque semaine:

- Entrer une URL dans Google Search Console "URL Inspection"
- Demander "Test & Index" si non indexée
- Vérifier "Couverture" pour voir la progression

---

## ⏱️ Timeline Attendu

### Semaine 1: Déploiement & Crawl

```
T+0h   : Déploiement vercel.json
T+1h   : Vercel redéploie
T+24h  : Google crawle les redirects
```

### Semaine 2-3: Indexation Progressive

```
T+3-5j : Les URLs commencent à apparaître indexées
T+5-7j : 30-50% des 43 URLs indexées
T+7-14j: 80% des URLs indexées
```

### Semaine 4+: Stabilisation

```
T+2w   : Les 43 URLs devraient être indexées
T+4w   : Vérification que ça tient dans le temps
```

---

## 📋 Checklist de Vérification

- [ ] **Déploiement**

  - [ ] `git push` exécuté
  - [ ] Vercel re-déploiement terminé
  - [ ] Sitemap accessible: https://www.lescalculateurs.fr/sitemap.xml

- [ ] **Validation**

  - [ ] Pas d'apex URLs dans sitemap
  - [ ] Pas de .html dans sitemap
  - [ ] Redirects .html → sans .html fonctionnent
  - [ ] Redirects apex → www fonctionnent

- [ ] **Investigation**

  - [ ] robots.txt permet /pages/blog
  - [ ] Aucun meta robots="noindex" trouvé
  - [ ] Contenu suffisamment long (300+ mots)

- [ ] **Monitoring**
  - [ ] Jour 3: Vérifier GSC pour indexation progressive
  - [ ] Jour 7: Vérifier progression
  - [ ] Jour 14: Vérifier 80%+ indexées
  - [ ] Jour 28: Vérifier stabilisation

---

## 🆘 Troubleshooting

### Les URLs restent non indexées après 2 semaines?

**Checklist:**

1. Vérifier que les redirects 301 fonctionnent

   ```bash
   curl -I https://lescalculateurs.fr/pages/blog/frais-notaire-72
   # Doit retourner 301 vers https://www.lescalculateurs.fr/pages/blog/frais-notaire-72
   ```

2. Vérifier robots.txt dans GSC:

   - GSC → "Paramètres" → "Fichier robots.txt"
   - Vérifier qu'il n'y a pas de "Blocked"

3. Forcer re-crawl dans GSC:

   - "URL Inspection" → entrer URL
   - Cliquer "Demander l'indexation"

4. Vérifier la qualité du contenu:
   - Lire le contenu de la page
   - Vérifier qu'il y a au minimum 300-500 mots

### Meta robots noindex trouvé?

**Retirer:**

```html
<!-- AVANT -->
<meta name="robots" content="noindex" />

<!-- APRÈS -->
<meta name="robots" content="index, follow" />
```

### Toujours des redirections en chaîne?

**Vérifier:**

```bash
curl -L -v https://lescalculateurs.fr/pages/blog/frais-notaire-72
# Ne doit avoir QU'UN redirect 301
# Ne pas avoir de 301 → 301 → 301 (chaîne)
```

---

## ✨ Succès Si

Après 2 semaines:

```
✅ 80%+ des 43 URLs sont indexées
✅ Plus de warning "Canonical issue"
✅ Plus de warning "Duplicate content"
✅ GSC "Couverture" → taux monte
✅ Pas de nouvelle URLs non indexées
```

---

## 📚 Références

- [GUIDE-INDEXATION-GOOGLE.md](GUIDE-INDEXATION-GOOGLE.md) - Problème des 94 URLs .html
- [CORRECTION-INDEXATION-SUMMARY.md](CORRECTION-INDEXATION-SUMMARY.md) - Résumé général
- [DEPLOYMENT-INSTRUCTIONS.md](DEPLOYMENT-INSTRUCTIONS.md) - Instructions de déploiement
- `scripts/canonical-issue-urls.json` - Données brutes
- `scripts/analyze-canonical-issue.cjs` - Script d'analyse

---

**Created:** 18 décembre 2025  
**Status:** ⚠️ Requires monitoring  
**Next Step:** Deploy & monitor GSC for 2 weeks
