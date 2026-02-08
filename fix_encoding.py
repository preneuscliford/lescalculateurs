#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
import glob

# Table de conversion des erreurs fréquentes (UTF-8 mal interprété comme Latin-1)
REPLACEMENTS = [
    (b'\\xc3\\xa9'.decode('utf-8'), 'é'),  # Ã© → é
    (b'\\xc3\\xa8'.decode('utf-8'), 'è'),  # Ã¨ → è  
    (b'\\xc3\\xa0'.decode('utf-8'), 'à'),  # Ã  → à
    (b'\\xc3\\xb4'.decode('utf-8'), 'ô'),  # Ã´ → ô
    (b'\\xc3\\xbb'.decode('utf-8'), 'û'),  # Ã» → û
    (b'\\xc3\\xa7'.decode('utf-8'), 'ç'),  # Ã§ → ç
    (b'\\xc5\\x93'.decode('utf-8'), 'œ'),  # Å“ → œ
    (b'\\xc3\\x89'.decode('utf-8'), 'É'),  # Ã‰ → É
    (b'\\xc3\\x80'.decode('utf-8'), 'À'),  # Ã€ → À
    (b'\\xc3\\x8a'.decode('utf-8'), 'Ê'),  # ÃŠ → Ê
    (b'\\xc3\\xa2'.decode('utf-8'), 'â'),  # Ã¢ → â
    (b'\\xc3\\xae'.decode('utf-8'), 'î'),  # Ã® → î
    (b'\\xc3\\xaf'.decode('utf-8'), 'ï'),  # Ã¯ → ï
    (b'\\xc3\\xab'.decode('utf-8'), 'ë'),  # Ã« → ë
    (b'\\xc3\\xb9'.decode('utf-8'), 'ù'),  # Ã¹ → ù
    (b'\\xc3\\x94'.decode('utf-8'), 'Ô'),  # Ã” → Ô
    (b'\\xc3\\x89'.decode('utf-8'), 'É'),  # Ã‰ → É
    (b'\\xc3\\xa7'.decode('utf-8'), 'ç'),  # Ã§ → ç
    (b'\\xc5\\x93'.decode('utf-8'), 'œ'),  # Å“ → œ
    # Caractère de remplacement
    ('\ufffd', 'é'),  # � → é (pour calculér)
]

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        total_replacements = 0
        
        for bad, good in REPLACEMENTS:
            count = content.count(bad)
            if count > 0:
                content = content.replace(bad, good)
                total_replacements += count
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, total_replacements
        return False, 0
    except Exception as e:
        print(f"❌ Erreur sur {filepath}: {e}")
        return False, 0

def main():
    files = []
    files.extend(glob.glob('pages_YMYL_SAFE/*.html'))
    files.extend(glob.glob('src/pages/**/*.html', recursive=True))
    
    fixed_count = 0
    total_replacements = 0
    
    for filepath in files:
        fixed, count = fix_file(filepath)
        if fixed:
            fixed_count += 1
            total_replacements += count
            print(f"✅ Corrigé {count} erreurs: {filepath}")
    
    print(f"\n{'='*50}")
    print(f"Fichiers corrigés: {fixed_count}")
    print(f"Total corrections: {total_replacements}")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
