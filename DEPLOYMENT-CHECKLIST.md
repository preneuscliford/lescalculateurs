# 📋 ACTION CHECKLIST - Déploiement et Monitoring

**Date:** 18 décembre 2025  
**Dernière mise à jour:** 18/12/2025  
**Status:** ✅ Prêt pour déploiement

---

## 🚀 PHASE 1: DÉPLOIEMENT IMMÉDIAT (Maintenant - 10 min)

### Étape 1: Git Push

- [ ] Ouvrir terminal dans: `c:\Users\prene\OneDrive\Bureau\lesCalculateurs`
- [ ] Exécuter:

  ```bash
  git status
  # Vérifier que vercel.json et public/sitemap.xml sont modifiés

  git add vercel.json public/sitemap.xml
  git commit -m "fix: Google Search Console - clean redirects (94+43 URLs)"
  git push
  ```

- [ ] Vérifier que push est successful (no errors)

### Étape 2: Vérifier Déploiement Vercel

- [ ] Aller sur https://vercel.com/dashboard
- [ ] Attendre que le déploiement soit "Ready" (green checkmark)
- [ ] Vérifier timestamp du déploiement
- [ ] **Temps estimé: 1-3 minutes**

### Étape 3: Tester les Redirects

```bash
# Test 1: Redirect .html
curl -I https://www.lescalculateurs.fr/pages/notaire.html
# ✓ Doit retourner HTTP/2 301
# ✓ Location: https://www.lescalculateurs.fr/pages/notaire

# Test 2: Redirect apex domain
curl -I https://lescalculateurs.fr/pages/blog.html
# ✓ Doit retourner HTTP/2 301
# ✓ Location: https://www.lescalculateurs.fr/pages/blog

# Test 3: Redirect HTTP
curl -I http://lescalculateurs.fr/
# ✓ Doit retourner HTTP/2 301
# ✓ Location: https://www.lescalculateurs.fr/
```

- [ ] Test 1 passed
- [ ] Test 2 passed
- [ ] Test 3 passed

### Étape 4: Vérifier Sitemap

```bash
curl https://www.lescalculateurs.fr/sitemap.xml | head -50
# Vérifier qu'on voit du XML valide
```

- [ ] Sitemap accessible et valide

---

## ⏳ PHASE 2: MONITORING COURT TERME (Jour 1-3)

### Jour 1: Observation

- [ ] **Matin:** Vérifier que le déploiement est toujours live
- [ ] **Midi:** Vérifier Google Search Console (ne devrait rien montrer encore)
- [ ] **Soir:** Vérifier que pas de nouvelles erreurs

### Jour 2: Google Crawl

- [ ] **Matin:** Vérifier Google Search Console "Demandes d'exploration"
- [ ] **Vérifier:** Que Google a crawlé les redirects
- [ ] **Note:** Si rien dans GSC, c'est normal (peut prendre 24h)

### Jour 3: Premier Crawl Complet

