#!/usr/bin/env python3
"""Analyze Search Console Performance by Category and Page"""

import openpyxl
import sys
from pathlib import Path
from statistics import mean

excel_file = Path("seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-05-02.xlsx")

if not excel_file.exists():
    print(f"❌ File not found: {excel_file}")
    sys.exit(1)

# Define page categories
categories = {
    "APL - SMIC": [
        "/pages/apl/apl-smic-couple-deux-enfants",
        "/pages/apl/apl-smic-parent-isole-trois-enfants",
        "/pages/apl/apl-smic-colocation",
        "/pages/apl/apl-smic-couple-logement-social",
        "/pages/apl/apl-smic-seul",
    ],
    "APL - Loyer": [
        "/pages/apl/apl-loyer-500-personne-seule",
        "/pages/apl/apl-loyer-650-couple-sans-enfant",
        "/pages/apl/apl-loyer-750-parent-isole-un-enfant",
        "/pages/apl/apl-loyer-1000-couple-deux-enfants",
        "/pages/apl/apl-loyer-700-personne-seule",
    ],
    "APL - Chômage": [
        "/pages/apl/apl-chomage-personne-seule-sans-enfant",
        "/pages/apl/apl-chomage-parent-isole-deux-enfants",
        "/pages/apl/apl-chomage-loyer-700-personne-seule",
        "/pages/apl/apl-chomage-loyer-moyen",
    ],
    "APL - Reprise d'emploi": [
        "/pages/apl/apl-reprise-emploi-personne-seule-loyer-700",
        "/pages/apl/apl-reprise-emploi-parent-isole-un-enfant",
        "/pages/apl/apl-reprise-emploi-couple-un-enfant",
    ],
    "APL - Consolidation": [
        "/pages/apl/apl-famille-deux-enfants-logement-social",
        "/pages/apl/apl-famille-trois-enfants",
    ],
    "ARE": [
        "/pages/are/montant-are-2026",
        "/pages/are/are-cumul-salaire-temps-partiel-2026",
        "/pages/are/are-salaire-reference-calcul-2026",
        "/pages/are/are-fin-de-droits-aides-2026",
        "/pages/are/are-duree-indemnisation-2026",
    ],
    "Prime d'activité": [
        "/pages/prime-activite/prime-activite-reprise-emploi-personne-seule",
        "/pages/prime-activite/prime-activite-reprise-emploi-apres-chomage",
        "/pages/prime-activite/prime-activite-temps-partiel-smic",
        "/pages/prime-activite/prime-activite-couple-sans-enfant-smic",
        "/pages/prime-activite/prime-activite-parent-isole-un-enfant",
    ],
    "Impôt": [
        "/pages/impot/impot-revenu-30000-celibataire-2026",
        "/pages/impot/impot-revenu-45000-couple-2026",
        "/pages/impot/impot-revenu-60000-couple-un-enfant-2026",
        "/pages/impot/impot-quotient-familial-2-parts-2026",
        "/pages/impot/impot-decote-2026-simulation",
    ],
    "VDF - Revenu Médian": [
        "/pages/revenu-median-commune",
        "/pages/revenus/paris",
        "/pages/revenus/lyon",
        "/pages/revenus/marseille",
        "/pages/revenus/toulouse",
        "/pages/revenus/nice",
        "/pages/revenus/nantes",
        "/pages/revenus/montpellier",
        "/pages/revenus/strasbourg",
        "/pages/revenus/bordeaux",
        "/pages/revenus/lille",
    ],
}

try:
    wb = openpyxl.load_workbook(excel_file)
    ws_pages = wb['Pages']
    
    # Load all pages
    all_pages = {}
    for row in ws_pages.iter_rows(min_row=2, values_only=True):
        if row[0] is None:
            break
        url = row[0]
        clics = row[1] or 0
        impr = row[2] or 0
        ctr = row[3] or 0
        pos = row[4] or 0
        all_pages[url] = {
            'clics': clics,
            'impr': impr,
            'ctr': ctr,
            'pos': pos,
        }
    
    print("\n" + "="*140)
    print("📊 CATEGORY PERFORMANCE ANALYSIS - lescalculateurs.fr")
    print("="*140 + "\n")
    
    total_clics = 0
    total_impr = 0
    
    for category, urls in categories.items():
        # Find matching pages
        matching_pages = []
        for url in urls:
            # Partial URL match (in case of truncation)
            for full_url, data in all_pages.items():
                if url in full_url or full_url.endswith(url.split('/')[-1]):
                    matching_pages.append((full_url, data))
                    break
        
        if not matching_pages:
            print(f"❌ {category:30s} | No matching pages found")
            continue
        
        # Calculate aggregates
        cat_clics = sum(p[1]['clics'] for p in matching_pages)
        cat_impr = sum(p[1]['impr'] for p in matching_pages)
        cat_ctr = (cat_clics / cat_impr * 100) if cat_impr > 0 else 0
        cat_pos = mean([p[1]['pos'] for p in matching_pages])
        
        total_clics += cat_clics
        total_impr += cat_impr
        
        # Print category summary
        print(f"📌 {category:30s}")
        print(f"   Clics: {cat_clics:3.0f} | Impr: {cat_impr:5.0f} | CTR: {cat_ctr:5.2f}% | Pos: {cat_pos:5.1f}")
        print(f"   Pages: {len(matching_pages)}")
        
        # Print top 5 pages in category
        sorted_pages = sorted(matching_pages, key=lambda x: x[1]['clics'], reverse=True)
        for i, (url, data) in enumerate(sorted_pages[:5], 1):
            url_short = url.split('/')[-1][:50]
            print(f"      {i}. {url_short:52s} | {data['clics']:3.0f} clics | {data['impr']:4.0f} impr | {data['ctr']*100:5.2f}% CTR | {data['pos']:5.1f}")
        
        if len(sorted_pages) > 5:
            print(f"      + {len(sorted_pages)-5} more pages...")
        print()
    
    print("="*140)
    print(f"✓ Summary: Total {total_clics:.0f} clics | {total_impr:.0f} impressions")
    print("="*140 + "\n")
    
except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    traceback.print_exc()
    sys.exit(1)
