"""Generate sitemap.xml in public/ folder"""
from datetime import date

today = date.today().isoformat()
base = 'https://www.lescalculateurs.fr'

pages = [
    '',
    '/pages/apl', '/pages/are', '/pages/rsa', '/pages/impot', '/pages/prime-activite',
    '/pages/asf', '/pages/aah', '/pages/salaire', '/pages/pret', '/pages/taxe',
    '/pages/plusvalue', '/pages/notaire', '/pages/charges', '/pages/ik', '/pages/ponts',
    '/pages/travail', '/pages/financement', '/pages/crypto-bourse', '/pages/simulateurs',
    '/pages/apl-etudiant', '/pages/apl-zones', '/pages/apl-dom-tom', '/pages/blog',
    '/pages/guide-complet-impot-revenu-2026', '/pages/salaire-brut-net-calcul-2026',
    '/pages/rsa-vs-smic', '/pages/comment-calculer-frais-notaire',
    '/pages/comment-calculer-plus-value', '/pages/methodologie', '/pages/sources',
    '/pages/a-propos', '/pages/mentions-legales', '/pages/historique-mises-a-jour',
    '/pages/salaire-net-apres-impot', '/pages/reste-a-vivre', '/pages/cout-reel-voiture',
    # Nouvelles pages SEMrush
    '/pages/allocation-familiale',
    '/pages/aspa',
    '/pages/carte-famille-nombreuse',
    '/pages/garantie-visale',
]

xml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]

for p in pages:
    priority = '1.0' if p == '' else '0.9' if p.startswith('/pages/apl') or p in ['/pages/are', '/pages/rsa', '/pages/impot'] else '0.8'
    xml_lines.append('  <url>')
    xml_lines.append(f'    <loc>{base}{p}</loc>')
    xml_lines.append(f'    <lastmod>{today}</lastmod>')
    xml_lines.append('    <changefreq>weekly</changefreq>')
    xml_lines.append(f'    <priority>{priority}</priority>')
    xml_lines.append('  </url>')

xml_lines.append('</urlset>')

with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write('\n'.join(xml_lines))

print(f'Sitemap cree avec {len(pages)} URLs dans public/sitemap.xml')