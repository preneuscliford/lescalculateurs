#!/usr/bin/env python3
"""
Script de vérification complète et renforcée pour tous les fichiers HTML
Vérifie: UTF-8, grammaire, orthographe, espacements, symboles
"""
import os
import re
import sys

dirs = ['src/pages', 'pages_YMYL_FINAL', 'pages_YMYL_FINAL_V2', 'pages_SCHEMA_FINAL', 'pages_YMYL_SAFE']

# ============================================================
# ERREURS CRITIQUES (bloquantes pour la production)
# ==========================================================
CRITICAL_ERRORS = {
    'U+FFFD (caractère de remplacement)': {
        'pattern_bytes': b'\xef\xbf\xbd',
        'check_type': 'bytes',
        'severity': 'CRITICAL'
    },
    'UTF-8 mal formé': {
        'pattern_bytes': b'\xc3\xa9[0-9]',  # é suivi d'un chiffre (montant)
        'check_type': 'bytes',
        'severity': 'CRITICAL'
    },
}

# ============================================================
# ERREURS DE GRAMMAIRE/ORTHOGRAPHE
# ============================================================
GRAMMAR_ERRORS = [
    ('le estimateur', "l'estimateur", 'grammaire'),
    ('la estimateur', "l'estimateur", 'grammaire'),
    ('de confirmer sur la CAF', 'de confirmer sur le site de la CAF', 'grammaire'),
    ('sur la CAF', 'sur le site de la CAF', 'contexte'),
    ('éle-de-france', 'Île-de-France', 'orthographe'),
    ('éle-de-France', 'Île-de-France', 'orthographe'),
    ('ile-de-france', 'Île-de-France', 'orthographe'),
    ('déAPL', "d'APL", 'orthographe'),
    ('auprés', 'auprès', 'orthographe'),
    ('impéts', 'impôts', 'orthographe'),
    ('gréce', 'grâce', 'orthographe'),
    ('calculest', 'calcul est', 'orthographe'),
    ('Prét ', 'Prêt ', 'orthographe'),
    ('Prêtimmobilier', 'Prêt immobilier', 'orthographe'),
    ('mari€', 'marié', 'encodage'),
    ('propriét€', 'propriété', 'encodage'),
    ('Mensualit€', 'Mensualité', 'encodage'),
    ('plafonn€', 'plafonné', 'encodage'),
    ('réalis€', 'réalisé', 'encodage'),
    ('estim€', 'estimé', 'encodage'),
    ('indicat€', 'indicatif', 'encodage'),
    ('€ partir', 'à partir', 'encodage'),
    ('€ titre', 'à titre', 'encodage'),
    ('€ charge', 'à charge', 'encodage'),
    ('€ voir', '– voir', 'encodage'),
    ('€ 2026', '© 2026', 'encodage'),
    ('€ Aide', '• Aide', 'puce'),
    ('€ CAF', '• CAF', 'puce'),
    ('€ Vos', '• Vos', 'puce'),
    ('€ Votre', '• Votre', 'puce'),
    ('€ Le', '• Le', 'puce'),
]

# ============================================================
# ERREURS DE MONTANTS (€)
# ============================================================
MONTANT_ERRORS = [
    (r'\b610 é\b', '610 €'),
    (r'\b670 é\b', '670 €'),
    (r'\b730 é\b', '730 €'),
    (r'\b790 é\b', '790 €'),
    (r'\b510 é\b', '510 €'),
    (r'\b560 é\b', '560 €'),
    (r'\b660 é\b', '660 €'),
    (r'\b430 é\b', '430 €'),
    (r'\b480 é\b', '480 €'),
    (r'\b530 é\b', '530 €'),
    (r'\b580 é\b', '580 €'),
    (r'\d+ é[^a-zA-Z]', '€ dans montant'),
]

# ============================================================
# ESPACEMENTS ET PONCTUATION
# ============================================================
SPACE_ERRORS = [
    (r'  +', 'espaces multiples'),
    (r' € ', 'espace avant €'),
    (r'[a-zA-Z]€[a-zA-Z]', '€ sans espaces'),
    (r' €[0-9]', 'espace avant € chiffre'),
]

# ============================================================
# FONCTIONS DE VÉRIFICATION
# ============================================================
def check_critical_errors(filepath, content_bytes):
    """Vérifie les erreurs critiques"""
    errors = []
    for name, check in CRITICAL_ERRORS.items():
        if check['check_type'] == 'bytes':
            if check['pattern_bytes'] in content_bytes:
                count = content_bytes.count(check['pattern_bytes'])
                errors.append((check['severity'], name, count))
    return errors

