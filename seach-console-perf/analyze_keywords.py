import csv

filepath = r'C:\Users\prene\Downloads\www.lescalculateurs.fr_KeywordReport_4_19_2026.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    print('Colonnes:', reader.fieldnames)
    lines = list(reader)
    print(f'Nombre de mots-cles: {len(lines)}')
    print()
    
    # Trier par clics
    sorted_by_clicks = sorted(lines, key=lambda r: int(r.get('Clicks', 0)), reverse=True)
    print('=== TOP 25 MOTS-CLES (par clics) ===')
    for i, row in enumerate(sorted_by_clicks[:25]):
        query = row.get('Query', '?')
        clicks = row.get('Clicks', '0')
        impr = row.get('Impressions', '0')
        ctr = row.get('Avg. CTR', '0')
        pos = row.get('Avg. position', '?')
        print(f'{i+1:2d}. [{query}] Clics:{clicks} Impr:{impr} CTR:{ctr}% Pos:{pos}')
    
    print()
    # Trier par impressions
    sorted_by_impr = sorted(lines, key=lambda r: int(r.get('Impressions', 0)), reverse=True)
    print('=== TOP 25 MOTS-CLES (par impressions) ===')
    for i, row in enumerate(sorted_by_impr[:25]):
        query = row.get('Query', '?')
        clicks = row.get('Clicks', '0')
        impr = row.get('Impressions', '0')
        ctr = row.get('Avg. CTR', '0')
        pos = row.get('Avg. position', '?')
        print(f'{i+1:2d}. [{query}] Clics:{clicks} Impr:{impr} CTR:{ctr}% Pos:{pos}')
    
    print()
    # Opportunites: haut volume, position 5-20
    print('=== OPPORTUNITES (Impr > 100, Position 5-20, CTR < 2%) ===')
    opps = [r for r in lines 
            if int(r.get('Impressions', 0)) > 100 
            and 5 <= float(r.get('Avg. position', 30)) <= 20
            and float(r.get('Avg. CTR', 0)) < 2.0]
    opps.sort(key=lambda r: int(r.get('Impressions', 0)), reverse=True)
    for i, row in enumerate(opps[:20]):
        query = row.get('Query', '?')
        clicks = row.get('Clicks', '0')
        impr = row.get('Impressions', '0')
        ctr = row.get('Avg. CTR', '0')
        pos = row.get('Avg. position', '?')
        print(f'{i+1:2d}. [{query}] Clics:{clicks} Impr:{impr} CTR:{ctr}% Pos:{pos}')

    print()
    # Mots-cles gagnants: position 1-3
    print('=== MOTS-CLES GAGNANTS (Position 1-3, Impr > 50) ===')
    winners = [r for r in lines 
               if float(r.get('Avg. position', 99)) <= 3.0
               and int(r.get('Impressions', 0)) > 50]
    winners.sort(key=lambda r: int(r.get('Impressions', 0)), reverse=True)
    for i, row in enumerate(winners[:20]):
        query = row.get('Query', '?')
        clicks = row.get('Clicks', '0')
        impr = row.get('Impressions', '0')
        ctr = row.get('Avg. CTR', '0')
        pos = row.get('Avg. position', '?')
        print(f'{i+1:2d}. [{query}] Clics:{clicks} Impr:{impr} CTR:{ctr}% Pos:{pos}')
    
    print()
    # Analyse par page/theme
    theme_clicks = {}
    theme_impr = {}
    for row in lines:
        query = row.get('Query', '').lower()
        clicks = int(row.get('Clicks', 0))
        impr = int(row.get('Impressions', 0))
        
        themes = []
        if any(w in query for w in ['apl', 'aide personnalis']):
            themes.append('APL')
        if any(w in query for w in ['are', 'allocation retour', 'chomage', 'chômage']):
            themes.append('ARE')
        if any(w in query for w in ['rsa', 'revenu de solidarité']):
            themes.append('RSA')
        if any(w in query for w in ['prime', 'activité', 'activite']):
            themes.append('PRIME')
        if any(w in query for w in ['asf', 'allocation soutien']):
            themes.append('ASF')
        if any(w in query for w in ['aah', 'adulte handicap']):
            themes.append('AAH')
        if any(w in query for w in ['impot', 'impôt', 'revenu', 'fiscale', 'fiscal']):
            themes.append('IMPOT')
        if any(w in query for w in ['taxe', 'foncière', 'fonciere']):
            themes.append('TAXE')
        if any(w in query for w in ['plus-value', 'plusvalue', 'plus value']):
            themes.append('PLUSVALUE')
        if any(w in query for w in ['pret', 'prêt', 'emprunt', 'taux']):
            themes.append('PRET')
        if any(w in query for w in ['notaire', 'notarié', 'frais']):
            themes.append('NOTAIRE')
        if any(w in query for w in ['salaire', 'brut', 'net']):
            themes.append('SALAIRE')
        if any(w in query for w in ['ik', 'indemnité', 'indemnite', 'kilométrique']):
            themes.append('IK')
        if any(w in query for w in ['crypto', 'bourse', 'action']):
            themes.append('CRYPTO')
        
        if not themes:
            themes.append('AUTRE')
        
        for t in themes:
            theme_clicks[t] = theme_clicks.get(t, 0) + clicks
            theme_impr[t] = theme_impr.get(t, 0) + impr
    
    print('=== PERFORMANCE PAR THEME ===')
    theme_sorted = sorted(theme_clicks.keys(), key=lambda t: theme_clicks[t], reverse=True)
    for t in theme_sorted:
        c = theme_clicks[t]
        i = theme_impr[t]
        ctr_val = c/i*100 if i > 0 else 0
        print(f'{t:15s}: {c:5d} clics | {i:6d} impr | CTR {ctr_val:.2f}%')