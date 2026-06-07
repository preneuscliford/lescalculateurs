"""
Intégration des données SEMrush pour identifier les opportunités concurrentielles.
Combine les volumes SEMrush avec les positions réelles (SC + Bing) pour prioriser.
"""

# ============================================================
# DONNÉES SEMRUSH (fournies par l'utilisateur)
# ============================================================
semrush_data = [
    # (mot_cle, volume_mensuel, position_lescalculateurs, position_vos_aides, kd_pct, cpc)
    ("garantie visale", 135000, None, None, 0, 0),  # Non classé = énorme opportunité
    ("allocation familiale", 60500, None, None, 0, 0),
    ("aspa", 49500, None, None, 0, 0),
    ("carte famille nombreuse", 40500, None, None, 0, 0),
    ("simulation caf", 40500, None, None, 0, 0),  # Volume énorme, à vérifier
    ("simulation prime d'activité", 74000, 14, 15, 37, 0.54),
    ("simulation rsa", 18100, 4, 16, 30, 0.66),
    ("caf simulation prime d'activité", 5400, 12, 23, 48, 0.00),
    ("rsa simulation", 5400, 9, 19, 32, 0.66),
    ("simulation du rsa caf", 4400, 10, 12, 42, 0.59),
    ("simulateur rsa", 3600, 7, 17, 31, 0.66),
    ("calcul des apl", 2400, 8, 18, 44, 0.61),
    ("simulation logement caf", 2400, 23, 47, 61, 0.00),
    ("caf simulateur prime d'activité", 1900, 21, 35, 54, 0.00),
    ("calcul chomage simulation", 1900, 17, 54, 32, 0.00),
]

# Mapping SEMrush KW → page existante ou nouvelle page
semrush_opportunities = []

for kw, volume, pos_lc, pos_va, kd, cpc in semrush_data:
    kw_lower = kw.lower()
    
    # Déterminer si page existe déjà
    existing_page = None
    page_type = "NOUVELLE"
    
    if any(w in kw_lower for w in ['prime', 'activité', 'activite']):
        existing_page = "/pages/prime-activite"
        page_type = "EXISTANTE"
    elif 'rsa' in kw_lower:
        existing_page = "/pages/rsa"
        page_type = "EXISTANTE"
    elif 'apl' in kw_lower or 'logement' in kw_lower:
        existing_page = "/pages/apl"
        page_type = "EXISTANTE"
    elif 'chomage' in kw_lower or 'chômage' in kw_lower:
        existing_page = "/pages/are"
        page_type = "EXISTANTE"
    elif 'caf' in kw_lower and 'simulation' in kw_lower:
        existing_page = "/pages/simulateurs"
        page_type = "EXISTANTE"
    
    # Score d'opportunité
    if pos_lc is None:
        # Non classé = opportunité maximale
        opportunity_score = volume * 1.0  # 100% du volume est à capter
        priority = "CRITIQUE"
        clicks_pot = int(volume * 0.35)  # ~35% du volume si Top 3
    elif pos_lc <= 3:
        opportunity_score = volume * 0.05  # Déjà bien classé, faible marge
        priority = "FAIBLE"
        clicks_pot = int(volume * 0.02)
    elif pos_lc <= 7:
        opportunity_score = volume * 0.60
        priority = "HAUTE"
        clicks_pot = int(volume * 0.15)
    elif pos_lc <= 15:
        opportunity_score = volume * 0.35
        priority = "MOYENNE"
        clicks_pot = int(volume * 0.08)
    else:
        opportunity_score = volume * 0.15
        priority = "BASSE"
        clicks_pot = int(volume * 0.03)
    
    # Bonus si on bat déjà le concurrent
    if pos_lc is not None and pos_va is not None and pos_lc < pos_va:
        priority = "DEFENDRE" if priority == "FAIBLE" else priority
        opportunity_score *= 1.2
    
    # Revenu potentiel
    page_rpm = 4.43
    pv_par_clic = 4.86
    pv_pot = int(clicks_pot * pv_par_clic)
    rev_pot = round(pv_pot * page_rpm / 1000, 2)
    
    semrush_opportunities.append({
        'kw': kw,
        'volume': volume,
        'pos_lc': pos_lc,
        'pos_va': pos_va,
        'kd': kd,
        'cpc': cpc,
        'existing_page': existing_page,
        'page_type': page_type,
        'score': opportunity_score,
        'priority': priority,
        'clicks_pot': clicks_pot,
        'rev_pot': rev_pot,
    })

# Trier par score
semrush_opportunities.sort(key=lambda x: x['score'], reverse=True)

# ============================================================
# RAPPORT
# ============================================================
print('=' * 90)
print('ANALYSE SEMRUSH - OPPORTUNITES CONCURRENTIELLES')
print('Comparaison: lescalculateurs.fr vs vos-aides.fr')
print('=' * 90)
print()

print('=== TOP OPPORTUNITES (classées par potentiel) ===')
print('{:3s} {:40s} {:>8s} {:>5s} {:>5s} {:>4s} {:>9s} {:>9s} {:>10s}'.format(
    '#', 'MOT-CLE', 'VOLUME', 'POS', 'POS', 'KD', 'PRIORITE', '+CLICS', '+EUR/mois'))