def check_grammar(filepath, text):
    """Vérifie les erreurs de grammaire"""
    errors = []
    for wrong, correct, category in GRAMMAR_ERRORS:
        if wrong.lower() in text.lower():
            # Compter les occurrences
            count = text.lower().count(wrong.lower())
            errors.append(('WARNING', f"{wrong} -> {correct}", count, category))
    return errors

def check_montants(filepath, text):
    """Vérifie les erreurs dans les montants"""
    errors = []
    for pattern, desc in MONTANT_ERRORS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            errors.append(('WARNING', f"{desc}: {matches[:3]}", len(matches), 'montant'))
    return errors

def check_espacements(filepath, text):
    """Vérifie les espacements"""
    errors = []
    for pattern, desc in SPACE_ERRORS:
        matches = re.findall(pattern, text)
        if matches:
            # Filtrer les faux positifs (ex: regex JS)
            filtered = [m for m in matches if not any(c in m for c in ['*', '/', "'", '[', ']', '(', ')', '{', '}'])]
            if filtered:
                errors.append(('INFO', f"{desc}: {len(filtered)}x", len(filtered), 'espacement'))
    return errors

def main():
    print("=" * 80)
    print("VÉRIFICATION COMPLÈTE DES FICHIERS HTML")
    print("=" * 80)
    
    all_critical = []
    all_warnings = []
    all_infos = []
    files_checked = 0
    
    for dir_path in dirs:
        if not os.path.exists(dir_path):
            continue
            
        for filename in os.listdir(dir_path):
            if not filename.endswith('.html'):
                continue
                
            filepath = os.path.join(dir_path, filename)
            files_checked += 1
            
            try:
                with open(filepath, 'rb') as f:
                    content_bytes = f.read()
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read()
                
                file_issues = []
                
                # Vérifications
                critical = check_critical_errors(filepath, content_bytes)
                grammar = check_grammar(filepath, text)
                montants = check_montants(filepath, text)
                espacements = check_espacements(filepath, text)
                
                if critical:
                    all_critical.extend([(filepath, err) for err in critical])
                    file_issues.extend([f"[CRITIQUE] {err[1]}" for err in critical])
                
                if grammar:
                    all_warnings.extend([(filepath, err) for err in grammar])
                    file_issues.extend([f"[AVERTISSEMENT] {err[1]}" for err in grammar])
                
                if montants:
                    all_warnings.extend([(filepath, err) for err in montants])
                    file_issues.extend([f"[MONTANT] {err[1]}" for err in montants])
                
                if espacements:
                    all_infos.extend([(filepath, err) for err in espacements])
                    
            except Exception as e:
                all_critical.append((filepath, ('CRITICAL', f'Erreur lecture: {e}', 1)))
    
    # ============================================================
    # AFFICHAGE DES RÉSULTATS
    # ============================================================
    print(f"\nFichiers vérifiés: {files_checked}")
    print(f"Erreurs critiques: {len(all_critical)}")
    print(f"Avertissements: {len(all_warnings)}")
    print(f"Infos: {len(all_infos)}")
    
    if all_critical:
        print("\n" + "=" * 80)
        print("❌ ERREURS CRITIQUES (bloquantes pour production)")
        print("=" * 80)
        current_file = None
        for filepath, err in all_critical:
            if filepath != current_file:
                print(f"\n{filepath}:")
                current_file = filepath
            print(f"  ❌ {err[0]}: {err[1]} ({err[2]}x)")
    
    if all_warnings:
        print("\n" + "=" * 80)
        print("⚠️  AVERTISSEMENTS (à corriger)")
        print("=" * 80)
        current_file = None
        for filepath, err in all_warnings[:50]:  # Limiter l'affichage
            if filepath != current_file:
                print(f"\n{filepath}:")
                current_file = filepath
            print(f"  ⚠️  {err[3]}: {err[1]}")
    
    # ============================================================
    # RÉSUMÉ FINAL
    # ============================================================
    print("\n" + "=" * 80)
    if all_critical:
        print("❌ ÉCHEC: Des erreurs critiques ont été trouvées!")
        print("=" * 80)
        sys.exit(1)
    elif all_warnings:
        print("⚠️  ATTENTION: Des avertissements ont été trouvés")
        print("=" * 80)
        print("Conseil: Corrigez les avertissements avant mise en production")
        sys.exit(0)
    else:
        print("✅ SUCCÈS: Aucune erreur trouvée!")
        print("=" * 80)
        print("Tous les fichiers sont propres et prêts pour la production.")
        sys.exit(0)

if __name__ == '__main__':
    main()
