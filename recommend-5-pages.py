#!/usr/bin/env python3
"""Analyze VDF data + Search Console to recommend 5 new high-value pages"""

import csv
import openpyxl
from pathlib import Path
from statistics import mean
import re

# Load Search Console data
excel_file = Path("seach-console-perf/lescalculateurs.fr-Performance-on-Search-2026-05-02.xlsx")
wb = openpyxl.load_workbook(excel_file)

# Get VDF metrics
ws_vdf = wb['VDF - Revenu Médian'] if 'VDF - Revenu Médian' in wb.sheetnames else None

# Load and analyze VDF data
vdf_file = Path("vdf/revenu-des-francais-a-la-commune-1765372688826.csv")

print("\n" + "="*140)
print("🔍 VDF DATA ANALYSIS - Top 5 Pages à Créer Basées sur Revenus + Opportunité SEO")
print("="*140 + "\n")

communes_data = []

try:
    with open(vdf_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            try:
                nom = row.get('Nom géographique GMS', '').strip()
                code = row.get('Code géographique', '').strip()
                
                # Get median revenue (DISP = disposable)
                mediane_str = row.get('[DISP] Médiane (€)', '').strip()
                if not mediane_str:
                    mediane_str = row.get('[DEC] Médiane (€)', '').strip()
                
                mediane = float(mediane_str) if mediane_str and mediane_str != '' else 0
                
                # Get quartiles
                q1_str = row.get('[DISP] 1ᵉ quartile (€)', '').strip()
                q3_str = row.get('[DISP] 3ᵉ quartile (€)', '').strip()
                
                q1 = float(q1_str) if q1_str else 0
                q3 = float(q3_str) if q3_str else 0
                
                if mediane > 0 and nom and not nom.startswith('L\''):
                    # Calculate wealth score: median + difference from Q1 to Q3
                    wealth_score = mediane + ((q3 - q1) / 2)
                    
                    communes_data.append({
                        'nom': nom,
                        'code': code,
                        'mediane': mediane,
                        'q1': q1,
                        'q3': q3,
                        'wealth_score': wealth_score,
                    })
                    
            except (ValueError, TypeError, KeyError) as e:
                continue
    
    # Sort by wealth score (median + range)
    communes_data.sort(key=lambda x: x['wealth_score'], reverse=True)
    
    print("📊 TOP 20 COMMUNES by Wealth/Income:")
    print("-" * 140)
    for i, com in enumerate(communes_data[:20], 1):
        print(f"{i:2d}. {com['nom']:45s} | Médiane: {com['mediane']:8.0f}€ | Q1-Q3: {com['q1']:8.0f}€-{com['q3']:8.0f}€ | Score: {com['wealth_score']:10.0f}")
    
    print("\n" + "="*140)
    print("🎯 RECOMMENDED 5 PAGES TO CREATE:")
    print("="*140 + "\n")
    
    # Select top 5 unique communes (avoid similar names)
    selected = []
    for com in communes_data:
        # Filter out very small communes and duplicates
        if len(selected) >= 5:
            break
        # Skip if similar name already selected
        if not any(selected_com['nom'].split()[0] == com['nom'].split()[0] for selected_com in selected):
            selected.append(com)
    
    for i, com in enumerate(selected, 1):
        # Create slug
        slug = com['nom'].lower()
        slug = re.sub(r'[éèê]', 'e', slug)
        slug = re.sub(r'[ôö]', 'o', slug)
        slug = re.sub(r'[ç]', 'c', slug)
        slug = re.sub(r'[àâ]', 'a', slug)
        slug = re.sub(r'[û]', 'u', slug)
        slug = re.sub(r'[ï]', 'i', slug)
        slug = re.sub(r"['.\s]", '-', slug)
        slug = re.sub(r'-+', '-', slug).strip('-')
        
        url = f"/pages/revenus/{slug}"
        
        print(f"{i}. {com['nom']:50s}")
        print(f"   Médiane revenu: {com['mediane']:8.0f}€ | Q1: {com['q1']:8.0f}€ | Q3: {com['q3']:8.0f}€")
        print(f"   URL proposée: {url}")
        print(f"   📝 Titre: \"Revenu moyen {com['nom']} 2026 | Salaire médian et distribution\"")
        print(f"   📝 Meta: \"Découvrez le revenu médian à {com['nom']} en 2026. Analyse de la distribution des salaires et revenus.\"")
        print()
    
    print("="*140)
    print("\n💡 STRATEGY:")
    print("  1. Pages riches (haute médiane) = Plus attrayantes pour utilisateurs qualifiés")
    print("  2. Croisement avec Search Console = \"salaire moyen par ville\" (1 clic, 12.5% CTR)")
    print("  3. Opportunité: Pages VDF MANQUENT dans Search Console = Nouveau trafic à capturer")
    print("  4. Format: Inclure calculateur + données VDF + benchmark vs France")
    print()
    
except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    traceback.print_exc()
