#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
import csv
import json
from pathlib import Path

SRC_DIR = Path('pages_YMYL_FINAL_V2')
OUT_DIR = Path('pages_SIMULATEURS_PLUS')
REPORT_CSV = Path('SIMULATEURS_PLUS_REPORT.csv')

SIMULATEUR_PATTERNS = [
    'simulateur', 'calculateur', 'estimation', 'calculez', 'simulez',
    'calculatrice', 'outil de calcul', 'estimateur'
]

# Ordre important: du plus specifique au plus general
SIMULATEUR_TYPES = [
    ('aah', 'AAH'),
    ('asf', 'ASF'),
    ('are', 'ARE'),
    ('rsa', 'RSA'),
    ('plus.value', 'Plus-value'),
    ('plusvalue', 'Plus-value'),
    ('apl', 'APL'),
    ('impot', 'Impôt'),
    ('notaire', 'Notaire'),
    ('prime.activite', 'Prime'),
    ('prime activite', 'Prime'),
    ('ik', 'IK'),
    ('kilometrique', 'IK'),
    ('taxe.fonciere', 'Taxe'),
    ('taxe fonciere', 'Taxe'),
    ('taxe', 'Taxe'),
    ('pret.immobilier', 'Prêt'),
    ('pret immobilier', 'Prêt'),
    ('pret', 'Prêt'),
    ('salaire', 'Salaire'),
    ('brut.net', 'Salaire'),
    ('brut net', 'Salaire'),
    ('charge.copropriete', 'Charges'),
    ('charge copropriete', 'Charges'),
    ('charges', 'Charges'),
    ('crypto', 'Crypto'),
    ('bitcoin', 'Crypto'),
    ('foncier', 'Foncier'),
]

def read_file_utf8(filepath):
    """Lit un fichier en UTF-8 avec gestion du BOM"""
    try:
        # Essayer utf-8-sig pour gérer le BOM
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            return f.read()
    except:
        # Fallback sur utf-8 standard
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

