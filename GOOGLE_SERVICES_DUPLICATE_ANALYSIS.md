# Google Services & Duplicate Content Analysis
**Date:** February 6, 2026  
**Status:** Complete Analysis

---

## 📊 Executive Summary

- **Total pages in pages_YMYL_FINAL:** 325+
- **Google Services found:** 3 major services across 40+ pages
- **Identified duplicates:** Multiple patterns of duplicate pages (file.html + file/index.html)
- **Google Analytics ID:** G-2HNTGCYQ1X (GA4)
- **Google Tag Manager ID:** GTM-TPFZCGX5
- **Google AdSense Publisher ID:** ca-pub-2209781252231399

---

## 1️⃣ Google Analytics & Tracking Setup

### Google Services in Use:

| Service | ID | Type | Location |
|---------|----|----|----------|
| **Google Analytics 4** | G-2HNTGCYQ1X | GA4 Tag | Multiple pages |
| **Google Tag Manager** | GTM-TPFZCGX5 | GTM Container | Multiple pages |
| **Google AdSense** | ca-pub-2209781252231399 | Ad Publisher | 40+ pages |

### Implementation Details:

#### A) Google AdSense
```javascript
<meta name="google-adsense-account" content="ca-pub-2209781252231399" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209781252231399" crossorigin="anonymous"></script>
```

