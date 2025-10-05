---
applyTo: "**/*.js"
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# LESCALCULATEURS.FR - Instructions Complètes

## 🎯 ÉTAT ACTUEL DU PROJET (Octobre 2025)

**Projet déployé et fonctionnel :** https://lescalculateurs.fr  
**Repository :** https://github.com/preneuscliford/lescalculateurs  
**Status :** ✅ En production avec 10 calculateurs opérationnels

## 🧮 CALCULATEURS DISPONIBLES (10 outils)

### **Calculateurs Principaux (8)**

1. **Simulateur frais de notaire 2025** (`notaire.html`) - ⭐ Principal
2. **Simulateur prêt immobilier** (`pret.html`) - ⭐ Principal
3. **Calculateur plus-value immobilière** (`plusvalue.html`) - ⭐ Principal
4. **Calculateur charges copropriété** (`charges.html`) - ⭐ Principal
5. **Calculateur indemnités kilométriques 2025** (`ik.html`)
6. **Calculateur ponts/jours fériés 2025-2026** (`ponts.html`)
7. **Simulateur taxe foncière 2025** (`taxe.html`)
8. **Calculateur durée légale travail & heures sup** (`travail.html`)

### **Calculateurs Avancés (2)**

9. **💳 Calculateur financement personnel** (`financement.html`) - 🆕 Nouveau !

   - Voiture, travaux, équipements
   - Analyse capacité d'emprunt, ratio d'endettement, viabilité
   - Paramètres revenus/charges complète

10. **🚀 Calculateur plus-value crypto & bourse** (`crypto-bourse.html`) - 🆕 Nouveau !
    - Bitcoin, Ethereum, actions CAC 40, ETF
    - Fiscalité FR 2025 : flat tax 30%, abattements durée détention
    - Support crypto + actions avec calculs d'impôts précis

## 🛠️ STACK TECHNIQUE CONFIRMÉE

**Framework & Build :**

- ✅ Vite v5.4.20 (vanilla-TS)
- ✅ Tailwind CSS 3
- ✅ TypeScript (strict=false)
- ✅ Build statique : `vite build` → `dist/`

**Données & Backend :**

- ✅ **Données barèmes dans `src/data/baremes.json`**
- ✅ Import build-time : `import * as B from '../data/baremes.json'`
- ✅ 0 fetch réseau côté client
- ✅ 0 backend, 0 API

**Hébergement & Deploy :**

- ✅ Vercel (repo GitHub → auto-deploy)
- ✅ `git push main` → déploiement automatique
- ✅ URLs propres configurées dans `vercel.json`

## 💰 MONÉTISATION ACTIVE

**Google AdSense :**

- ✅ Publisher ID : `ca-pub-2209781252231399`
- ✅ 2 blocs par page (in-feed + in-article)
- ✅ Script chargé uniquement en production
- ✅ `ads.txt` configuré et accessible
- ✅ Robots.txt optimisé pour crawlers AdSense

**Analytics :**

- ✅ Google Analytics : `G-2HNTGCYQ1X`
- ✅ Google Tag Manager : `GTM-TPFZCGX5`

## 📁 STRUCTURE FINALE

```
/src
  /pages
    notaire.html          ⭐ Principal (frais notaire)
    pret.html            ⭐ Principal (prêt immobilier)
    plusvalue.html       ⭐ Principal (plus-value immo)
    charges.html         ⭐ Principal (charges copro)
    ik.html              (indemnités kilométriques)
    ponts.html           (jours fériés)
    taxe.html            (taxe foncière)
    travail.html         (durée légale travail)
    financement.html     🆕 (financement personnel)
    crypto-bourse.html   🆕 (plus-value crypto & bourse)
  /components
    CalculatorFrame.ts   (composant réutilisable)
  /data
    baremes.json         (tous les barèmes officiels)
  main.ts               (routing/navigation)
  index.html            (page d'accueil avec 10 calculateurs)
  style.css             (Tailwind CSS)
/public
  sitemap.xml           ✅ 10 pages indexées
  robots.txt            ✅ Optimisé AdSense
  ads.txt               ✅ Google AdSense validé
  /assets              (favicons, logos, manifests)
vite.config.ts         ✅ 10 pages configurées
vercel.json            ✅ Routing 10 pages
package.json           ✅ Dépendances minimales
```

## 🎨 DESIGN SYSTEM

**Interface :**

- ✅ Responsive mobile-first Tailwind
- ✅ Design cohérent avec thèmes couleur par calculateur
- ✅ Animations et transitions fluides
- ✅ 0 lib externe, bundle < 80 kB gzip

**UX :**

- ✅ Validation temps réel des formulaires
- ✅ Résultats détaillés avec explications
- ✅ FAQ Schema.org (5 Q/R) sur chaque page
- ✅ Navigation intuitive entre calculateurs

