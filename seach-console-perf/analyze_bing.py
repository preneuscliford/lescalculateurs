import csv

def safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default

def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def clean_ctr(val):
    if val is None:
        return 0.0
    return safe_float(str(val).replace('%', ''))

# ============================================================
# 1. KEYWORD REPORT
# ============================================================
kw_file = r'seach-console-perf\www.lescalculateurs.fr_KeywordReport_6_6_2026.csv'
with open(kw_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    kw_lines = list(reader)

print('=' * 60)
print('BING WEBMASTER TOOLS - ANALYSE MOTS-CLES')
print('=' * 60)
print('Nombre de mots-cles: {}'.format(len(kw_lines)))
print()

# Trier par clics
sorted_kw_clicks = sorted(kw_lines, key=lambda r: safe_int(r.get('Clicks', 0)), reverse=True)
print('=== TOP 20 MOTS-CLES BING (par clics) ===')
for i, row in enumerate(sorted_kw_clicks[:20]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.1f}% Pos:{:.1f}'.format(i+1, kw[:75], clicks, impr, ctr, pos))

print()
# Trier par impressions
sorted_kw_impr = sorted(kw_lines, key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
print('=== TOP 20 MOTS-CLES BING (par impressions) ===')
for i, row in enumerate(sorted_kw_impr[:20]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.1f}% Pos:{:.1f}'.format(i+1, kw[:75], clicks, impr, ctr, pos))

print()
# Opportunites Bing
print('=== OPPORTUNITES BING (Impr > 500, Pos 5-20) ===')
opps_bing = []
for r in kw_lines:
    impr = safe_int(r.get('Impressions', 0))
    pos = safe_float(r.get('Avg. Position', 30))
    if impr > 500 and 5 <= pos <= 20:
        opps_bing.append(r)
opps_bing.sort(key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
for i, row in enumerate(opps_bing[:20]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.1f}% Pos:{:.1f}'.format(i+1, kw[:75], clicks, impr, ctr, pos))

# Stats globales
total_kw_clicks = sum(safe_int(r.get('Clicks', 0)) for r in kw_lines)
total_kw_impr = sum(safe_int(r.get('Impressions', 0)) for r in kw_lines)
avg_kw_ctr = total_kw_clicks / total_kw_impr * 100 if total_kw_impr > 0 else 0
positions = [safe_float(r.get('Avg. Position', 0)) for r in kw_lines]
positions = [p for p in positions if p > 0]
avg_kw_pos = sum(positions) / len(positions) if positions else 0

print()
print('=== STATS GLOBALES MOTS-CLES BING ===')
print('Clics totaux: {}'.format(total_kw_clicks))
print('Impressions totales: {}'.format(total_kw_impr))
print('CTR moyen: {:.2f}%'.format(avg_kw_ctr))
print('Position moyenne: {:.1f}'.format(avg_kw_pos))

# ============================================================
# 2. PAGE TRAFFIC REPORT
# ============================================================
page_file = r'seach-console-perf\www.lescalculateurs.fr_PageTrafficReport_6_6_2026.csv'
with open(page_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    page_lines = list(reader)

print()
print('=' * 60)
print('BING WEBMASTER TOOLS - ANALYSE PAGES')
print('=' * 60)
print('Nombre de pages: {}'.format(len(page_lines)))
print()

sorted_pages_clicks = sorted(page_lines, key=lambda r: safe_int(r.get('Clicks', 0)), reverse=True)
print('=== TOP 20 PAGES BING (par clics) ===')
for i, row in enumerate(sorted_pages_clicks[:20]):
    page = row.get('Page', '?')
    name = page.split('/')[-1] if '/' in page else page
    # Nom plus lisible
    if 'pages/' in page:
        parts = page.split('pages/')[-1].split('/')
        name = parts[0] if parts[0] else 'index'
        if len(parts) > 1:
            name += '/' + parts[1]
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{:30s}] Clics:{:5d} Impr:{:7d} CTR:{:5.2f}% Pos:{:.1f}'.format(i+1, name, clicks, impr, ctr, pos))

# Stats globales pages
total_page_clicks = sum(safe_int(r.get('Clicks', 0)) for r in page_lines)
total_page_impr = sum(safe_int(r.get('Impressions', 0)) for r in page_lines)
avg_page_ctr = total_page_clicks / total_page_impr * 100 if total_page_impr > 0 else 0

print()
print('=== STATS GLOBALES PAGES BING ===')
print('Clics totaux: {}'.format(total_page_clicks))
print('Impressions totales: {}'.format(total_page_impr))
print('CTR moyen: {:.2f}%'.format(avg_page_ctr))

# ============================================================
# 3. COMPARAISON BING vs GOOGLE
# ============================================================
print()
print('=' * 60)
print('COMPARAISON BING vs GOOGLE (estimation)')
print('=' * 60)

# Google SC daily data (from previous analysis)
# ~59 clics/j, ~3819 impr/j
# Bing: total period unknown, but let's compare ratios
print('Google Search Console (moy/j sur 90j): ~59 clics/j, ~3819 impr/j')
print('Bing Webmaster Tools (total sur la periode): {} clics, {} impr'.format(total_kw_clicks, total_kw_impr))
# Assuming Bing data covers ~90 days too
bing_clicks_per_day_est = total_kw_clicks / 90
bing_impr_per_day_est = total_kw_impr / 90
print('Bing estime (si 90j): {:.0f} clics/j, {:.0f} impr/j'.format(bing_clicks_per_day_est, bing_impr_per_day_est))
if bing_clicks_per_day_est > 0:
    ratio_bing_google = bing_clicks_per_day_est / 59 * 100
    print('Ratio Bing/Google: {:.1f}% du trafic Google'.format(ratio_bing_google))
    print()

# Analyse par page: comparer les CTR Google vs Bing pour les memes pages
print('=== CTR COMPARE GOOGLE vs BING (top pages communes) ===')
print('{:25s} {:>8s} {:>8s} {:>10s}'.format('PAGE', 'BING', 'GOOGLE', 'BING vs G'))
print('-' * 55)
# Google page data is from the keyword report (we have impressions per page there indirectly)
# For a rough comparison, we use the overall CTR
google_avg_ctr = 1.55  # from earlier SC analysis
for i, row in enumerate(sorted_pages_clicks[:15]):
    page = row.get('Page', '?')
    name = page.split('/')[-1] if '/' in page else 'index'
    if 'pages/' in page:
        parts = page.split('pages/')[-1].split('/')
        name = parts[0] if parts[0] else 'index'
        if len(parts) > 1:
            name += '/' + parts[1]
    ctr_bing = clean_ctr(row.get('CTR'))
    pos_bing = safe_float(row.get('Avg. Position', 99))
    # Rough Google CTR based on position
    google_ctr_est = 0
    if pos_bing <= 3:
        google_ctr_est = 10.0
    elif pos_bing <= 5:
        google_ctr_est = 5.0
    elif pos_bing <= 7:
        google_ctr_est = 2.5
    elif pos_bing <= 10:
        google_ctr_est = 1.5
    else:
        google_ctr_est = 0.8
    delta = ctr_bing - google_ctr_est
    print('{:25s} {:7.2f}% {:7.2f}% {:+9.2f}%'.format(name[:25], ctr_bing, google_ctr_est, delta))

print()
print('=== RECOMMANDATIONS BING ===')
print('1. Bing represente ~{:.0f}% du trafic Google - opportunite non negligeable'.format(ratio_bing_google))
print('2. Les positions Bing sont souvent meilleures que Google (concurrence plus faible)')
print('3. Soumettre le sitemap a Bing Webmaster Tools si pas encore fait')
print('4. Verifier l\'indexation des nouvelles pages sur Bing')
print('5. Optimiser les balises meta specifiquement pour Bing (plus sensibles aux exact-match keywords)')