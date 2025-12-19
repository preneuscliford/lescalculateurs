# 🔧 INSTRUCTION EXACTE - Comment Corriger les Canonicals

**Temps estimé:** 15 minutes  
**Fichiers à modifier:** 118  
**Outil:** VS Code Find & Replace

---

## 📋 PRÉ-REQUIS

- VS Code ouvert avec le dossier `c:\Users\prene\OneDrive\Bureau\lesCalculateurs`
- Aucun fichier verrouillé
- Git ready (pour commit après)

---

## 🔍 ÉTAPE 1: Ouvrir Find & Replace

**Raccourci:**

```
Ctrl + H
```

Ou: Menu → Edit → Find and Replace

---

## ✏️ ÉTAPE 2: Faire les 4 replacements

### Replacement 1: /blog/departements/ → /pages/blog/departements/

**Find:**

```
https://www.lescalculateurs.fr/blog/departements/
```

**Replace:**

```
https://www.lescalculateurs.fr/pages/blog/departements/
```

**Files affected:** ~94

**Steps:**

1. Copier le "Find" text dans la boîte Find
2. Copier le "Replace" text dans la boîte Replace
3. Cliquer "Replace All" (icône avec 2 flèches)
4. Vérifier: `Replaced XX occurrences`

✅ **Cliquez "Replace All"**

---

### Replacement 2: /blog/ → /pages/blog/

**Find:**

```
https://www.lescalculateurs.fr/blog/
```

**Replace:**

```
https://www.lescalculateurs.fr/pages/blog/
```

**Files affected:** ~11 (ceux qui restent après Replace 1)

**Steps:**

1. Effacer le texte précédent du Find
2. Copier le nouveau "Find" text
3. Copier le nouveau "Replace" text
4. Cliquer "Replace All"
5. Vérifier: `Replaced XX occurrences` (probablement ~11)

⚠️ **Important:** Ne pas faire ce replacement avant le premier (sinon /blog/departements/ serait affecté incorrectement)

✅ **Cliquez "Replace All"**

---

### Replacement 3: apex domain → www

**Find:**

```
href="https://lescalculateurs.fr/
```

**Replace:**

```
href="https://www.lescalculateurs.fr/
```

**Files affected:** ~12

**Steps:**

