#!/usr/bin/env python3
"""Merge Google Search Console + Bing + Vercel Analytics into one consolidated report"""

import openpyxl
import csv
from pathlib import Path
from collections import defaultdict

# 1. Load Google Search Console data
print("\n📊 Charger données Google Search Console (Excel)...")
google_data = {}
excel_file = Path("seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-05-03.xlsx")

try:
    wb = openpyxl.load_workbook(excel_file)
    ws_pages = wb['Pages']
    
    for row in ws_pages.iter_rows(min_row=2, values_only=True):
        if not row or row[0] is None:
            break
        
        url = row[0]
        # Normalize URL: remove https://www.lescalculateurs.fr prefix
        if url.startswith("https://www.lescalculateurs.fr"):
            url_path = url.replace("https://www.lescalculateurs.fr", "")
        elif url.startswith("https://lescalculateurs.fr"):
            url_path = url.replace("https://lescalculateurs.fr", "")
        else:
            url_path = url
        
        google_data[url_path] = {
            'google_clics': row[1] or 0,
            'google_impr': row[2] or 0,
            'google_ctr': row[3] or 0,
            'google_pos': row[4] or 0,
        }
    
    print(f"✅ Loaded {len(google_data)} pages from Google Search Console")
except Exception as e:
    print(f"❌ Error loading Google SC: {e}")

# 2. Load Vercel Analytics data
print("📊 Charger données Vercel Analytics...")
vercel_data = {}
vercel_file = Path("seach-console-perf/Top Pages - Apr 3, 1_00 - May 3, 1_59.csv")

try:
    with open(vercel_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            page_path = row['Page']
            # Ensure path starts with /
            if not page_path.startswith('/'):
                page_path = '/' + page_path
            
            visitors = int(row['Visitors'])
            total = int(row['Total'])
            
            vercel_data[page_path] = {
                'vercel_visitors': visitors,
                'vercel_pageviews': total,
            }
    
    print(f"✅ Loaded {len(vercel_data)} pages from Vercel Analytics")
except Exception as e:
    print(f"❌ Error loading Vercel: {e}")

# 3. Load Bing data (aggregate by URL if available)
print("📊 Charger données Bing Webmaster Tools...")
bing_file = Path("seach-console-perf/www.lescalculateurs.fr_SearchPerformanceOverview_All_5_3_2026.csv")

bing_totals = {
    'bing_clics': 0,
    'bing_impr': 0,
    'bing_ctr': 0,
}

try:
    with open(bing_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            bing_totals['bing_clics'] += int(row['Clicks'])
            bing_totals['bing_impr'] += int(row['Impressions'])
    
    # Calculate avg CTR
    if bing_totals['bing_impr'] > 0:
        bing_totals['bing_ctr'] = (bing_totals['bing_clics'] / bing_totals['bing_impr']) * 100
    
    print(f"✅ Loaded Bing totals: {bing_totals['bing_clics']} clics, {bing_totals['bing_impr']} impr")
except Exception as e:
    print(f"❌ Error loading Bing: {e}")

# 4. Merge all data
print("\n📋 Fusionner les données...")
all_urls = set(google_data.keys()) | set(vercel_data.keys())

merged = []
for url_path in sorted(all_urls):
    row = {'url': url_path}
    
    # Google data
    if url_path in google_data:
        row.update(google_data[url_path])
    else:
        row.update({'google_clics': 0, 'google_impr': 0, 'google_ctr': 0, 'google_pos': 0})
    
    # Vercel data
    if url_path in vercel_data:
        row.update(vercel_data[url_path])
    else:
        row.update({'vercel_visitors': 0, 'vercel_pageviews': 0})
    
    # Bing data (site-wide)
    row.update(bing_totals)
    
    merged.append(row)

# 5. Generate consolidated report
print("\n" + "="*200)
print("📊 RAPPORT CONSOLIDÉ - Google SC + Bing + Vercel (3 mai 2026)")
print("="*200 + "\n")

print(f"{'URL':<80} | {'Google':<20} | {'Vercel':<20} | {'Bing (Site)':<15}")
print(f"{'':<80} | {'Clics':<7} {'CTR%':<7} {'Pos':<5} | {'Visits':<10} {'PV':<8} | {'Clics/Impr':<15}")
print("-" * 200)

for row in merged:
    url = row['url'][:80]
    google_str = f"{row['google_clics']:<7.0f} {row['google_ctr']*100:<7.2f} {row['google_pos']:<5.1f}"
    vercel_str = f"{row['vercel_visitors']:<10.0f} {row['vercel_pageviews']:<8.0f}"
    bing_str = f"{bing_totals['bing_clics']}/{bing_totals['bing_impr']}"
    
    print(f"{url:<80} | {google_str:<20} | {vercel_str:<20} | {bing_str:<15}")

# 6. Save to CSV
print("\n\n💾 Exporter en CSV...")
output_file = Path("consolidated-analytics-2026-05-03.csv")

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'url',
        'google_clics', 'google_impr', 'google_ctr', 'google_pos',
        'vercel_visitors', 'vercel_pageviews',
        'bing_clics', 'bing_impr', 'bing_ctr'
    ])
    writer.writeheader()
    writer.writerows(merged)

print(f"✅ Saved to {output_file}\n")

# 7. Summary statistics
print("="*200)
print("📈 STATISTIQUES CONSOLIDÉES\n")

google_total_clics = sum(r['google_clics'] for r in merged)
google_total_impr = sum(r['google_impr'] for r in merged)
google_avg_ctr = (google_total_clics / google_total_impr * 100) if google_total_impr > 0 else 0

vercel_total_visitors = sum(r['vercel_visitors'] for r in merged)
vercel_total_pageviews = sum(r['vercel_pageviews'] for r in merged)

print(f"🔍 **GOOGLE SEARCH CONSOLE** (Organique)")
print(f"   • Total clics: {google_total_clics:.0f}")
print(f"   • Total impressions: {google_total_impr:.0f}")
print(f"   • CTR moyen: {google_avg_ctr:.2f}%")
print(f"   • Pages indexées: {len([r for r in merged if r['google_impr'] > 0])}")

print(f"\n📊 **VERCEL ANALYTICS** (Direct + Tous canaux)")
print(f"   • Total visiteurs: {vercel_total_visitors:.0f}")
print(f"   • Total pageviews: {vercel_total_pageviews:.0f}")
print(f"   • Avg pages/visitor: {vercel_total_pageviews/vercel_total_visitors if vercel_total_visitors > 0 else 0:.2f}")

print(f"\n🔎 **BING WEBMASTER TOOLS** (Bing organic)")
print(f"   • Total clics: {bing_totals['bing_clics']:.0f}")
print(f"   • Total impressions: {bing_totals['bing_impr']:.0f}")
print(f"   • CTR moyen: {bing_totals['bing_ctr']:.2f}%")
print(f"   • Ratio Bing/Google clics: {bing_totals['bing_clics']/google_total_clics*100:.1f}%" if google_total_clics > 0 else "N/A")

print(f"\n💡 **INSIGHTS**:")
print(f"   • Vercel visitors vs Google clics: {vercel_total_visitors/google_total_clics:.1f}x")
print(f"   • Significa: Muchos otros canales además de Google (direct, email, social)")

print("\n" + "="*200 + "\n")
