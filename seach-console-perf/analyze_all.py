import csv
from datetime import datetime

# ============================================================
# 1. CHARGEMENT ADSENSE QUOTIDIEN (report 1)
# ============================================================
adsense_daily = []
with open(r'seach-console-perf/report (1).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        adsense_daily.append({
            'date': row['Date'],
            'earnings': float(row['Estimated earnings (EUR)']),
            'page_views': int(row['Page views']),
            'page_rpm': float(row['Page RPM (EUR)']),
            'impressions': int(row['Impressions']),
            'impression_rpm': float(row['Impression RPM (EUR)']),
            'active_view': float(row['Active View Viewable']),
            'clicks': int(row['Clicks'])
        })

# ============================================================
# 2. CHARGEMENT ADSENSE PAR PAGE (report 2)
# ============================================================
adsense_pages = []
with open(r'seach-console-perf/report (2).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        adsense_pages.append({
            'url': row['Page URL'],
            'earnings': float(row['Estimated earnings (EUR)']),
            'page_views': int(row['Page views']),
            'page_rpm': float(row['Page RPM (EUR)']),
            'impressions': int(row['Impressions']),
            'impression_rpm': float(row['Impression RPM (EUR)']),
            'active_view': float(row['Active View Viewable']),
            'clicks': int(row['Clicks'])
        })