1. Effacer le texte précédent
2. Copier le nouveau "Find" text (attention: start with href=")
3. Copier le nouveau "Replace" text
4. Cliquer "Replace All"
5. Vérifier: `Replaced XX occurrences`

✅ **Cliquez "Replace All"**

---

### Replacement 4: Supprimer .html des canonicals

**Find:**

```
canonical" href="https://www.lescalculateurs.fr(.+?)\.html" />
```

**Note:** Utiliser regex (cliquer le bouton `.*` pour activer regex mode)

**Replace:**

```
canonical" href="https://www.lescalculateurs.fr$1" />
```

**Files affected:** ~1

**Alternative (si regex compliqué):** Find simple:

```
.html" />
```

Et remplacer par:

```
" />
```

Mais faire attention aux autres .html (juste dans canonicals!)

**Steps:**

1. Cliquer le bouton `.*` (en bas du Find box) pour activer REGEX mode
2. Copier le regex Find
3. Copier le regex Replace
4. Cliquer "Replace All"
5. Vérifier: `Replaced XX occurrences`

✅ **Cliquez "Replace All"**

---

## ✔️ ÉTAPE 3: Vérification Post-Replacement

Après chaque replacement, vérifier le résultat:

### Vérification 1: Pas de `/blog/departements/` sans `/pages/`

```
Find: https://www.lescalculateurs.fr/blog/departements/
```

**Résultat attendu:** 0 matches

### Vérification 2: Pas de `/blog/` sans `/pages/`

```
Find: https://www.lescalculateurs.fr/blog/
```

**Résultat attendu:** 0 matches

### Vérification 3: Pas d'apex domain

```
Find: href="https://lescalculateurs.fr/
```

**Résultat attendu:** 0 matches

### Vérification 4: Pas de .html dans canonical

```
Find: canonical" href="https://www.lescalculateurs.fr(.+?)\.html" />
```

(avec regex mode)

**Résultat attendu:** 0 matches

---

## 📊 RÉSULTAT ATTENDU APRÈS REPLACEMENTS

Tous les canonicals doivent être au format:

```html
<link rel="canonical" href="https://www.lescalculateurs.fr/pages/..." />
```

Où `...` peut être:

- `/blog/departements/frais-notaire-01`
- `/pages/charges`
- `/blog/frais-notaire-ancien-neuf-2025`
- etc.

**Format standard:**

- ✅ TOUJOURS `https://www.lescalculateurs.fr`
- ✅ TOUJOURS `/pages/` (pas `/blog/` seul)
- ✅ JAMAIS `.html`

---

## 💾 ÉTAPE 4: Commit et Push

Après vérification, committer les changements:

```bash
git status
# Doit montrer les fichiers HTML modifiés

git add src/pages/
# Ou: git add src/ (tout)

git commit -m "fix: Standardize all canonical URLs to match actual URL paths

- Replace /blog/ with /pages/blog/ (105 URLs)
- Standardize to www domain (12 URLs)
- Remove .html from canonicals (11 URLs)
- This resolves canonical issues blocking 43 URLs from indexation"

git push
```

**Vercel va:**

1. Re-builder le site
2. Déployer les changements
3. Servir les pages avec canonicals corrects

---

## ⏱️ TIMELINE APRÈS DÉPLOIEMENT

```
T+0h   : Déploiement vercel.json (d'avant)
T+1h   : Vercel construit et déploie les nouveaux HTML
T+24h  : Google crawle les canonicals corrects
T+48h  : Google analyse les URLs avec canonicals
T+3-7j : Les 43 URLs commencent à s'indexer
T+14j  : Stabilisation attendue
```

---

## 🚨 ATTENTION - Erreurs à Éviter

### ❌ Ne PAS faire de Find & Replace global

```
❌ MAUVAIS: Remplacer TOUS les /blog/ → /pages/blog/
  Cela affecterait aussi les chemins de fichiers, images, etc.
```

### ✅ BON: Utiliser du contexte

```
✅ BON: Remplacer href="https://www.lescalculateurs.fr/blog/
  Cela affecte JUSTE les canonicals (qui ont href=")
```

### ❌ Ne pas oublier de Replace 2

```
❌ Si vous faites juste Replace 1 et 3
  Vous allez laisser des /blog/ seuls
```

### ✅ Toujours faire les 4 dans cet ordre

```
✅ Ordre:
1. /blog/departements/ → /pages/blog/departements/
2. /blog/ → /pages/blog/
3. apex → www
4. .html removal
```

---

## 🔍 VÉRIFICATION FINALE (Terminal)

Après le push, vérifier que le déploiement fonctionne:

```bash
# Vérifier l'URL du site
curl -I https://www.lescalculateurs.fr/pages/blog/frais-notaire-01
# Résultat attendu: HTTP/2 200

# Vérifier la canonical dans le HTML
curl https://www.lescalculateurs.fr/pages/blog/frais-notaire-01 | grep canonical
# Résultat attendu: <link rel="canonical" href="https://www.lescalculateurs.fr/pages/blog/frais-notaire-01" />
```

---

## 📞 SI QUELQUE CHOSE VA MAL

### Problème: "Replace All" remplace trop de choses

**Solution:** Annuler (Ctrl+Z) et être plus spécifique avec le Find text

### Problème: Les replacements ne fonctionnent pas

**Solution:**

- Vérifier que le texte Find est EXACTEMENT correct (copier d'un fichier)
- Vérifier qu'il n'y a pas d'espace supplémentaire
- Vérifier que regex mode est activé si utilisant regex

### Problème: Besoin d'annuler tous les changements

**Solution:**

```bash
git checkout src/
# Annule tous les changements
```

---

## ✨ SUCCÈS SI

Après 2-3 semaines:

- [ ] Google crawle les canonicals corrects (vérifier dans GSC)
- [ ] Les 43 URLs commencent à s'indexer
- [ ] Plus de "Canonical issue" warnings dans GSC
- [ ] Taux d'indexation monte
- [ ] Plus de chaînes de redirects invisibles

---

## 📋 CHECKLIST FINALE

- [ ] Ouvrir VS Code avec Find & Replace (Ctrl+H)
- [ ] Faire Replacement 1 (/blog/departements/)
- [ ] Vérifier: 0 matches restants
- [ ] Faire Replacement 2 (/blog/)
- [ ] Vérifier: 0 matches restants
- [ ] Faire Replacement 3 (apex domain)
- [ ] Vérifier: 0 matches restants
- [ ] Faire Replacement 4 (.html)
- [ ] Vérifier: 0 matches restants
- [ ] Git commit et push
- [ ] Attendre déploiement Vercel (1-3 min)
- [ ] Vérifier les URLs avec curl
- [ ] ✅ Terminé!

---

**Temps total:** ~15 minutes pour replacements + vérification + deployment

**Impact:** Résout le problème de 43 URLs non indexées

**Prochaines étapes:** Monitoring Google Search Console pendant 2-3 semaines