def write_file_utf8(filepath, content):
    """Écrit un fichier en UTF-8 sans BOM"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def detect_type(content, filename):
    """Detecte le type de simulateur avec priorite au nom de fichier"""
    content_lower = content.lower()
    filename_lower = filename.lower()
    
    # D'abord verifier le nom de fichier (plus fiable)
    for pattern, sim_type in SIMULATEUR_TYPES:
        clean_pattern = pattern.replace('.', ' ')
        if clean_pattern in filename_lower or pattern in filename_lower:
            return sim_type
    
    # Ensuite verifier dans le contenu mais avec des patterns plus specifiques
    # Chercher dans le title d'abord
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).lower()
        for pattern, sim_type in SIMULATEUR_TYPES:
            clean_pattern = pattern.replace('.', ' ')
            if clean_pattern in title or pattern in title:
                return sim_type
    
    # Chercher dans le contenu general
    for pattern, sim_type in SIMULATEUR_TYPES:
        clean_pattern = pattern.replace('.', ' ')
        if clean_pattern in content_lower or pattern in content_lower:
            return sim_type
    
    return 'Simulateur'

def has_schema(content, schema_type):
    return f'"@type": "{schema_type}"' in content or f'"@type":"{schema_type}"' in content

def generate_howto(sim_type):
    names = {
        'APL': 'Comment estimer mon APL en 2026 ?',
        'Impôt': 'Comment calculer mon impôt sur le revenu 2026 ?',
        'Notaire': 'Comment estimer les frais de notaire 2026 ?',
        'Prime': "Comment calculer ma prime d'activité 2026 ?",
        'RSA': 'Comment estimer mon RSA 2026 ?',
        'IK': 'Comment calculer mes indemnités kilométriques 2026 ?',
        'Plus-value': 'Comment estimer ma plus-value immobilière 2026 ?',
        'Taxe': 'Comment estimer ma taxe foncière 2026 ?',
        'Prêt': 'Comment simuler mon prêt immobilier 2026 ?',
        'Salaire': 'Comment convertir mon salaire brut en net 2026 ?',
        'Charges': 'Comment estimer mes charges de copropriété 2026 ?',
        'ARE': 'Comment calculer mon allocation chômage 2026 ?',
        'AAH': 'Comment estimer mon AAH 2026 ?',
        'ASF': 'Comment calculer mon ASF 2026 ?',
        'Crypto': 'Comment calculer ma plus-value crypto 2026 ?',
        'Foncier': 'Comment estimer mon revenu foncier 2026 ?',
        'Simulateur': 'Comment utiliser ce simulateur en 2026 ?',
    }
    name = names.get(sim_type, 'Comment utiliser ce simulateur en 2026 ?')
    
    howto = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': name,
        'step': [
            {'@type': 'HowToStep', 'position': 1, 'text': 'Renseignez vos critères personnels'},
            {'@type': 'HowToStep', 'position': 2, 'text': 'Cliquez sur Estimer'},
            {'@type': 'HowToStep', 'position': 3, 'text': 'Consultez le résultat détaillé'}
        ]
    }
    return f'<script type="application/ld+json">\n{json.dumps(howto, ensure_ascii=False, indent=2)}\n</script>'

def generate_breadcrumb(sim_type, url):
    page_names = {
        'APL': 'APL 2026', 'Impôt': 'Impôt sur le revenu', 'Notaire': 'Frais de notaire',
        'Prime': "Prime d'activité", 'RSA': 'RSA 2026', 'IK': 'Indemnités kilométriques',
        'Plus-value': 'Plus-value immobilière', 'Taxe': 'Taxe foncière',
        'Prêt': 'Prêt immobilier', 'Salaire': 'Salaire brut/net',
        'Charges': 'Charges de copropriété', 'ARE': 'Allocation chômage',
        'AAH': 'AAH 2026', 'ASF': 'ASF 2026', 'Crypto': 'Plus-value crypto',
        'Foncier': 'Revenu foncier', 'Simulateur': 'Simulateur'
    }
    page_name = page_names.get(sim_type, sim_type)
    if not url:
        url = f'https://www.lescalculateurs.fr/pages/{sim_type.lower()}'
    
    breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://www.lescalculateurs.fr'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Simulateurs', 'item': 'https://www.lescalculateurs.fr/pages/simulateurs'},
            {'@type': 'ListItem', 'position': 3, 'name': page_name, 'item': url}
        ]
    }
    return f'<script type="application/ld+json">\n{json.dumps(breadcrumb, ensure_ascii=False, indent=2)}\n</script>'

def generate_links(sim_type):
    if sim_type == 'Prêt':
        links = [('/pages/notaire', 'Estimez les frais de notaire'), ('/pages/taxe', 'Calculez la taxe foncière'), ('/pages/apl', 'Vérifiez vos APL')]
    elif sim_type == 'APL':
        links = [('/pages/pret', 'Simulez votre prêt'), ('/pages/taxe', 'Estimez votre taxe'), ('/pages/rsa', 'Calculez votre RSA')]
    elif sim_type == 'Impôt':
        links = [('/pages/salaire', 'Convertissez brut/net'), ('/pages/ik', 'Calculez vos IK'), ('/pages/prime-activite', 'Vérifiez votre prime')]
    elif sim_type == 'Notaire':
        links = [('/pages/pret', 'Simulez votre prêt'), ('/pages/plusvalue', 'Calculez la plus-value'), ('/pages/taxe', 'Estimez la taxe')]
    elif sim_type == 'RSA':
        links = [('/pages/apl', 'Vérifiez vos APL'), ('/pages/prime-activite', 'Calculez votre prime'), ('/pages/pret', 'Simulez votre prêt')]
    elif sim_type == 'AAH':
        links = [('/pages/rsa', 'Calculez votre RSA'), ('/pages/apl', 'Vérifiez vos APL'), ('/pages/prime-activite', 'Vérifiez votre prime')]
    elif sim_type == 'Salaire':
        links = [('/pages/impot', 'Calculez votre impôt'), ('/pages/ik', 'Calculez vos IK'), ('/pages/prime-activite', 'Vérifiez votre prime')]
    else:
        links = [('/pages/pret', 'Simulez votre prêt'), ('/pages/taxe', 'Estimez votre taxe'), ('/pages/prime-activite', 'Vérifiez votre prime')]
    
    links_html = ' | '.join([f'<a href="{url}">{text}</a>' for url, text in links])
    return f'<div class="cluster-links" style="margin-top:2rem;padding:1rem;background:#f3f4f6;border-radius:8px;"><p><strong>Continuez votre simulation :</strong></p>{links_html}</div>'

def is_simulateur(filepath):
    try:
        content = read_file_utf8(filepath).lower()
        for pattern in SIMULATEUR_PATTERNS:
            if pattern in content:
                return True
        filename = os.path.basename(filepath).lower()
        for pattern, _ in SIMULATEUR_TYPES:
            clean_pattern = pattern.replace('.', ' ')
            if clean_pattern in filename or pattern in filename:
                return True
        return False
    except:
        return False

def extract_canonical(content):
    m = re.search(r'<link[^>]*canonical[^>]*href="([^"]+)"', content, re.I)
    if m: return m.group(1)
    m = re.search(r'<meta[^>]*og:url[^>]*content="([^"]+)"', content, re.I)
    if m: return m.group(1)
    return ''

print('Scanning...')
OUT_DIR.mkdir(exist_ok=True)
all_files = list(SRC_DIR.rglob('*.html'))
sim_files = [f for f in all_files if is_simulateur(f)]
print(f'Found {len(sim_files)} simulateurs')

csv_rows = []
stats = {'total': 0, 'howto': 0, 'breadcrumb': 0, 'links': 0}

for file in sim_files:
    stats['total'] += 1
    rel_path = str(file.relative_to(SRC_DIR))
    
    # Lire avec gestion UTF-8
    content = read_file_utf8(file)
    
    sim_type = detect_type(content, file.name)
    canonical = extract_canonical(content)
    
    howto_added = 'NON'
    breadcrumb_added = 'NON'
    links_added = 'NON'
    
    if not has_schema(content, 'HowTo'):
        howto = generate_howto(sim_type)
        content = content.replace('</head>', f'{howto}\n</head>')
        howto_added = 'OUI'
        stats['howto'] += 1
    
    if not has_schema(content, 'BreadcrumbList'):
        breadcrumb = generate_breadcrumb(sim_type, canonical)
        content = content.replace('</head>', f'{breadcrumb}\n</head>')
        breadcrumb_added = 'OUI'
        stats['breadcrumb'] += 1
    
    links = generate_links(sim_type)
    if '</body>' in content.lower():
        content = re.sub(r'</body>', f'{links}\n</body>', content, flags=re.I)
    elif '</main>' in content.lower():
        content = re.sub(r'</main>', f'{links}\n</main>', content, flags=re.I)
    else:
        content = content.rstrip() + f'\n{links}\n'
    links_added = 'OUI'
    stats['links'] += 1
    
    out_file = OUT_DIR / file.relative_to(SRC_DIR)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    new_name = out_file.stem + '_SIMULATEURS_PLUS.html'
    out_file = out_file.parent / new_name
    
    # Écrire avec UTF-8
    write_file_utf8(out_file, content)
    
    csv_rows.append({
        'fichier': rel_path,
        'type_detecte': sim_type,
        'howto_added': howto_added,
        'breadcrumb_added': breadcrumb_added,
        'internal_links_added': links_added,
        'status': 'OK'
    })

with REPORT_CSV.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['fichier', 'type_detecte', 'howto_added', 'breadcrumb_added', 'internal_links_added', 'status'])
    writer.writeheader()
    writer.writerows(csv_rows)

print('\n=== RECAPITULATIF ===')
print(f'Pages corrigées: {stats["total"]}')
print(f'HowTo ajoutés: {stats["howto"]}')
print(f'BreadcrumbList ajoutés: {stats["breadcrumb"]}')
print(f'Liens internes ajoutés: {stats["links"] * 3}')
print('\n=== VERIFICATION DES TYPES ===')
type_counts = {}
for row in csv_rows:
    t = row['type_detecte']
    type_counts[t] = type_counts.get(t, 0) + 1
for t, count in sorted(type_counts.items()):
    print(f'  {t}: {count} fichiers')
print('\n=== 5 PREMIERES LIGNES DU CSV ===')
print('fichier;type_detecte;howto_added;breadcrumb_added;internal_links_added;status')
for row in csv_rows[:5]:
    print(f"{row['fichier']};{row['type_detecte']};{row['howto_added']};{row['breadcrumb_added']};{row['internal_links_added']};{row['status']}")
print(f'\nDone! Output in {OUT_DIR}')
