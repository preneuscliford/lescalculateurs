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

filepath = r'C:\Users\prene\Downloads\www.lescalculateurs.fr_KeywordReport_4_19_2026.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    lines = list(reader)

print('Nombre de mots-cles: {}'.format(len(lines)))
print()

# Trier par clics
sorted_by_clicks = sorted(lines, key=lambda r: safe_int(r.get('Clicks', 0)), reverse=True)
print('=== TOP 25 MOTS-CLES (par clics) ===')
for i, row in enumerate(sorted_by_clicks[:25]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.2f}% Pos:{:.1f}'.format(i+1, kw[:80], clicks, impr, ctr, pos))

print()
# Trier par impressions
sorted_by_impr = sorted(lines, key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
print('=== TOP 25 MOTS-CLES (par impressions) ===')
for i, row in enumerate(sorted_by_impr[:25]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.2f}% Pos:{:.1f}'.format(i+1, kw[:80], clicks, impr, ctr, pos))

print()
# OPPORTUNITES: haut volume, position 5-20
print('=== OPPORTUNITES SEO (Impr > 100, Position 5-20) ===')
opps = []
for r in lines:
    impr = safe_int(r.get('Impressions', 0))
    pos = safe_float(r.get('Avg. Position', 30))
    if impr > 100 and 5 <= pos <= 20:
        opps.append(r)
opps.sort(key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
for i, row in enumerate(opps[:25]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.2f}% Pos:{:.1f}'.format(i+1, kw[:80], clicks, impr, ctr, pos))

print()
# MOTS-CLES GAGNANTS (position 1-3)
print('=== MOTS-CLES GAGNANTS (Position 1-3, Impr > 50) ===')
winners = []
for r in lines:
    impr = safe_int(r.get('Impressions', 0))
    pos = safe_float(r.get('Avg. Position', 99))
    if pos <= 3.0 and impr > 50:
        winners.append(r)
winners.sort(key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
for i, row in enumerate(winners[:30]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.2f}% Pos:{:.1f}'.format(i+1, kw[:80], clicks, impr, ctr, pos))

print()
# FORT POTENTIEL (Impr > 500, Pos 3-7)
print('=== FORT POTENTIEL (Impr > 500, Pos 3-7) ===')
potential = []
for r in lines:
    impr = safe_int(r.get('Impressions', 0))
    pos = safe_float(r.get('Avg. Position', 99))
    if impr > 500 and 3 <= pos <= 7:
        potential.append(r)
potential.sort(key=lambda r: safe_int(r.get('Impressions', 0)), reverse=True)
for i, row in enumerate(potential[:20]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    ctr = clean_ctr(row.get('CTR'))
    pos = safe_float(row.get('Avg. Position', 99))
    print('{:2d}. [{}] Clics:{} Impr:{} CTR:{:.2f}% Pos:{:.1f}'.format(i+1, kw[:80], clicks, impr, ctr, pos))

print()
# ANALYSE PAR THEME
def classify_theme(query):
    q = query.lower()
    themes = []
    if any(w in q for w in ['apl', 'aide personnalis', 'logement']):
        themes.append('APL')
    if any(w in q for w in ['are', 'allocation retour', 'chomage', 'pole emploi', 'france travail']):
        themes.append('ARE')
    if any(w in q for w in ['rsa', 'revenu de solidarite', 'solidarite']):
        themes.append('RSA')
    if any(w in q for w in ['prime', 'activite']):
        themes.append('PRIME')
    if any(w in q for w in ['asf', 'allocation soutien', 'familial']):
        themes.append('ASF')
    if any(w in q for w in ['aah', 'adulte handicap', 'handicap']):
        themes.append('AAH')
    if any(w in q for w in ['impot', 'imposition', 'fiscale', 'fiscal']):
        themes.append('IMPOT')
    if any(w in q for w in ['taxe', 'fonciere']):
        themes.append('TAXE')
    if any(w in q for w in ['plus-value', 'plusvalue', 'plus value', 'immobilier']):
        themes.append('PLUSVALUE')
    if any(w in q for w in ['pret', 'emprunt', 'taux', 'credit']):
        themes.append('PRET')
    if any(w in q for w in ['notaire', 'notarie', 'frais de notaire']):
        themes.append('NOTAIRE')
    if any(w in q for w in ['salaire', 'brut', 'net', 'salarial']):
        themes.append('SALAIRE')
    if any(w in q for w in ['ik', 'indemnite', 'kilometrique']):
        themes.append('IK')
    if any(w in q for w in ['crypto', 'bourse', 'action', 'pea', 'dividende']):
        themes.append('CRYPTO')
    if not themes:
        if any(w in q for w in ['simulateur', 'simulation', 'calculateur']):
            themes.append('SIMULATEUR')
        elif any(w in q for w in ['tranche', 'bareme', 'plafond', 'montant']):
            themes.append('BAREMES')
        else:
            themes.append('AUTRE')
    return themes

theme_clicks = {}
theme_impr = {}
theme_kw_count = {}
for row in lines:
    kw = row.get('Keyword', '')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    themes = classify_theme(kw)
    for t in themes:
        theme_clicks[t] = theme_clicks.get(t, 0) + clicks
        theme_impr[t] = theme_impr.get(t, 0) + impr
        theme_kw_count[t] = theme_kw_count.get(t, 0) + 1

print('=== PERFORMANCE PAR THEME ===')
theme_sorted = sorted(theme_clicks.keys(), key=lambda t: theme_clicks[t], reverse=True)
total_clicks = sum(theme_clicks.values())
fmt_hdr = '{:12s} {:>6s} {:>8s} {:>8s} {:>7s} {:>6s}'
print(fmt_hdr.format('THEME', 'CLICS', 'IMPR', 'CTR', '%CLICS', 'MOTS'))
print('-' * 55)
for t in theme_sorted:
    c = theme_clicks[t]
    i = theme_impr[t]
    ctr_val = c/i*100 if i > 0 else 0
    pct = c/total_clicks*100 if total_clicks > 0 else 0
    n = theme_kw_count[t]
    fmt = '{:12s} {:6d} {:8d} {:7.2f}% {:6.1f}% {:6d}'
    print(fmt.format(t, c, i, ctr_val, pct, n))

print()
# STATISTIQUES GLOBALES
total_clicks_all = sum(safe_int(r.get('Clicks', 0)) for r in lines)
total_impr_all = sum(safe_int(r.get('Impressions', 0)) for r in lines)
avg_ctr_all = total_clicks_all / total_impr_all * 100 if total_impr_all > 0 else 0
positions = [safe_float(r.get('Avg. Position', 0)) for r in lines]
positions = [p for p in positions if p > 0]
avg_pos_all = sum(positions) / len(positions) if positions else 0

print('=== STATISTIQUES GLOBALES MOTS-CLES ===')
print('Clics totaux: {}'.format(total_clicks_all))
print('Impressions totales: {}'.format(total_impr_all))
print('CTR moyen: {:.2f}%'.format(avg_ctr_all))
print('Position moyenne: {:.1f}'.format(avg_pos_all))

# Distribution des positions
pos_bins = {'1-3': 0, '4-7': 0, '8-15': 0, '16-30': 0, '30+': 0}
for r in lines:
    pos = safe_float(r.get('Avg. Position', 99))
    if pos <= 0:
        continue
    if pos <= 3:
        pos_bins['1-3'] += 1
    elif pos <= 7:
        pos_bins['4-7'] += 1
    elif pos <= 15:
        pos_bins['8-15'] += 1
    elif pos <= 30:
        pos_bins['16-30'] += 1
    else:
        pos_bins['30+'] += 1

total_pos = sum(pos_bins.values())
print()
print('=== DISTRIBUTION DES POSITIONS ===')
for bin_name, count in pos_bins.items():
    pct_bin = count / total_pos * 100 if total_pos > 0 else 0
    bar = '#' * int(pct_bin)
    print('{:6s}: {:4d} ({:5.1f}%) {}'.format(bin_name, count, pct_bin, bar))

print()
print('=== ESTIMATION POTENTIEL DE REVENU PAR AMELIORATION DE RANG ===')
page_rpm = 4.43
pv_par_clic = 4.86
print('(Base: RPM={:.2f}EUR, PV/clic SC={:.2f})'.format(page_rpm, pv_par_clic))
print()
for i, row in enumerate(sorted_by_impr[:15]):
    kw = row.get('Keyword', '?')
    clicks = safe_int(row.get('Clicks', 0))
    impr = safe_int(row.get('Impressions', 0))
    pos = safe_float(row.get('Avg. Position', 99))
    ctr_actuel = clean_ctr(row.get('CTR'))
    if pos > 3 and impr > 100:
        if pos <= 7:
            ctr_pot = 0.10
        elif pos <= 15:
            ctr_pot = 0.06
        else:
            ctr_pot = 0.03
        clicks_pot = int(impr * ctr_pot)
        gain_clics = clicks_pot - clicks
        gain_pv = int(gain_clics * pv_par_clic)
        gain_rev = gain_pv * page_rpm / 1000
        if gain_clics > 3:
            print('  [{}]'.format(kw[:70]))
            print('    Pos:{:.1f} CTR:{:.2f}% => CTR pot:{:.0f}% | +{} clics | +{} PV | +{:.2f} EUR/mois'.format(
                pos, ctr_actuel, ctr_pot*100, gain_clics, gain_pv, gain_rev))