- [ ] **Matin:** Vérifier Google Search Console
- [ ] **Vérifier "Couverture":**
  - [ ] Nombre de "Redirects" (devrait commencer à diminuer)
  - [ ] Nombre de "Non indexed" (devrait rester stable pour l'instant)
- [ ] **Note:** Les changements majeurs prennent 3-5 jours

---

## 📊 PHASE 3: MONITORING COURT TERME (Semaine 1)

### Chaque jour cette semaine:

#### Daily Checks (5 min):

- [ ] **Jour 4:** Vérifier GSC "Couverture"
- [ ] **Jour 5:** Vérifier GSC "Couverture"
- [ ] **Jour 6:** Vérifier GSC "Couverture"
- [ ] **Jour 7:** Vérifier GSC "Couverture"

#### Vérifier en particulier:

- [ ] Nombre de "Redirect" URLs (doit diminuer)
- [ ] Nombre de "Indexed" URLs (doit augmenter)
- [ ] Aucune nouvelle erreur

#### Signaux d'alerte:

- [ ] Pas de changement après 48h → investigate
- [ ] Nouvelles erreurs 404 → problème potentiel
- [ ] Erreurs 500 → problème Vercel

---

## 📈 PHASE 4: MONITORING MOYEN TERME (Semaine 2-3)

### Checklist Hebdomadaire:

#### Semaine 2:

- [ ] Vérifier GSC "Couverture":
  - [ ] 90 URLs devraient être indexées (des 94)
  - [ ] Quelques des 43 devraient être en cours
- [ ] Vérifier que pas de régression
- [ ] Vérifier trafic organique (ne doit pas diminuer)

#### Semaine 3:

- [ ] Vérifier GSC "Couverture":
  - [ ] 94 URLs devraient être indexées
  - [ ] 50% des 43 devraient être en cours
- [ ] Documenter les progrès
- [ ] Planifier les vérifications pour les 43 URLs

---

## 🔍 PHASE 5: INVESTIGATIONS COMPLÉMENTAIRES (Si besoin)

### Investigation 1: Vérifier robots.txt

```bash
cat public/robots.txt
# Chercher:
# ✓ Disallow: /pages/blog/ ABSENT (doit être autorisé)
```

- [ ] robots.txt autorise /pages/blog

### Investigation 2: Chercher meta robots noindex

```bash
# Chercher dans les fichiers HTML:
grep -r "robots" src/ | grep -i "noindex"
# Ne doit rien retourner
```

- [ ] Aucun meta robots="noindex" trouvé

### Investigation 3: Vérifier longueur contenu

- [ ] Vérifier 3 pages aléatoires:
  - [ ] Page 1: minimum 300 mots?
  - [ ] Page 2: minimum 300 mots?
  - [ ] Page 3: minimum 300 mots?

### Investigation 4: Tester URL dans Google

```bash
# Tester dans Google Search Console:
1. Aller à "URL Inspection"
2. Entrer: https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-43
3. Cliquer "Test the live URL"
4. Cliquer "Request indexing"
```

- [ ] Teste effectué pour 5 URLs problématiques

---

## ✅ PHASE 6: VALIDATION (Semaine 4)

### Succès Attendu:

- [ ] 94 URLs passées de "Redirect" → "Indexed"
- [ ] 80%+ des 43 URLs passées à "Indexed"
- [ ] Aucun "Duplicate content" warnings
- [ ] Aucun "Canonical issue" warnings
- [ ] Taux d'indexation normal
- [ ] Trafic organique stable

### Si tout OK:

- [ ] Archiver ce guide
- [ ] Documenter les résultats finaux
- [ ] Retourner au monitoring normal

### Si problèmes persistants:

- [ ] Aller à "Troubleshooting" (voir GUIDE-CANONICAL-ISSUES.md)
- [ ] Contacter support Vercel si redirects ne fonctionnent pas
- [ ] Revoir content quality si toujours non indexé

---

## 🆘 SIGNAUX D'ALERTE

### ⛔ Problème: URLs toujours "Redirect" après 7 jours

**Cause possible:**

- Redirects ne fonctionnent pas
- Google n'a pas encore crawlé

**Action:**

1. Vérifier redirects: `curl -I https://www.lescalculateurs.fr/pages/notaire.html`
2. Si pas de redirect, vérifier Vercel déploiement
3. Si redirect OK, forcer re-crawl dans GSC

### ⛔ Problème: Nouvelles erreurs 404

**Cause possible:**

- Redirection mal configurée
- URL existante cassée

**Action:**

1. Vérifier l'URL retournée par la redirection
2. Vérifier que la destination existe
3. Vérifier logs Vercel

### ⛔ Problème: Trafic organique qui diminue

**Cause possible:**

- URLs supprimées du index au lieu d'être mises à jour
- Redirects ne fonctionnent pas
- Contenu inaccessible

**Action:**

1. Vérifier les redirects fonctionnent
2. Vérifier que URLs de destination sont accessibles
3. Attendre 48h (peut être cache)

---

## 📞 RESSOURCES UTILES

### Documentation:

- [INDEXATION-ISSUES-COMPLETE-SUMMARY.md](INDEXATION-ISSUES-COMPLETE-SUMMARY.md)
- [GUIDE-INDEXATION-GOOGLE.md](GUIDE-INDEXATION-GOOGLE.md)
- [GUIDE-CANONICAL-ISSUES.md](GUIDE-CANONICAL-ISSUES.md)
- [DEPLOYMENT-INSTRUCTIONS.md](DEPLOYMENT-INSTRUCTIONS.md)

### Données Brutes:

- `scripts/google-indexing-redirects.json` (94 URLs)
- `scripts/canonical-issue-urls.json` (43 URLs)

### Liens Importants:

- Google Search Console: https://search.google.com/search-console
- Vercel Dashboard: https://vercel.com/dashboard
- Sitemap: https://www.lescalculateurs.fr/sitemap.xml

---

## 📅 CALENDRIER

```
18/12/2025 (Aujourd'hui)
├─ ✅ Analyse complète effectuée
├─ ✅ Solutions implémentées
├─ ⏳ Déploiement requis (git push)
│
19/12/2025 (J+1)
├─ Vérifier déploiement Vercel
├─ Tester redirects
└─ Vérifier sitemap

20/12/2025 (J+2)
├─ Vérifier GSC "Demandes d'exploration"
└─ Monitoring commence

21/12/2025 (J+3)
├─ Vérifier GSC "Couverture"
├─ Première analyse des changements
└─ Notes de progress

22-25/12/2025 (J+4-7)
├─ Monitoring quotidien GSC
├─ Vérifier progression
└─ Investigations si nécessaire

26/12/2025 (J+8) - Semaine 2
├─ Vérifier 90+ URLs indexées
├─ Vérifier 43 URLs en progression
└─ Documenter résultats

02/01/2026 (J+15) - Semaine 3
├─ Vérifier 100% des 94 URLs indexées
├─ Vérifier 50% des 43 URLs indexées
└─ Valider succès

09/01/2026 (J+22) - Semaine 4
├─ Validation finale
├─ Documenter résultats
└─ ✅ COMPLET - Retour au normal
```

---

## 🎯 OBJECTIFS

### Court Terme (7 jours):

- [ ] ✅ Déploiement successful
- [ ] ✅ Redirects fonctionnent
- [ ] ✅ Pas d'erreurs 404/500

### Moyen Terme (14 jours):

- [ ] ✅ 90%+ des 94 URLs indexées
- [ ] ✅ 50%+ des 43 URLs indexées
- [ ] ✅ Aucun warning d'indexation

### Long Terme (30 jours):

- [ ] ✅ 100% des 94 URLs indexées
- [ ] ✅ 80%+ des 43 URLs indexées
- [ ] ✅ Taux d'indexation normal
- [ ] ✅ Trafic organique remonte

---

**Prochaine étape:** 👉 **git push**

Status: ✅ **PRÊT POUR DÉPLOIEMENT**
