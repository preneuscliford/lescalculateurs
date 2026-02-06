#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

folders = ['content_SAFE', 'pages_YMYL_SAFE']
fixed_count = 0
issues_count = 0

# Mapping des caractères Latin-1 vers UTF-8
latin1_to_utf8 = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã´': 'ô',
    'Ãª': 'ê',
    'Ã»': 'û',
    'Ã¹': 'ù',
    'Ã®': 'î',
    'Ã¯': 'ï',
    'Ã§': 'ç',
    'Å“': 'œ',
    'Å’': 'Œ',
    'Ã€': 'À',
    'Ã‰': 'É',
    'Ãˆ': 'È',
    'Ã ': 'À',
    'â€œ': '"',
    'â€�': '"',
    'â€™': "'",
    'â€¦': '…',
    'â€“': '–',
    'â€”': '—',
    'Ã ': ' ',
    'Ã\xA0': 'À',
}

for folder in folders:
    if not os.path.exists(folder):
        continue
    
    for file in os.listdir(folder):
        if not file.endswith('.html'):
            continue
            
        filepath = os.path.join(folder, file)
        
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        # Vérifier s'il y a un BOM
        has_bom = raw.startswith(b'\xef\xbb\xbf')
        
        # Décoder le contenu
        try:
            content = raw.decode('utf-8', errors='strict')
        except UnicodeDecodeError:
            # Essayer avec Latin-1 puis reconvertir
            content = raw.decode('latin-1')
        
        original_content = content
        
        # Supprimer le BOM s'il existe
        if has_bom:
            content = content.lstrip('\ufeff')
        
        # Corriger les caractères Latin-1
        for latin, utf in latin1_to_utf8.items():
            content = content.replace(latin, utf)
        
        # Sauvegarder si modifié
        if content != original_content or has_bom:
            with open(filepath, 'wb') as f:
                f.write(content.encode('utf-8'))
            fixed_count += 1
            print(f"[OK] Corrige: {filepath}")

        else:
            print(f"[--] OK: {filepath}")

print(f"\n{'='*50}")
print(f"Pages corrigees: {fixed_count}")
print(f"{'='*50}")
