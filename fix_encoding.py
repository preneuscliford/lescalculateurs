#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from pathlib import Path

# Correction des patterns connus d'encodage corrompu
CORRECTIONS = {
    'r�gles': 'règles',
    'd�finitif': 'définitif',
    'estim�': 'estimé',
    'estim�e': 'estimée',
    'personnalis�e': 'personnalisée',
    'd�cent': 'décent',
    '�ligible': 'éligible',
    '�ligibilit�': 'éligibilité',
    'd�claration': 'déclaration',
    'd�pend': 'dépend',
    'd�taill�': 'détaillé',
    'd�taill�e': 'détaillée',
    'calcul�': 'calculé',
    'calcul�e': 'calculée',
    'sp�cifique': 'spécifique',
    'pr�cise': 'précise',
    'pr�cis': 'précis',
    'cr�ation': 'création',
    'cr��': 'créé',
    'cr��e': 'créée',
    'r�f�rence': 'référence',
    'pr�ts': 'prêts',
    'pr�t': 'prêt',
    'participation personnelle estim�e': 'participation personnelle estimée',
    'co�te': 'coûte',
    'ca�se': 'caisse',
    'g�n�ralement': 'généralement',
    'g�n�ral': 'général',
    'diff�rence': 'différence',
    'simpli�e': 'simplifiée',
    'simpli��': 'simplifié',
    'r�sultats': 'résultats',
    'r�sultat': 'résultat',
    'bar�me': 'barème',
    'plafonn�': 'plafonné',
    'plafonn�e': 'plafonnée',
    'c�libataire': 'célibataire',
    'mari�': 'marié',
    'd�clar�': 'déclaré',
    're�u': 'reçu',
    'informations compl�mentaires': 'informations complémentaires',
    'r�glementaires': 'réglementaires',
    'publi�es': 'publiées',
    'modifi�e': 'modifiée',
    'v�rifiez': 'vérifiez',
    'd�marche': 'démarche',
    '�tudiant': 'étudiant',
    'logement �tudiant': 'logement étudiant',
    'ann�e': 'année',
    'ann�es': 'années',
    'd�clarez': 'déclarez',
    '�v�nements': 'événements',
    'pr�c�dente': 'précédente',
    'succ�der': 'succéder',
    'succ�s': 'succès',
    're�ois': 'reçois',
    'envoy�': 'envoyé',
    'int�r�t': 'intérêt',
    'int�ressante': 'intéressante',
    'pr�nom': 'prénom',
    't�l�phone': 'téléphone',
    't�l�charger': 'télécharger',
    'num�ro': 'numéro',
    'pi�ces': 'pièces',
    'pi�ce': 'pièce',
    'situ�': 'situé',
    'situ�e': 'située',
    'g�ographie': 'géographie',
    'd�partement': 'département',
    'd�partements': 'départements',
    'm�tro': 'métro',
    'm�me': 'même',
    'm�mes': 'mêmes',
    'for�a': 'força',
    'd�j�': 'déjà',
    'd�j��': 'déjà',  # cas extreme
    'f�vrier': 'février',
    'ao�t': 'août',
    'd�cembre': 'décembre',
    'caract�re': 'caractère',
    'caract�res': 'caractères',
    'compl�te': 'complète',
    'compl�ter': 'compléter',
    'compl�t�': 'complété',
    'param�tre': 'paramètre',
    'param�tres': 'paramètres',
    'm�thode': 'méthode',
    'm�thodes': 'méthodes',
    'actualis�s': 'actualisés',
    'actualis�': 'actualisé',
    'actualis�e': 'actualisée',
}

def fix_file(filepath):
    """Corrige l'encodage d'un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            content = f.read()
    except:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'Error reading {filepath}: {e}')
            return 0
    
    original = content
    count = 0
    
    # Appliquer les corrections
    for bad, good in CORRECTIONS.items():
        if bad in content:
            content = content.replace(bad, good)
            count += content.count(good) - original.count(good) if good in original else content.count(good)
    
    # Sauvegarder si modifié
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return count
    return 0

# Corriger tous les fichiers APL
apl_files = [
    'pages_YMYL_FINAL_V2/apl.html',
    'pages_YMYL_FINAL_V2/apl-dom-tom.html',
    'pages_YMYL_FINAL_V2/apl-etudiant.html',
    'pages_YMYL_FINAL_V2/apl-zones.html',
]

total = 0
for f in apl_files:
    if os.path.exists(f):
        fixed = fix_file(f)
        if fixed > 0:
            print(f'Fixed {fixed} characters in {f}')
            total += fixed
        else:
            print(f'No fixes needed in {f}')
    else:
        print(f'File not found: {f}')

print(f'\nTotal corrections: {total}')
