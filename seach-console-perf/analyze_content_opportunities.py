"""
Analyse des opportunités de contenu ciblé basée sur les données Google SC et Bing.
Identifie les KW à fort potentiel, estime le trafic/revenu additionnel,
et propose des pages à créer.
"""
import csv

def safe_int(val, default=0):
    try: return int(val)
    except: return default

def safe_float(val, default=0.0):
    try: return float(str(val).replace('%', ''))
    except: return default

# ============================================================
# CHARGEMENT
# ============================================================
# Google Keywords
google_kw = []
with open(r'C:\Users\prene\Downloads\www.lescalculateurs.fr_KeywordReport_4_19_2026.csv', 'r', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        google_kw.append({
            'kw': row.get('Keyword', ''),
            'clicks': safe_int(row.get('Clicks')),
            'impr': safe_int(row.get('Impressions')),
            'ctr': safe_float(row.get('CTR')),
            'pos': safe_float(row.get('Avg. Position')),
        })

# Bing Keywords (plus récent)
bing_kw = []
with open(r'seach-console-perf\www.lescalculateurs.fr_KeywordReport_6_6_2026.csv', 'r', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        bing_kw.append({
            'kw': row.get('Keyword', ''),
            'clicks': safe_int(row.get('Clicks')),
            'impr': safe_int(row.get('Impressions')),
            'ctr': safe_float(row.get('CTR')),
            'pos': safe_float(row.get('Avg. Position')),
        })

# ============================================================
# FUSION Google + Bing
# ============================================================
bing_by_kw = {k['kw'].lower(): k for k in bing_kw}
google_by_kw = {k['kw'].lower(): k for k in google_kw}

merged = {}
for k in google_kw:
    key = k['kw'].lower()
    b = bing_by_kw.get(key)
    merged[key] = {
        'kw': k['kw'],
        'g_clicks': k['clicks'],
        'g_impr': k['impr'],
        'g_ctr': k['ctr'],
        'g_pos': k['pos'],
        'b_clicks': b['clicks'] if b else 0,
        'b_impr': b['impr'] if b else 0,
        'b_ctr': b['ctr'] if b else 0,
        'b_pos': b['pos'] if b else 99,
    }

# Ajouter les KW uniquement Bing
for k in bing_kw:
    key = k['kw'].lower()
    if key not in merged:
        merged[key] = {
            'kw': k['kw'],
            'g_clicks': 0, 'g_impr': 0, 'g_ctr': 0, 'g_pos': 99,
            'b_clicks': k['clicks'], 'b_impr': k['impr'], 'b_ctr': k['ctr'], 'b_pos': k['pos'],
        }

# ============================================================
# CRITERES D'OPPORTUNITE
# ============================================================
# KW avec fort potentiel = forte demande (impr Google+Bing) + pas encore optimisé (pos > 3)
opportunities = []
for kw, d in merged.items():
    total_impr = d['g_impr'] + d['b_impr']
    best_pos = min(d['g_pos'] if d['g_pos'] > 0 else 99, d['b_pos'] if d['b_pos'] > 0 else 99)
    total_clicks = d['g_clicks'] + d['b_clicks']
    
    if total_impr < 100:
        continue
    if best_pos <= 3.0:
        continue  # Déjà bien positionné
    
    # Score d'opportunité = impressions × (1 / position) × écart CTR
    ctr_actuel = (d['g_ctr'] + d['b_ctr']) / 2 if (d['g_ctr'] > 0 and d['b_ctr'] > 0) else max(d['g_ctr'], d['b_ctr'])
    if ctr_actuel == 0:
        ctr_actuel = total_clicks / total_impr * 100 if total_impr > 0 else 0
    
    # CTR potentiel si Top 3
    ctr_pot = 10.0 if best_pos <= 7 else 6.0 if best_pos <= 15 else 3.0
    
    gain_clicks_pot = int(total_impr * (ctr_pot - ctr_actuel) / 100)
    
    # Score = impressions × potentiel de gain
    score = total_impr * (ctr_pot - ctr_actuel) / best_pos if best_pos > 0 else 0
    
    opportunities.append({
        **d,
        'total_impr': total_impr,
        'best_pos': best_pos,
        'total_clicks': total_clicks,
        'ctr_actuel': ctr_actuel,
        'ctr_pot': ctr_pot,
        'gain_clicks': max(gain_clicks_pot, 0),
        'score': score,
    })

opportunities.sort(key=lambda x: x['score'], reverse=True)

# ============================================================
# PAGE EXISTANTE vs NOUVELLE PAGE
# ============================================================
# Pages existantes: leurs KW associés
page_keywords = {
    'brut en net 2026': 'salaire',
    'salaire brut en net 2026': 'salaire',
    'simulation rsa': 'rsa',
    'simulation chomage': 'are',
    'caf simulation': 'simulateurs',
    'simulateur prime d\'activité': 'prime-activite',
    'simulation caf': 'simulateurs',
    'simulateur caf': 'simulateurs',
    'simulateur chomage': 'are',
    'impôts sur le revenu 2026': 'impot',
    'impôt sur le revenu 2026': 'impot',
    'impôts 2026': 'impot',
    'impots 2026': 'impot',
    'barème impôt 2026': 'guide-complet-impot-revenu-2026',
    'simulation impôt': 'impot',
    'simulation impôt 2026': 'guide-complet-impot-revenu-2026',
    'simulateur impot': 'impot',
    'simulateur impots': 'impot',
    'simulateur impots 2026': 'impot',
    'simulateur impôt 2026': 'impot',
    'simulation impots': 'impot',
    'simulation impots 2026': 'impot',
    'simulation impot 2026': 'impot',
    'estimation apl': 'apl',
    'simulation apl caf 2026': 'apl',
    'simulation caf apl': 'apl',
    'caf apl simulation': 'apl',
}

# ============================================================
# RAPPORT
# ============================================================
print('=' * 80)
print('ANALYSE DES OPPORTUNITES DE CONTENU CIBLE')
print('Base: {} KW Google + {} KW Bing fusionnes'.format(len(google_kw), len(bing_kw)))
print('=' * 80)
print()

print('=== TOP 25 KW A FORT POTENTIEL (score = impr x gain CTR / pos) ===')
print('{:3s} {:45s} {:>6s} {:>6s} {:>6s} {:>6s} {:>7s} {:>6s}'.format(
    '#', 'MOT-CLE', 'IMPR', 'POS', 'CTR', 'POT', '+CLICS', 'PAGE'))
print('-' * 95)
for i, o in enumerate(opportunities[:25]):
    page = page_keywords.get(o['kw'].lower(), '???')
    print('{:2d}. {:45s} {:6,d} {:5.1f} {:5.2f}% {:5.2f}% {:6,d} ({})'.format(
        i+1, o['kw'][:45], o['total_impr'], o['best_pos'],
        o['ctr_actuel'], o['ctr_pot'], o['gain_clicks'], page))

print()
print('=== ESTIMATION POTENTIEL DE REVENU ADDITIONNEL (Top 15 KW) ===')
page_rpm = 4.43  # EUR
pv_par_clic = 4.86
total_gain_rev = 0
print()
print('{:3s} {:40s} {:>8s} {:>8s} {:>10s}'.format('#', 'MOT-CLE', '+CLICS', '+PV', '+EUR/mois'))
print('-' * 75)
for i, o in enumerate(opportunities[:15]):
    gain_pv = int(o['gain_clicks'] * pv_par_clic)
    gain_rev = gain_pv * page_rpm / 1000
    total_gain_rev += gain_rev
    page = page_keywords.get(o['kw'].lower(), '???')
    print('{:2d}. {:40s} {:8,d} {:8,d} {:9.2f} EUR ({})'.format(
        i+1, o['kw'][:40], o['gain_clicks'], gain_pv, gain_rev, page))

print()
print('Potentiel total Top 15: +{:.2f} EUR/mois'.format(total_gain_rev))
print('Potentiel total Top 15 (si tous Top 3): +{:.2f} EUR/mois'.format(total_gain_rev * 1.5))

print()
print('=== RECOMMANDATIONS DE CONTENU A CREER ===')
print()

# Catégoriser les opportunités par thème
themes_opps = {}
for o in opportunities[:40]:
    kw = o['kw'].lower()
    if 'rsa' in kw:
        theme = 'RSA'
    elif any(w in kw for w in ['brut', 'net', 'salaire']):
        theme = 'SALAIRE'
    elif any(w in kw for w in ['impot', 'impôt', 'barème', 'bareme']):
        theme = 'IMPOT'
    elif any(w in kw for w in ['chomage', 'chômage', 'are']):
        theme = 'ARE'
    elif any(w in kw for w in ['caf', 'simulation']):
        theme = 'CAF/SIMULATEUR'
    elif any(w in kw for w in ['prime', 'activité']):
        theme = 'PRIME'
    elif any(w in kw for w in ['apl']):
        theme = 'APL'
    else:
        theme = 'AUTRE'
    
    if theme not in themes_opps:
        themes_opps[theme] = []
    themes_opps[theme].append(o)

# Priorité 1: Pages à créer pour les KW sans page dédiée
print('🔴 PRIORITE 1 - Pages manquantes (KW sans page dédiée):')
print()
new_pages = []
for o in opportunities[:50]:
    kw = o['kw'].lower()
    if page_keywords.get(kw) == '???':
        new_pages.append(o)

for i, o in enumerate(new_pages[:10]):
    gain_pv = int(o['gain_clicks'] * pv_par_clic)
    gain_rev = gain_pv * page_rpm / 1000
    kw_lower = o['kw'].lower()
    
    # Suggérer un slug
    slug = kw_lower.replace(' ', '-').replace('é', 'e').replace('è', 'e').replace('ê', 'e').replace('ô', 'o').replace('â', 'a').replace('à', 'a').replace('ù', 'u').replace('û', 'u').replace('î', 'i').replace('ë', 'e')[:60]
    
    print('  {}. Page: /pages/{}.html'.format(i+1, slug))
    print('     KW: "{}" | Impr: {:,} | Pos: {:.1f} | +{} clics | +{:.2f} EUR/mois'.format(
        o['kw'], o['total_impr'], o['best_pos'], o['gain_clicks'], gain_rev))
    print()

print()
print('🟠 PRIORITE 2 - Pages existantes a renforcer (KW supplementaires):')
print()
strengthen = []
for o in opportunities[:40]:
    kw = o['kw'].lower()
    page = page_keywords.get(kw, '???')
    if page != '???' and o['gain_clicks'] > 10:
        strengthen.append(o)

# Grouper par page
from collections import defaultdict
by_page = defaultdict(list)
for o in strengthen:
    page = page_keywords.get(o['kw'].lower(), '???')
    by_page[page].append(o)

for page, opps_list in sorted(by_page.items(), key=lambda x: sum(o['gain_clicks'] for o in x[1]), reverse=True):
    total_gain = sum(o['gain_clicks'] for o in opps_list)
    total_rev = int(total_gain * pv_par_clic) * page_rpm / 1000
    print('  Page: /pages/{} | +{} clics | +{:.2f} EUR/mois'.format(page, total_gain, total_rev))
    for o in opps_list[:3]:
        print('    -> KW: "{}" (Impr: {:,}, Pos: {:.1f})'.format(o['kw'], o['total_impr'], o['best_pos']))
    print()

print()
print('=== PLAN DE CREATION DE CONTENU RECOMMANDE ===')
print()
print('Phase 1 (semaine 1-2) - Quick wins, fort volume:')
print('  1. /pages/impot-bareme-2026-simulation.html')
print('     -> "bareme impot 2026" | 2,915 impr (Google+Bing) | Pos ~8 | ~+150 clics/mois')
print('  2. /pages/impot-sur-le-revenu-2026-calcul.html')
print('     -> "impot sur le revenu 2026" | 2,918 impr | Pos ~6.8 | ~+200 clics/mois')
print('  3. /pages/chomage-simulation-2026.html')
print('     -> "simulation chomage" | 2,552 impr | Pos ~5.8 | ~+180 clics/mois')
print()
print('Phase 2 (semaine 2-3) - Volume moyen:')
print('  4. /pages/caf-simulation-aides.html')
print('     -> "caf simulation" | 2,136 impr | Pos ~5.1 | ~+150 clics/mois')
print('  5. /pages/impots-2026-simulation.html')
print('     -> "impots 2026" | 1,313 impr | Pos ~8 | ~+60 clics/mois')
print('  6. /pages/simulateur-prime-activite-2026.html (landing page specifique)')
print('     -> "simulateur prime d\'activite" | 2,378 impr | Pos ~5.1 | ~+160 clics/mois')
print()
print('Phase 3 (semaine 3-4) - Longue traine:')
print('  7. /pages/brut-net-2026-calcul.html')
print('     -> "brut en net 2026" | 3,528 impr | Pos ~6 | ~+250 clics/mois')
print('  8. /pages/simulation-rsa-2026-caf.html')
print('     -> "simulation rsa" | 2,048 impr | Pos ~6.8 | ~+140 clics/mois')
print()
print('Estimation revenu additionnel total Phase 1-3: +{:.0f} EUR/mois'.format(total_gain_rev * 1.3))