print('{:3s} {:40s} {:>8s} {:>5s} {:>5s} {:>4s} {:>9s} {:>9s} {:>10s}'.format(
    '', '', '', 'LC', 'VA', '', '', '', ''))
print('-' * 95)
for i, o in enumerate(semrush_opportunities):
    pos_lc_str = str(o['pos_lc']) if o['pos_lc'] else '--'
    pos_va_str = str(o['pos_va']) if o['pos_va'] else '--'
    print('{:2d}. {:40s} {:8,d} {:>4s} {:>4s} {:>3d}% {:>9s} {:9,d} {:9.2f} EUR'.format(
        i+1, o['kw'][:40], o['volume'],
        pos_lc_str, pos_va_str,
        o['kd'], o['priority'],
        o['clicks_pot'], o['rev_pot']))

print()
print('=== PLAN D\'ACTION PAR PRIORITE ===')
print()

# Grouper par priorité
from collections import defaultdict
by_priority = defaultdict(list)
for o in semrush_opportunities:
    by_priority[o['priority']].append(o)

priority_order = ['CRITIQUE', 'HAUTE', 'MOYENNE', 'DEFENDRE', 'BASSE', 'FAIBLE']
priority_labels = {
    'CRITIQUE': '🔴 CRITIQUE - Non classé, volume énorme',
    'HAUTE': '🟠 HAUTE - Position 4-7, fort volume',
    'MOYENNE': '🟡 MOYENNE - Position 8-15, volume significatif',
    'DEFENDRE': '🟢 DEFENDRE - On bat le concurrent, à sécuriser',
    'BASSE': '⚪ BASSE - Position >15, volume modéré',
    'FAIBLE': '✅ FAIBLE - Déjà Top 3, maintenir',
}

total_rev_all = 0
for p in priority_order:
    opps = by_priority.get(p, [])
    if not opps:
        continue
    print(priority_labels[p])
    print('-' * 60)
    for o in opps:
        total_rev_all += o['rev_pot']
        page_info = '→ ' + o['existing_page'] if o['existing_page'] else '→ [NOUVELLE PAGE]'
        pos_str = 'Pos #{}'.format(o['pos_lc']) if o['pos_lc'] else 'Non classé'
        competitor = ' (vos-aides.fr #{}), '.format(o['pos_va']) if o['pos_va'] else ''
        print('  {} - Vol: {:,}/mois | {} {}| +{:,} clics | +{:.2f} EUR/mois {}'.format(
            o['kw'], o['volume'], pos_str,
            'KD: {}%'.format(o['kd']) if o['kd'] > 0 else '',
            o['clicks_pot'], o['rev_pot'], page_info))
    print()

print()
print('=== RECOMMANDATIONS STRATÉGIQUES ===')
print()
print('🔴 NOUVELLES PAGES À CRÉER (non classé, fort volume):')
new_opps = [o for o in semrush_opportunities if o['pos_lc'] is None]
for o in new_opps:
    slug = o['kw'].lower().replace(' ', '-').replace('é', 'e').replace('è', 'e').replace('ê', 'e').replace('ô', 'o')[:60]
    print('  📄 /pages/{}.html - "{}" ({:,} vol/mois, +{:.2f} EUR/mois)'.format(
        slug, o['kw'], o['volume'], o['rev_pot']))

print()
print('🟠 PAGES EXISTANTES À RENFORCER (classé mais pas Top 3):')
existing_opps = [o for o in semrush_opportunities if o['existing_page'] and o['pos_lc'] and o['pos_lc'] > 3]
for o in existing_opps:
    print('  🔧 {} - "{}" (Pos #{}, Vol: {:,}/mois, +{:.2f} EUR/mois)'.format(
        o['existing_page'], o['kw'], o['pos_lc'], o['volume'], o['rev_pot']))

print()
print('🟢 POSITIONS À DÉFENDRE (on bat vos-aides.fr):')
defend_opps = [o for o in semrush_opportunities if o['pos_lc'] and o['pos_va'] and o['pos_lc'] < o['pos_va']]
for o in defend_opps:
    print('  🛡️ "{}" - LC #{}, VA #{}, Vol: {:,}/mois'.format(o['kw'], o['pos_lc'], o['pos_va'], o['volume']))

print()
print('=== POTENTIEL FINANCIER TOTAL ===')
print('Revenu additionnel potentiel (si tous les KW atteignent Top 3): +{:.2f} EUR/mois'.format(total_rev_all))
print('Revenu additionnel réaliste (50% du potentiel): +{:.2f} EUR/mois'.format(total_rev_all * 0.5))
print()
print('=== COMPARAISON AVEC LE PLAN D\'ACTION PRÉCÉDENT ===')
print('Analyse Search Console + Bing: +60-80 EUR/mois (20 pages)')
print('Analyse SEMrush (nouveaux KW): +{:.0f} EUR/mois réalistes (15 KW prioritaires)'.format(total_rev_all * 0.5))
print('TOTAL COMBINÉ: +{:.0f} EUR/mois'.format(80 + total_rev_all * 0.5))