**Pages with AdSense:** 40+ pages including:
- impot.html
- pret.html (and all pret/* pages)
- plusvalue.html
- taxe.html
- salaire-seo.html
- salaire.html
- All pret/* subdirectory pages
- Various departement frais-notaire pages

#### B) Google Tag Manager (GTM)
```javascript
// GTM Script at ID: GTM-TPFZCGX5
j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
```

**Pages with GTM:** 
- salaire-seo.html ✓
- Multiple pages in pages_SAFE/ directories
- test.html

**GTM noscript fallback:**
```html
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPFZCGX5" height="0" width="0" style="display: none; visibility: hidden"></iframe>
```

#### C) Google Analytics 4 (GA4)
```javascript
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2HNTGCYQ1X"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", "G-2HNTGCYQ1X");
</script>
```

**Pages with GA4:**
- salaire-seo.html ✓
- blog.html
- methodologie.html
- Multiple departement pages (frais-notaire-##.html)

---

## 2️⃣ Google Analytics Implementation Status

### Pages with "Google Analytics" Comment:

| File Path | Has Comment | Status |
|-----------|-------------|--------|
| pages_YMYL_FINAL/blog.html | ✓ | Line 74 |
| pages_YMYL_FINAL/methodologie.html | ✓ | Line 337 (text reference) |
| pages_YMYL_FINAL/salaire-seo.html | ✓ | Full tracking |
| pages_YMYL_FINAL/blog/* | ✓ | Multiple files |
| pages_YMYL_FINAL/blog/departements/frais-notaire-*.html | ✓ | 18+ files |

### Department Pages with Analytics (Sample):
- frais-notaire-03.html
- frais-notaire-05.html
- frais-notaire-06.html
- frais-notaire-11.html
- frais-notaire-19.html
- frais-notaire-34.html
- frais-notaire-38.html
- frais-notaire-56.html
- frais-notaire-83.html
- frais-notaire-84.html
- frais-notaire-95.html
- frais-notaire-972.html
- frais-notaire-974.html

---

## 3️⃣ IDENTIFIED DUPLICATES IN pages_YMYL_FINAL

### Duplicate Pattern Found:
Most pages follow a **dual structure**: `page.html` + `page/index.html`

This creates potential duplicate content issues and serves the same content via two URL paths.

### Duplicate Page Pairs (Complete List):

#### **Aid Pages (aide/**)**
```
aide-financiere-famille.html          ↔ aide/aide-financiere-famille/index.html
aide-logement-proprietaire.html       ↔ aide/aide-logement-proprietaire/index.html
aide-sociale-simulation-globale.html  ↔ aide/aide-sociale-simulation-globale/index.html
aides-etudiants.html                  ↔ aide/aides-etudiants/index.html
aides-jeunes-actifs.html              ↔ aide/aides-jeunes-actifs/index.html
aides-retraites.html                  ↔ aide/aides-retraites/index.html
allocation-logement-simulation.html   ↔ aide/allocation-logement-simulation/index.html
cumul-aides-sociales.html             ↔ aide/cumul-aides-sociales/index.html
quelles-aides-ai-je-droit.html        ↔ aide/quelles-aides-ai-je-droit/index.html
simulation-aides-caf.html             ↔ aide/simulation-aides-caf/index.html
aide/index.html                       (Main aide page)
```

#### **APL Pages (apl/**)**
```
apl-colocation.html                   ↔ apl/apl-colocation/index.html
apl-proprietaire-ai-je-droit.html     ↔ apl/apl-proprietaire-ai-je-droit/index.html
apl-refusee-que-faire.html            ↔ apl/apl-refusee-que-faire/index.html
comment-savoir-si-un-logement-est-eligible-aux-apl.html ↔ apl/comment-savoir-si-un-logement-est-eligible-aux-apl/index.html
quelles-ressources-pour-l-apl.html    ↔ apl/quelles-ressources-pour-l-apl/index.html
apl/index.html                        (Main APL page)
```

**Special APL Cases (with different titles):**
```
apl-dom-tom.html                      → Unique file (no duplicate)
apl-etudiant.html                     → Unique file (no duplicate)
apl-zones.html                        → Unique file (no duplicate)
apl.html                              → Unique file (no duplicate)
```

#### **Loan/Prêt Pages (pret/**)**
```
assurance-emprunteur-comment-estimer-son-cout.html         ↔ pret/assurance-emprunteur-comment-estimer-son-cout/index.html
calcul-du-taux-d-endettement.html                          ↔ pret/calcul-du-taux-d-endettement/index.html
capacite-d-emprunt-comment-la-calculer.html               ↔ pret/capacite-d-emprunt-comment-la-calculer/index.html
cout-total-d-un-pret-immobilier.html                       ↔ pret/cout-total-d-un-pret-immobilier/index.html
credit-immobilier-refuse-que-faire.html                    ↔ pret/credit-immobilier-refuse-que-faire/index.html
duree-ideale-d-un-pret-immobilier.html                     ↔ pret/duree-ideale-d-un-pret-immobilier/index.html
mensualite-de-pret-immobilier-comment-l-estimer.html      ↔ pret/mensualite-de-pret-immobilier-comment-l-estimer/index.html
pret-immobilier-sans-apport-est-ce-possible.html          ↔ pret/pret-immobilier-sans-apport-est-ce-possible/index.html
pret-immobilier-seul-ou-a-deux-quelle-difference.html     ↔ pret/pret-immobilier-seul-ou-a-deux-quelle-difference/index.html
pret-primo-accedant-specificites.html                      ↔ pret/pret-primo-accedant-specificites/index.html
ptz-conditions-principales.html                            ↔ pret/ptz-conditions-principales/index.html
quel-salaire-pour-emprunter-200-000.html                   ↔ pret/quel-salaire-pour-emprunter-200-000/index.html
quel-salaire-pour-emprunter-300-000.html                   ↔ pret/quel-salaire-pour-emprunter-300-000/index.html
simulateur-de-pret-immobilier-gratuit-pourquoi-l-utiliser.html ↔ pret/simulateur-de-pret-immobilier-gratuit-pourquoi-l-utiliser/index.html
taux-immobilier-2026-a-quoi-s-attendre.html               ↔ pret/taux-immobilier-2026-a-quoi-s-attendre/index.html
pret/index.html                       (Main Pret page)
```

#### **Other Identified Duplicates:**
```
simulateurs.html                      ↔ simulateurs/index.html
travail.html                          ↔ travail/index.html
salaire.html                          ↔ salaire/index.html
taxe.html                             ↔ taxe/index.html
rsa.html                              (No directory equivalent found)
```

---

## 4️⃣ Current Pages Structure in pages_YMYL_FINAL

### Main Root Pages:
- aah.html
- aah/ (directory)
- apl.html
- apl-dom-tom.html
- apl-etudiant.html
- apl-zones.html
- are.html
- are/ (directory)
- asf.html
- asf/ (directory)
- aide/ (directory structure)
- apl/ (directory structure)
- blog.html
- blog/ (directory)
- charges.html
- comment-calculer-frais-notaire.html
- comment-calculer-plus-value.html
- crypto-bourse.html
- financement.html
- financement/ (directory)
- ik.html
- ik/ (directory)
- impot.html
- impot/ (directory)
- methodologie.html
- notaire.html
- plusvalue.html
- plusvalue/ (directory)
- ponts.html
- pret.html
- pret/ (directory structure)
- prime-activite.html
- rsa.html
- rsa/ (directory)
- salaire.html
- salaire/
- salaire-seo.html
- simulateurs.html
- simulateurs/ (directory)
- sources.html
- taxe.html
- taxe/ (directory)
- taxe-fonciere/ (directory)
- travail.html
- travail/ (directory)

### Total Structure:
- **Root HTML files:** ~41 pages
- **Directory-based pages:** ~14+ subdirectories with index.html and sub-pages
- **Total pages with duplicates:** ~150+ duplicate URL paths

---

## 5️⃣ Google Services Script Distribution

### Files with Multiple Google Services:

#### Pages with ALL THREE services (GTM + GA4 + AdSense):
```
salaire-seo.html  ✓✓✓
```

#### Pages with GA4 + GTM:
```
blog.html
methodologie.html
Multiple pages in pages_SAFE/
Multiple departement pages
```

#### Pages with GA4 Only:
```
blog/* pages
blog/export-pdf-calculateurs.html
blog/frais-notaire-departements.html
blog/frais-notaire-ancien-neuf-2026.html
And many departement files
```

#### Pages with AdSense Only:
```
impot.html
pret.html
pret/* (all loan pages)
And 30+ others
```

---

## 6️⃣ Duplicate Script Inclusions Issues

### Issue 1: Duplicate Google Scripts in Paired Pages

**Example - APL Pages:**
- `apl-colocation.html` has Google async scripts
- `apl/apl-colocation/index.html` has the SAME Google async scripts

Both URLs serve identical JavaScript, causing:
- ❌ Duplicate gtag() function initialization
- ❌ Duplicate dataLayer declarations
- ❌ Duplicate GTM iframe injections
- ❌ Double ad impressions if both URLs are crawled

### Issue 2: Inconsistent Tracking Across Variants

**Report from report_YMYL_SEO.csv shows:**
```
apl.html                    ← 82 numbers verbalized, 157 GTM instances  
apl\index.html              ← 81 numbers verbalized, 59 GTM instances
```
Different tracking metrics suggest pages have diverged or aren't keeping sync.

### Issue 3: Departement Pages

**Pattern detected:** Some departement pages have Google Analytics comments but may lack full GTM/GA4:
- frais-notaire-03.html - Has Analytics comment
- frais-notaire-05.html - Has Analytics comment
- frais-notaire-06.html - Has Analytics comment
- ... and 15+ more

These may have incomplete tracking setup.

---

## 7️⃣ Duplicate Reports Already Generated

### Existing Analysis Files:
| File | Purpose | Status |
|------|---------|--------|
| [duplicate-report.html](duplicate-report.html) | Auto-correction report | ✅ Processed 325 pages |
| [report_YMYL_SEO.csv](report_YMYL_SEO.csv) | Title & number verbalization changes | ✅ 407 total lines |
| [temp/duplicates-for-deepseek.json](temp/duplicates-for-deepseek.json) | Duplicate sentence clusters | ✅ 25,843 lines |
| [INDEPENDANT_CLEAN_REPORT.md](INDEPENDANT_CLEAN_REPORT.md) | Official/exact link removal | ✅ 02/02/2026 |

### Last Known Cleanups:
- ✅ 2025-11-22: Auto-correction of frais-notaire-## pages (96 departement pages)
- ✅ 2026-02-02: Removal of "officiel" terminology (325 pages)
- ✅ Link corrections: /simulateur → external URLs (CAF, impots.gouv.fr, notaires.fr)

---

## 8️⃣ Recommendations

### Priority 1: Duplicate Page URLs
**Action:** Implement canonical tags for all paired pages:
```html
<!-- In apl-colocation.html: -->
<link rel="canonical" href="https://lescalculateurs.fr/apl/apl-colocation/" />

<!-- In apl/apl-colocation/index.html: -->
<link rel="canonical" href="https://lescalculateurs.fr/apl/apl-colocation/" />
```

### Priority 2: Google Tracking Consolidation
**Action:** Use shared third-party loader for all pages:
- ✅ File exists: `public/third-party-loader.js`
- It should load GTM, GA4, and AdSense without duplication
- Verify it's referenced in all pages_YMYL_FINAL files

### Priority 3: Verify Tracking Consistency
**Action:** Audit these pages to ensure tracking is consistent:
```
apl.html vs apl/index.html
impot.html vs impot/index.html
Plus all 150+ paired duplicates
```

### Priority 4: Department Pages Tracking
**Action:** Verify all Frais-Notaire departement files have:
- [ ] Google AdSense meta tag
- [ ] GTM script reference
- [ ] GA4 gtag script
- [ ] All in consistent order

---

## 📋 Complete Pages_YMYL_FINAL Inventory

### Total Files in pages_YMYL_FINAL:
**Estimated 325+ files** including:
- 41 root-level HTML files
- 14+ top-level directories containing sub-pages
- Department-specific pages (frais-notaire-01.html through frais-notaire-976.html)
- Tax, salary, loan, and aid calculator pages
- Blog and informational pages

### Key Subdirectories:
```
aah/                    (AAH Simulator)
aide/                   (Aid simulators - 10+ pages)
apl/                    (APL Housing - 15+ pages)
are/                    (ARE simulator)
asf/                    (ASF simulator)
blog/                   (Blog articles)
financement/            (Financing)
ik/                     (IK simulator)
impot/                  (Tax pages)
plusvalue/              (Capital gains)
pret/                   (Loan simulator - 20+ pages)
rsa/                    (RSA simulator)
salaire/                (Salary calculator)
simulateurs/            (Simulators hub)
taxe/                   (Tax main)
taxe-fonciere/          (Property tax - 20+ pages)
travail/                (Work-related)
```

---

## 🎯 Summary Table: Google Services by Type

| Service | Google ID | Files Affected | Issue Level |
|---------|-----------|-----------------|------------|
| AdSense | ca-pub-2209781252231399 | 40+ pages | 🟡 Medium - Duplicate script on paired pages |
| GA4 | G-2HNTGCYQ1X | 30+ pages | 🟡 Medium - Incomplete on some pages |
| GTM | GTM-TPFZCGX5 | 25+ pages | 🟡 Medium - Not on all pages |
| **Tracked Pages Total** | - | 95+ pages | 🔴 High - Duplicate URLs not consolidated |

---

**Analysis Complete** ✅  
Generated: 2026-02-06  
Review Status: Ready for Action
