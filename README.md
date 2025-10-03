# LesCalculateurs.fr 🧮

**Calculateurs financiers gratuits 2025** - Site statique optimisé SEO

## 🚀 Démo Live

- **Production** : https://lescalculateurs.fr
- **Local** : `npm run dev` → http://localhost:5173/

## 🧮 Calculateurs Disponibles

1. **Frais de notaire 2025** - Simulation achat immobilier
2. **Indemnités kilométriques 2024** - Barème fiscal officiel (⚠️ 2025 non publié)
3. **Ponts & jours fériés 2025-2026** - Optimisation congés
4. **Simulateur taxe foncière 2025** - Estimation charges (⚠️ Très variable par commune)
5. **Durée légale du travail** - Heures sup & majorations

## � Stack Technique

- **Vite** 5.4 (vanilla TypeScript)
- **Tailwind CSS** 3 (responsive mobile-first)
- **TypeScript** (strict=false)
- **Build statique** : 0 dépendance runtime
- **Bundle** : < 80 kB gzip
- **Données** : Embarquées dans le bundle (baremes.json)

## 📁 Structure

```
src/
├── pages/           # Pages des calculateurs
├── components/      # Composant CalculatorFrame réutilisable
├── data/           # baremes.json (toutes les données)
├── main.ts         # Point d'entrée
├── tailwind.css    # Styles
└── index.html      # Page d'accueil
```

## 🚀 Installation et développement

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview
npm run preview
```

## 📊 Sources des Données

- **Frais de notaire** : Décret 2024-xxx (estimations 2025)
- **Indemnités kilométriques** : Barème 2024 (BOFiP) ⚠️
- **Jours fériés** : Code du travail français
- **Taxe foncière** : Moyennes nationales 2024 ⚠️
- **Durée du travail** : Code du travail (35h, majorations)

## ⚠️ Avertissements Importants

### Données 2024 utilisées (2025 non disponibles)

- **Indemnités kilométriques** : Utilise le barème 2024, le barème 2025 n'est pas encore publié

### Taux très variables selon la commune

- **Taxe foncière** : Les taux varient énormément d'une commune à l'autre. Consultez votre avis d'imposition.

### Estimations

- **Frais de notaire** : Estimations basées sur les barèmes. Consultez un notaire pour un calcul précis.

## 🎯 SEO et Performance

- Pages optimisées SEO (meta, descriptions)
- FAQ Schema.org sur chaque calculateur
- Responsive design mobile-first
- Bundle optimisé < 80 kB
- 0 appel réseau côté client

## � Monétisation

- Slots Adsense prêts (production uniquement)
- Blocs in-feed et in-article
- Script chargé conditionnellement

## 🔧 Déploiement Vercel

1. Connecter le repo GitHub à Vercel
2. Configuration automatique détectée
3. Build command : `npm run build`
4. Output directory : `dist`
5. Le fichier `vercel.json` gère le routing

## � Licence

MIT - Libre d'utilisation et modification.

---

_Mise à jour : Octobre 2024_
_Données officielles 2024, estimations 2025 quand applicable_ 2. Connecter le repo à Vercel 3. Déploiement automatique sur chaque commit

## 📄 Licence

MIT - Projet open source