## 📊 SEO & PERFORMANCE

**SEO :**

- ✅ Meta tags optimisés par calculateur
- ✅ URLs canoniques configurées
- ✅ Open Graph + Twitter Cards
- ✅ Sitemap.xml à jour (10 pages)
- ✅ Schema.org FAQ sur toutes les pages

**Performance :**

- ✅ Build Vite optimisé (1.8s)
- ✅ Code splitting automatique
- ✅ Assets compressés gzip
- ✅ Lazy loading des composants

## 🔧 DÉVELOPPEMENT

**Commandes clés :**

```bash
npm run dev          # Développement local
npm run build        # Build production
npm run preview      # Preview du build
git push origin main # Déploiement auto Vercel
```

**Ajout d'un nouveau calculateur :**

1. Créer `src/pages/nouveau-calculateur.html`
2. Ajouter dans `vite.config.ts` → `rollupOptions.input`
3. Ajouter route dans `vercel.json`
4. Ajouter lien dans `src/index.html`
5. Mettre à jour `public/sitemap.xml`
6. Build + commit + push

## 🎯 RÈGLES DE DÉVELOPPEMENT

**Architecture :**

- ✅ Chaque calculateur = page HTML standalone
- ✅ JavaScript inline pour éviter les dépendances
- ✅ Utilisation de `CalculatorFrame.ts` si besoin générique
- ✅ Import des barèmes : `import * as B from '../data/baremes.json'`

**UX/UI :**

- ✅ Intro SEO 250 mots minimum par page
- ✅ FAQ Schema.org obligatoire (5 Q/R)
- ✅ Validation formulaires temps réel
- ✅ Résultats détaillés avec calculs explicites
- ✅ Messages d'erreur utilisateur-friendly

**Performance :**

- ✅ Bundle total < 80 kB gzip
- ✅ 0 fetch réseau côté client
- ✅ Images optimisées (favicon, manifests)
- ✅ CSS Tailwind purgé automatiquement

## 🚀 PROCHAINES ÉTAPES POSSIBLES

**Nouveaux calculateurs demandés :**

- Simulateur succession/donation
- Calculateur TVA auto-entrepreneur
- Simulateur retraite complémentaire
- Calculateur frais de garde d'enfants

**Améliorations techniques :**

- PWA avec service worker
- Mode sombre automatique
- Export PDF des résultats
- Sauvegarde locale des calculs

---

## 🎯 ROADMAP V4 - FONCTIONNALITÉS AVANCÉES

### 📋 Instructions pour implémentation V4

**Expert développement web (JavaScript/Vite) requis pour implémenter :**

#### 1. **🗎 Export PDF**

- Bouton génération PDF des résultats de calcul
- Librairie 100% côté client : `jsPDF` ou `pdf-lib`
- Contenu PDF :
  - Résultats du calcul formatés
  - Texte explicatif complet
  - Watermark français : "Réalisé avec lescalculateurs.fr"
- Code React/Vite prêt à l'usage requis

#### 2. **📊 Export CSV**

- Téléchargement résultats format CSV
- Chaque ligne = une donnée de calcul
- Génération côté client : Blob → download
- Code React/Vite prêt à l'usage requis

#### 3. **🔗 Partage de lien (calcul prérempli)**

- URL avec query params automatique (ex: `?prix=120000&duree=20`)
- Auto-remplissage formulaire depuis URL
- Fonctionnement 100% côté client, sans serveur
- Code React/Vite prêt à l'usage requis

#### 4. **📷 Import automatique (OCR magique)**

- Bouton "Importer depuis une photo"
- `Tesseract.js` pour OCR côté client
- Détection automatique montants/données depuis photos
- Injection auto dans champs formulaire
- Pas de stockage, tout navigateur
- Code React/Vite prêt à l'usage requis

#### ⚡ **Contraintes V4 :**

- ❌ Pas de backend, tout côté client
- ❌ Pas de base de données
- ✅ Code clair, modulaire, réutilisable
- ✅ Snippets concrets adaptés Vite + React
- ✅ Compatible avec structure statique existante

#### 📦 **Dépendances supplémentaires V4 :**

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "tesseract.js": "^5.0.4"
  }
}
```

---

⚠️ **IMPORTANT :** Ce projet est 100% statique, sans backend. Toutes les données sont embarquées dans le bundle au build-time. Respecter cette contrainte pour tous les développements futurs.

---

## 📝 HISTORIQUE DES VERSIONS

**V1 (Original) :** 5 calculateurs de base  
**V2 (Expansion) :** 8 calculateurs + monétisation  
**V3 (Actuel) :** 10 calculateurs + financement + crypto/bourse  
**V4 (Planifié) :** Export PDF/CSV + Partage liens + OCR automatique

**Dernière mise à jour :** Octobre 2025
