#!/usr/bin/env python3
"""Generate consolidated analytics HTML report"""

import csv
from pathlib import Path
from datetime import datetime

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
total_bing_clics = 1605
total_bing_impr = 119565

google_ctr = (total_google_clics / total_google_impr * 100) if total_google_impr > 0 else 0
bing_ctr = (total_bing_clics / total_bing_impr * 100) if total_bing_impr > 0 else 0
vercel_pv_per_visit = (total_vercel_pv / total_vercel_visits) if total_vercel_visits > 0 else 0

html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Consolidé Analytics - Les Calculateurs</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: #f5f5f5; color: #333; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 20px; }}
        header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }}
        header h1 {{ font-size: 28px; margin-bottom: 10px; }}
        header p {{ opacity: 0.9; }}
        
        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .stat-card h3 {{ color: #667eea; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; }}
        .stat-value {{ font-size: 32px; font-weight: bold; margin-bottom: 5px; }}
        .stat-label {{ color: #888; font-size: 12px; }}
        .stat-card.google {{ border-left: 4px solid #4285f4; }}
        .stat-card.vercel {{ border-left: 4px solid #000; }}
        .stat-card.bing {{ border-left: 4px solid #00a4ef; }}
        
        .section {{ background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .section h2 {{ font-size: 18px; margin-bottom: 20px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }}
        
        table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
        thead {{ background: #f8f9fa; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }}
        th {{ font-weight: 600; color: #333; }}
        tr:hover {{ background: #f9f9f9; }}
        
        .url-cell {{ color: #667eea; font-weight: 500; }}
        .number {{ text-align: right; font-weight: 500; }}
        .ctr-high {{ color: #10b981; }}
        .ctr-low {{ color: #ef4444; }}
        .ctr-medium {{ color: #f59e0b; }}
        
        .comparison {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }}
        .comparison-item {{ padding: 15px; background: #f8f9fa; border-radius: 6px; }}
        .comparison-item strong {{ color: #667eea; }}
        
        .insight {{ background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin-top: 20px; }}
        .insight strong {{ color: #1565c0; }}
        
        footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Rapport Consolidé Analytics</h1>
            <p>Données fusionnées: Google Search Console + Vercel + Bing Webmaster Tools</p>
            <p style="font-size: 12px; margin-top: 10px;">Période: 26 avril - 3 mai 2026 | Mis à jour: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card google">
                <h3>🔍 Google Search Console</h3>
                <div class="stat-value">{total_google_clics:.0f}</div>
                <div class="stat-label">Clics organiques</div>
                <div class="stat-value" style="font-size: 18px; margin-top: 10px;">{total_google_impr:.0f}</div>
                <div class="stat-label">Impressions</div>
                <div class="stat-value" style="font-size: 20px; margin-top: 10px; color: #667eea;">{google_ctr:.2f}%</div>
                <div class="stat-label">CTR moyen</div>
            </div>
            
            <div class="stat-card vercel">
                <h3>📱 Vercel Analytics</h3>
                <div class="stat-value">{total_vercel_visits:.0f}</div>
                <div class="stat-label">Visiteurs (tous canaux)</div>
                <div class="stat-value" style="font-size: 18px; margin-top: 10px;">{total_vercel_pv:.0f}</div>
                <div class="stat-label">Pageviews</div>
                <div class="stat-value" style="font-size: 20px; margin-top: 10px; color: #000;">{vercel_pv_per_visit:.2f}</div>
                <div class="stat-label">Pages/visiteur</div>
            </div>
            
            <div class="stat-card bing">
                <h3>🔎 Bing Webmaster</h3>
                <div class="stat-value">{total_bing_clics}</div>
                <div class="stat-label">Clics (site-wide)</div>
                <div class="stat-value" style="font-size: 18px; margin-top: 10px;">{total_bing_impr}</div>
                <div class="stat-label">Impressions</div>
                <div class="stat-value" style="font-size: 20px; margin-top: 10px; color: #00a4ef;">{bing_ctr:.2f}%</div>
                <div class="stat-label">CTR moyen</div>
            </div>
        </div>
        
        <div class="section">
            <h2>💡 Insights Clés</h2>
            <div class="comparison">
                <div class="comparison-item">
                    <strong>Google vs Bing:</strong> Google génère {total_google_clics/total_bing_clics:.1f}x plus de clics que Bing
                </div>
                <div class="comparison-item">
                    <strong>Vercel vs Google:</strong> {total_vercel_visits/total_google_clics:.1f}x plus de visiteurs que de clics Google organic
                </div>
                <div class="comparison-item">
                    <strong>Trafic multi-canaux:</strong> ~{(1-total_google_clics/total_vercel_visits)*100:.0f}% du trafic vient d'autres canaux (direct, email, etc)
                </div>
                <div class="comparison-item">
                    <strong>Pages indexées:</strong> {len([r for r in data if float(r['google_impr']) > 0])} pages génèrent du trafic organic
                </div>
            </div>
            
            <div class="insight">
                <strong>⚡ À noter:</strong> Les visiteurs Vercel incluent direct, email, et social. Le ratio 1.4x signifie que 28% du trafic ne provient pas de Google organic.
            </div>
        </div>
        
        <div class="section">
            <h2>🏆 Top 30 Pages (Google Organic)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50%">URL</th>
                        <th class="number">Clics</th>
                        <th class="number">Impr.</th>
                        <th class="number">CTR</th>
                        <th class="number">Pos.</th>
                        <th class="number">Vercel</th>
                    </tr>
                </thead>
                <tbody>
"""

sorted_data = sorted(data, key=lambda r: float(r['google_clics']), reverse=True)

for i, row in enumerate(sorted_data[:30], 1):
    url = row['url']
    clics = float(row['google_clics'])
    impr = float(row['google_impr'])
    ctr = float(row['google_ctr']) * 100 if impr > 0 else 0
    pos = float(row['google_pos']) if row['google_pos'] else 0
    vercel = f"{float(row['vercel_visitors']):.0f}"
    
    ctr_class = ""
    if ctr > 2:
        ctr_class = "ctr-high"
    elif ctr > 1:
        ctr_class = "ctr-medium"
    else:
        ctr_class = "ctr-low"
    
    html += f"""                    <tr>
                        <td class="url-cell">{url}</td>
                        <td class="number">{clics:.0f}</td>
                        <td class="number">{impr:.0f}</td>
                        <td class="number {ctr_class}">{ctr:.2f}%</td>
                        <td class="number">{pos:.1f}</td>
                        <td class="number">{vercel}</td>
                    </tr>
"""

html += """                </tbody>
            </table>
        </div>
        
        <footer>
            <p>Rapport généré automatiquement | Les Calculateurs Analytics Dashboard</p>
            <p>Source: Google Search Console + Vercel + Bing Webmaster Tools</p>
        </footer>
    </div>
</body>
</html>
"""

# Write to file
output_file = Path('analytics-consolidated-report.html')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"✅ Rapport HTML généré: {output_file}")
