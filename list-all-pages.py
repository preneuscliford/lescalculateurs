#!/usr/bin/env python3
"""List all pages from Search Console to find pret/financement pages"""

import openpyxl
from pathlib import Path

excel_file = Path("seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-05-03.xlsx")

wb = openpyxl.load_workbook(excel_file)
ws_pages = wb['Pages']

print("\n" + "="*180)
print("🔍 ALL PAGES - May 3, 2026 Search Console")
print("="*180 + "\n")

pages = []

for row in ws_pages.iter_rows(min_row=2, values_only=True):
    if not row or row[0] is None:
        break
    
    url = row[0]
    clics = row[1] or 0
    impr = row[2] or 0
    ctr = row[3] or 0 if row[3] else 0
    pos = row[4] or 0
    
    pages.append({
        'url': url,
        'clics': clics,
        'impr': impr,
        'ctr': ctr,
        'pos': pos,
    })

# Sort by clicks
pages.sort(key=lambda x: x['clics'], reverse=True)

# Display top 50 pages
print(f"📊 TOP 50 PAGES BY CLICKS:\n")
for i, page in enumerate(pages[:50], 1):
    print(f"{i:2d}. {str(page['url'])[:90]:90s} | {page['clics']:4.0f} clics | {page['impr']:5.0f} impr | CTR {page['ctr']*100:5.2f}%")

# Find pret and financement pages
print("\n\n" + "="*180)
print("🎯 PRET & FINANCEMENT PAGES:\n")

pret_pages = [p for p in pages if 'pret' in p['url'].lower()]
financement_pages = [p for p in pages if 'financement' in p['url'].lower()]

if pret_pages:
    print(f"📄 PRÊT ({len(pret_pages)} pages):")
    for p in pret_pages:
        print(f"   {p['url']}: {p['clics']:.0f} clics | {p['impr']:.0f} impr | CTR {p['ctr']*100:.2f}%")
else:
    print("❌ No prêt pages found")

if financement_pages:
    print(f"\n📄 FINANCEMENT ({len(financement_pages)} pages):")
    for p in financement_pages:
        print(f"   {p['url']}: {p['clics']:.0f} clics | {p['impr']:.0f} impr | CTR {p['ctr']*100:.2f}%")
else:
    print("❌ No financement pages found")

print("\n")