# ============================================================
# 3. CHARGEMENT SEARCH CONSOLE
# ============================================================
sc_daily = []
with open(r'seach-console-perf/www.lescalculateurs.fr_SearchPerformanceOverview_All_6_6_2026.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        dt_str = row['Date'].replace(' 12:00:00 AM', '')
        parts = dt_str.split('/')
        dt = datetime(int(parts[2]), int(parts[0]), int(parts[1]))
        sc_daily.append({
            'date': dt.strftime('%Y-%m-%d'),
            'clicks': int(row['Clicks']),
            'impressions': int(row['Impressions']),
            'avg_ctr': float(row['Avg. CTR'])
        })

print('=== DONNEES CHARGEES ===')
print(f'AdSense jours: {len(adsense_daily)}')
print(f'AdSense pages: {len(adsense_pages)}')
print(f'Search Console jours: {len(sc_daily)}')
print()

# ============================================================
# 4. ANALYSE ADSENSE QUOTIDIENNE
# ============================================================
total_earnings = sum(d['earnings'] for d in adsense_daily)
total_page_views = sum(d['page_views'] for d in adsense_daily)
total_ad_impressions = sum(d['impressions'] for d in adsense_daily)
total_ad_clicks = sum(d['clicks'] for d in adsense_daily)
avg_page_rpm = total_earnings / total_page_views * 1000 if total_page_views > 0 else 0
avg_active_view = sum(d['active_view'] for d in adsense_daily) / len(adsense_daily)
ad_ctr = total_ad_clicks / total_ad_impressions * 100 if total_ad_impressions > 0 else 0
avg_impression_rpm = sum(d['impression_rpm'] for d in adsense_daily) / len(adsense_daily)

print('=== ADSENSE - RESUME 30 JOURS (7 mai - 5 juin 2026) ===')
print(f'Revenu total estime: {total_earnings:.2f} EUR')
print(f'Revenu moyen / jour: {total_earnings/len(adsense_daily):.2f} EUR')
print(f'Revenu projete / mois: {total_earnings/len(adsense_daily)*30:.2f} EUR')
print(f'Revenu projete / an: {total_earnings/len(adsense_daily)*365:.2f} EUR')
print(f'Pages vues totales: {total_page_views}')
print(f'Pages vues / jour: {total_page_views/len(adsense_daily):.0f}')
print(f'Page RPM moyen: {avg_page_rpm:.2f} EUR')
print(f'Impressions pubs totales: {total_ad_impressions}')
print(f'Impression RPM moyen: {avg_impression_rpm:.2f} EUR')
print(f'CTR pubs: {ad_ctr:.2f}%')
print(f'Active View moyen: {avg_active_view*100:.1f}%')
print(f'Clics pubs totaux: {total_ad_clicks}')
print()

# Tendance AdSense (2 periodes)
mid = len(adsense_daily) // 2
first_half = adsense_daily[:mid]
second_half = adsense_daily[mid:]
first_earn = sum(d['earnings'] for d in first_half)
second_earn = sum(d['earnings'] for d in second_half)
print(f'Revenu 15 premiers jours: {first_earn:.2f} EUR')
print(f'Revenu 15 derniers jours: {second_earn:.2f} EUR')
print(f'Evolution: {((second_earn-first_earn)/first_earn*100):.1f}%')
print()

# ============================================================
# 5. ANALYSE ADSENSE PAR PAGE
# ============================================================
print('=== ADSENSE - TOP PAGES ===')
for p in adsense_pages:
    name = p['url'].split('/')[-1].upper()
    print(f'  {name}: {p["earnings"]:.2f} EUR | {p["page_views"]} PV | RPM {p["page_rpm"]:.2f} EUR | Active View {p["active_view"]*100:.1f}%')
print()

# ============================================================
# 6. ANALYSE SEARCH CONSOLE
# ============================================================
total_sc_clicks = sum(d['clicks'] for d in sc_daily)
total_sc_impressions = sum(d['impressions'] for d in sc_daily)
avg_ctr = total_sc_clicks / total_sc_impressions * 100 if total_sc_impressions > 0 else 0

print('=== SEARCH CONSOLE - RESUME (3 mars - 3 juin 2026) ===')
print(f'Clics totaux: {total_sc_clicks}')
print(f'Clics moyens / jour: {total_sc_clicks/len(sc_daily):.0f}')
print(f'Impressions totales: {total_sc_impressions}')
print(f'Impressions moyennes / jour: {total_sc_impressions/len(sc_daily):.0f}')
print(f'CTR moyen global: {avg_ctr:.2f}%')
print()

# Tendance mois par mois
months = {'Mars': '2026-03', 'Avril': '2026-04', 'Mai': '2026-05', 'Juin (partiel)': '2026-06'}
for label, prefix in months.items():
    data = [d for d in sc_daily if d['date'].startswith(prefix)]
    if data:
        c = sum(d['clicks'] for d in data)
        i = sum(d['impressions'] for d in data)
        ctr = c/i*100 if i > 0 else 0
        print(f'{label}: {len(data)}j | Clics: {c} ({c/len(data):.0f}/j) | Impr: {i} ({i/len(data):.0f}/j) | CTR: {ctr:.2f}%')
print()

# ============================================================
# 7. CROISEMENT: jours communs (7 mai - 3 juin)
# ============================================================
adsense_by_date = {d['date']: d for d in adsense_daily}
sc_by_date = {d['date']: d for d in sc_daily}

common_dates = sorted(set(adsense_by_date.keys()) & set(sc_by_date.keys()))
print(f'=== CROISEMENT: {len(common_dates)} jours communs (Search Console + AdSense) ===')

sc_clicks_common = 0
sc_impr_common = 0
ad_earn_common = 0
ad_pv_common = 0
for dt in common_dates:
    sc_clicks_common += sc_by_date[dt]['clicks']
    sc_impr_common += sc_by_date[dt]['impressions']
    ad_earn_common += adsense_by_date[dt]['earnings']
    ad_pv_common += adsense_by_date[dt]['page_views']

n = len(common_dates)
print(f'Clics Search Console: {sc_clicks_common} ({sc_clicks_common/n:.0f}/j)')
print(f'Impressions Search Console: {sc_impr_common} ({sc_impr_common/n:.0f}/j)')
print(f'Pages vues AdSense: {ad_pv_common} ({ad_pv_common/n:.0f}/j)')
print(f'Revenus AdSense: {ad_earn_common:.2f} EUR ({ad_earn_common/n:.2f} EUR/j)')
print(f'Ratio PV / Clics SC: {ad_pv_common/sc_clicks_common:.2f} PV par clic SC')
print(f'Ratio Revenu / Clic SC: {ad_earn_common/sc_clicks_common*100:.2f} centimes par clic SC')
print(f'Ratio Revenu / 1000 Impr SC: {ad_earn_common/sc_impr_common*1000:.3f} EUR pour 1000 impressions SC')
print()

# ============================================================
# 8. TOP 5 MEILLEURS/PIRES JOURS
# ============================================================
print('=== TOP 5 MEILLEURS JOURS (revenu AdSense) ===')
top5 = sorted(adsense_daily, key=lambda x: x['earnings'], reverse=True)[:5]
for d in top5:
    sc_info = ''
    if d['date'] in sc_by_date:
        sc = sc_by_date[d['date']]
        sc_info = f' | SC: {sc["clicks"]} clics, {sc["impressions"]} impr, CTR {sc["avg_ctr"]:.2f}%'
    print(f'  {d["date"]}: {d["earnings"]:.2f} EUR | {d["page_views"]} PV | RPM {d["page_rpm"]:.2f}{sc_info}')

print()
print('=== TOP 5 PIRES JOURS (revenu AdSense) ===')
bottom5 = sorted(adsense_daily, key=lambda x: x['earnings'])[:5]
for d in bottom5:
    sc_info = ''
    if d['date'] in sc_by_date:
        sc = sc_by_date[d['date']]
        sc_info = f' | SC: {sc["clicks"]} clics, {sc["impressions"]} impr, CTR {sc["avg_ctr"]:.2f}%'
    print(f'  {d["date"]}: {d["earnings"]:.2f} EUR | {d["page_views"]} PV | RPM {d["page_rpm"]:.2f}{sc_info}')

print()
# Jours semaine vs weekend
weekdays_adsense = [d for d in adsense_daily if datetime.strptime(d['date'], '%Y-%m-%d').weekday() < 5]
weekend_adsense = [d for d in adsense_daily if datetime.strptime(d['date'], '%Y-%m-%d').weekday() >= 5]

print('=== SEMAINE VS WEEKEND (AdSense) ===')
wd_avg_earn = sum(d['earnings'] for d in weekdays_adsense) / len(weekdays_adsense)
we_avg_earn = sum(d['earnings'] for d in weekend_adsense) / len(weekend_adsense)
wd_avg_pv = sum(d['page_views'] for d in weekdays_adsense) / len(weekdays_adsense)
we_avg_pv = sum(d['page_views'] for d in weekend_adsense) / len(weekend_adsense)
wd_avg_rpm = sum(d['page_rpm'] for d in weekdays_adsense) / len(weekdays_adsense)
we_avg_rpm = sum(d['page_rpm'] for d in weekend_adsense) / len(weekend_adsense)
print(f'Semaine ({len(weekdays_adsense)}j): {wd_avg_earn:.2f} EUR/j | PV: {wd_avg_pv:.0f}/j | RPM: {wd_avg_rpm:.2f} EUR')
print(f'Weekend ({len(weekend_adsense)}j): {we_avg_earn:.2f} EUR/j | PV: {we_avg_pv:.0f}/j | RPM: {we_avg_rpm:.2f} EUR')
print(f'Delta semaine/weekend: {((wd_avg_earn-we_avg_earn)/we_avg_earn*100):.1f}% de revenu en plus en semaine')

print()
# Evolution du RPM par semaine
print('=== EVOLUTION HEBDOMADAIRE DU RPM ===')
week_groups = {}
for d in adsense_daily:
    dt = datetime.strptime(d['date'], '%Y-%m-%d')
    iso = dt.isocalendar()
    week_key = f'{iso[0]}-W{iso[1]:02d}'
    if week_key not in week_groups:
        week_groups[week_key] = []
    week_groups[week_key].append(d)

for wk in sorted(week_groups.keys()):
    data = week_groups[wk]
    earn = sum(d['earnings'] for d in data)
    pv = sum(d['page_views'] for d in data)
    rpm = earn / pv * 1000 if pv > 0 else 0
    print(f'  {wk}: {earn:.2f} EUR | {pv} PV | RPM {rpm:.2f} EUR')

# ============================================================
# 9. CORRELATION SC <> ADSENSE
# ============================================================
print()
print('=== ANALYSE DE CORRELATION SC <> ADSENSE ===')
if len(common_dates) >= 5:
    sc_clicks_vals = [sc_by_date[dt]['clicks'] for dt in common_dates]
    sc_impr_vals = [sc_by_date[dt]['impressions'] for dt in common_dates]
    ad_pv_vals = [adsense_by_date[dt]['page_views'] for dt in common_dates]
    ad_earn_vals = [adsense_by_date[dt]['earnings'] for dt in common_dates]

    # Calcul correlation simple
    def pearson_r(x, y):
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(a*b for a,b in zip(x,y))
        sum_x2 = sum(a*a for a in x)
        sum_y2 = sum(b*b for b in y)
        num = n*sum_xy - sum_x*sum_y
        den = ((n*sum_x2 - sum_x**2) * (n*sum_y2 - sum_y**2))**0.5
        return num/den if den != 0 else 0

    r_sc_pv = pearson_r(sc_clicks_vals, ad_pv_vals)
    r_sc_earn = pearson_r(sc_clicks_vals, ad_earn_vals)
    r_impr_pv = pearson_r(sc_impr_vals, ad_pv_vals)
    print(f'Correlation Clics SC <> Pages Vues: r = {r_sc_pv:.3f}')
    print(f'Correlation Clics SC <> Revenus: r = {r_sc_earn:.3f}')
    print(f'Correlation Impr SC <> Pages Vues: r = {r_impr_pv:.3f}')
    print('(r proche de 1 = forte correlation positive, r proche de 0 = pas de correlation)')

print()
print('=== RECOMMANDATIONS PRELIMINAIRES ===')
print(f'1. Revenu mensuel actuel ~{total_earnings/len(adsense_daily)*30:.0f} EUR - Objectif 100 EUR/mois')
print(f'2. Page RPM moyen {avg_page_rpm:.2f} EUR - Ameliorer le placement des pubs')
print(f'3. Active View {avg_active_view*100:.1f}% - Optimiser la visibilite des annonces')
print(f'4. CTR pubs {ad_ctr:.2f}% - Tester de nouveaux formats/emplacements')
print(f'5. CTR Search Console {avg_ctr:.2f}% - Travailler les meta titles/descriptions')
print(f'6. Pages vues/jour {total_page_views/len(adsense_daily):.0f} - Augmenter le trafic (SEO + contenu)')
if r_sc_pv > 0.6:
    print('7. BONNE correlation SC <> PV => le SEO drive le revenu. Continuer a pousser le contenu!')
else:
    print('7. Correlation SC <> PV moderee => le trafic direct/social/residual est important')