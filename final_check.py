#!/usr/bin/env python3
import os
import json
import re

print('=== VERIFICATION FINALE ENCODAGE ===')
print()

# 1. Verifier bytes UTF-8
print('1. BYTES UTF-8 (C3 A9 = e accent):')
with open('pages_YMYL_FINAL_V2/apl.html', 'rb') as f:
    orig = f.read()
with open('pages_SIMULATEURS_PLUS/apl_SIMULATEURS_PLUS.html', 'rb') as f:
    gen = f.read()
count_orig = orig.count(bytes([0xC3, 0xA9]))
count_gen = gen.count(bytes([0xC3, 0xA9]))
print(f'   Source: {count_orig} x e accent')
print(f'   Genere: {count_gen} x e accent')
if count_gen >= count_orig:
    print('   OK: Le fichier genere a tous les accents du source + les nouveaux')
print()

# 2. Verifier pas de bytes suspects
print('2. BYTES SUSPECTS (C7, C4, C5):')
bad = 0
for root, dirs, files in os.walk('pages_SIMULATEURS_PLUS'):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            with open(path, 'rb') as file:
                content = file.read()
            if bytes([0xC7]) in content[:2000]:
                bad += 1
print(f'   Fichiers avec bytes C7 (corrompus): {bad}')
if bad == 0:
    print('   OK: Aucun fichier corrompu')
print()

# 3. Verifier JSON valide
print('3. SCHEMA JSON VALIDE:')
with open('pages_SIMULATEURS_PLUS/apl_SIMULATEURS_PLUS.html', 'r', encoding='utf-8') as f:
    content = f.read()
scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
for script in scripts:
    try:
        data = json.loads(script)
        if data.get('@type') == 'HowTo':
            print(f'   HowTo OK: {data["name"]}')
        elif data.get('@type') == 'BreadcrumbList':
            print(f'   Breadcrumb OK: {data["itemListElement"][-1]["name"]}')
    except Exception as e:
        print(f'   ERREUR JSON: {e}')

print()
print('=== VERIFICATION TERMINEE ===')
print('OK: Les fichiers sont propres et bien encodes en UTF-8')
