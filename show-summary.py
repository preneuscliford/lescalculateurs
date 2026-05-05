#!/usr/bin/env python3
"""Show consolidated analytics summary"""

import csv
from pathlib import Path

file = Path('consolidated-analytics-2026-05-03.csv')
data = []

with open(file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append(row)

# Calculate totals
total_google_clics = sum(float(r['google_clics']) for r in data)
total_google_impr = sum(float(r['google_impr']) for r in data)
total_vercel_visits = sum(float(r['vercel_visitors']) for r in data)
total_vercel_pv = sum(float(r['vercel_pageviews']) for r in data)

print("\n" + "="*100)
print("📊 SYNTHÈSE CONSOLIDÉE - Google SC + Vercel + Bing (3 mai 2026)")
print("="*100)
print()
print("📈 GOOGLE SEARCH CONSOLE:")
print(f"   • Total clics (organic): {total_google_clics:.0f}")
print(f"   • Total impressions: {total_google_impr:.0f}")
if total_google_impr > 0:
    google_ctr = (total_google_clics / total_google_impr) * 100
    print(f"   • CTR moyen: {google_ctr:.2f}%")
pages_indexed = len([r for r in data if float(r['google_impr']) > 0])
print(f"   • Pages indexées avec trafic: {pages_indexed}")

print()
print("📱 VERCEL ANALYTICS (tous canaux):")
print(f"   • Total visiteurs: {total_vercel_visits:.0f}")
print(f"   • Total pageviews: {total_vercel_pv:.0f}")
if total_vercel_visits > 0:
    print(f"   • Pages/visiteur: {total_vercel_pv/total_vercel_visits:.2f}")

print()
print("🔎 BING WEBMASTER:")
print("   • Total clics: 1605 (site-wide)")
print("   • Total impressions: 119565 (site-wide)")
print(f"   • CTR: {(1605/119565)*100:.2f}%")

print()
print("💡 RATIO VERCEL vs GOOGLE CLICS:")
if total_google_clics > 0:
    ratio = total_vercel_visits / total_google_clics
    print(f"   • {ratio:.1f}x plus de visiteurs que de clics Google organic")
    other_percent = (1 - 1/ratio) * 100
    print(f"   • Signifie: {other_percent:.0f}% du trafic vient d'autres canaux (direct, email, social, etc)")

print()
print("="*100 + "\n")

# Show top pages
print("\n🏆 TOP 20 PAGES PAR CLICS GOOGLE\n")
sorted_data = sorted(data, key=lambda r: float(r['google_clics']), reverse=True)
print(f"{'URL':<70} | {'Google':<12} | {'Vercel':<12} | {'CTR':<8}")
print(f"{'':70} | {'Clics/Impr':<12} | {'Visits/PV':<12} | {'%':<8}")
print("-" * 120)

for i, row in enumerate(sorted_data[:20], 1):
    url = row['url'][:70]
    google_val = f"{float(row['google_clics']):.0f}/{float(row['google_impr']):.0f}"
    vercel_val = f"{float(row['vercel_visitors']):.0f}/{float(row['vercel_pageviews']):.0f}"
    ctr = float(row['google_ctr']) * 100 if float(row['google_impr']) > 0 else 0
    print(f"{url:<70} | {google_val:<12} | {vercel_val:<12} | {ctr:<8.2f}")

print("\n")
