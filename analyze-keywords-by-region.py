#!/usr/bin/env python3
"""Analyze Search Console keywords to identify regional opportunities + volume"""

import openpyxl
from pathlib import Path
import re
from collections import defaultdict

# Load Search Console data
excel_file = Path("seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-05-02.xlsx")
wb = openpyxl.load_workbook(excel_file)

print("\n" + "="*160)
print("🔍 SEARCH CONSOLE - Analyse par Région + Détection des Pages Manquantes")
print("="*160 + "\n")

# Extract keywords sheet
ws_req = wb['Requêtes']

keywords = []
for row in ws_req.iter_rows(min_row=2, values_only=True):
    if row[0] is None:
        break
    query = row[0] or ''
    clics = row[1] or 0
    impr = row[2] or 0
    ctr = row[3] or 0 if row[3] else 0
    pos = row[4] or 0
    
    keywords.append({
        'query': query.lower(),
        'clics': clics,
        'impr': impr,
        'ctr': ctr,
        'pos': pos,
    })

# ============================================================
# STRATEGY 1: Find keywords with VOLUME but LOW CTR (gaps)
# ============================================================
print("📊 KEYWORDS WITH VOLUME BUT LOW CTR (Potential Quick Wins):")
print("-" * 160)

volume_low_ctr = []
for kw in keywords:
    # Keywords with impressions but low clicks = low CTR opportunity
    if kw['impr'] >= 5 and kw['clics'] < 3:
        ctr_pct = kw['ctr'] * 100
        volume_low_ctr.append(kw)

# Sort by impressions
volume_low_ctr.sort(key=lambda x: x['impr'], reverse=True)

for i, kw in enumerate(volume_low_ctr[:20], 1):
    ctr_pct = kw['ctr'] * 100
    print(f"{i:2d}. \"{kw['query']:60s}\" | {kw['impr']:3.0f} impr | {kw['clics']:2.0f} clics | CTR {ctr_pct:5.2f}% | Pos {kw['pos']:.1f}")

# ============================================================
# STRATEGY 2: Extract REGIONS mentioned in keywords
# ============================================================
print("\n\n" + "="*160)
print("🗺️ KEYWORDS BY REGION DETECTED:")
print("-" * 160)

french_regions = {
    # Major cities
    'paris': 'Île-de-France', 'lyon': 'Auvergne-Rhône-Alpes', 'marseille': 'PACA', 'toulouse': 'Occitanie',
    'bordeaux': 'Nouvelle-Aquitaine', 'lille': 'Hauts-de-France', 'nantes': 'Pays de la Loire',
    'strasbourg': 'Alsace', 'montpellier': 'Occitanie', 'nice': 'PACA',
    'rennes': 'Bretagne', 'reims': 'Champagne-Ardenne', 'rouen': 'Normandie',
    'nancy': 'Lorraine', 'lens': 'Hauts-de-France', 'brest': 'Bretagne',
    'lille': 'Hauts-de-France', 'saint-etienne': 'Auvergne-Rhône-Alpes',
    'toulon': 'PACA', 'grenoble': 'Auvergne-Rhône-Alpes', 'angers': 'Pays de la Loire',
    'dijon': 'Bourgogne-Franche-Comté', 'nîmes': 'Occitanie', 'clermont': 'Auvergne-Rhône-Alpes',
    # Regions
    'ile de france': 'Île-de-France', 'rhone alpes': 'Auvergne-Rhône-Alpes', 'alsace': 'Alsace',
    'aquitaine': 'Nouvelle-Aquitaine', 'provence': 'PACA', 'bretagne': 'Bretagne',
    # Departments - extract dept codes
}

regional_keywords = defaultdict(list)

for kw in keywords:
    found_region = None
    for city_key, region in french_regions.items():
        if city_key in kw['query']:
            found_region = region
            break
    
    if found_region:
        regional_keywords[found_region].append(kw)

# Show regional aggregation
print("\nRégions avec demandes Search Console:")
for region in sorted(regional_keywords.keys(), key=lambda x: sum(k['impr'] for k in regional_keywords[x]), reverse=True):
    keywords_list = regional_keywords[region]
    total_impr = sum(k['impr'] for k in keywords_list)
    total_clics = sum(k['clics'] for k in keywords_list)
    avg_ctr = (total_clics / total_impr * 100) if total_impr > 0 else 0
    
    print(f"\n🌍 {region}")
    print(f"   {len(keywords_list)} keywords | {total_impr:.0f} impressions | {total_clics:.0f} clics | CTR {avg_ctr:.2f}%")
    
    # Top 3 keywords for this region
    region_sorted = sorted(keywords_list, key=lambda x: x['impr'], reverse=True)
    for kw in region_sorted[:3]:
        ctr_pct = kw['ctr'] * 100
        print(f"     • \"{kw['query']}\" ({kw['impr']:.0f} impr, {kw['clics']:.0f} clics, CTR {ctr_pct:.1f}%)")

# ============================================================
# STRATEGY 3: Keywords mentioning "salaire" + region (high intent)
# ============================================================
print("\n\n" + "="*160)
print("💼 HIGH-INTENT KEYWORDS: \"salaire\" + région/ville:")
print("-" * 160)

salary_regional = []
for kw in keywords:
    if 'salaire' in kw['query'] or 'revenu' in kw['query']:
        # Check for regional/city terms
        has_region = any(city in kw['query'] for city in ['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 
                                                            'lille', 'nantes', 'region', 'ile de france', 'alsace'])
        if has_region or len(kw['query'].split()) >= 3:
            salary_regional.append(kw)

salary_regional.sort(key=lambda x: x['impr'], reverse=True)

for i, kw in enumerate(salary_regional[:15], 1):
    ctr_pct = kw['ctr'] * 100
    potential = "🔴 URGENT" if kw['impr'] >= 10 and kw['clics'] < 2 else "🟡 MEDIUM" if kw['impr'] >= 5 else "🟢 TRACK"
    print(f"{i:2d}. {potential} | \"{kw['query']:50s}\" | {kw['impr']:3.0f} impr | {kw['clics']:2.0f} clics | CTR {ctr_pct:5.2f}%")

print("\n" + "="*160)
print("\n💡 RECOMMENDATION: Look at HIGH-IMPR/LOW-CTR keywords above")
print("   These are PROVEN searches with real volume but poor landing pages")
print("   Create pages targeting these exact queries = higher conversion probability\n")
