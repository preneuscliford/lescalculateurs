#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 1 optimisation SEO page ARE - Partie B
"""

import codecs
import re

# Lire le fichier
with codecs.open('src/pages/are.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. MODIFIER LA META DESCRIPTION (utiliser regex pour plus de flexibilité)
old_desc = 'content="Simulation ARE 2026 gratuite : calculez votre allocation chômage avec notre simulateur France Travail. Montant mensuel, durée d\'indemnisation selon votre ancien salaire et cotisations. Résultat immédiat !"'
new_desc = 'content="Calculez votre allocation chômage ARE 2026 : montant mensuel, durée d\'indemnisation et cumul emploi. Barèmes France Travail officiels à jour. Résultat en 2 min !"'
content = content.replace(old_desc, new_desc)

# Vérifier si le remplacement a fonctionné
if old_desc in content:
    print("Meta description non remplacee - tentative alternative")
    # Essayer avec une approche différente
    content = re.sub(
        r'content="Simulation ARE 2026 gratuite :[^"]*"',
        'content="Calculez votre allocation chômage ARE 2026 : montant mensuel, duree d\'indemnisation et cumul emploi. Baremes France Travail officiels a jour. Resultat en 2 min !"',
        content
    )

# 2. MODIFIER LE H1 ET AJOUTER LA DATE
old_h1_pattern = r'<h1 class="text-4xl font-bold mb-4">\s*Simulateur ARE 2026 : estimation de l\'allocation chômage\s*</h1>'
new_h1 = '''<h1 class="text-4xl font-bold mb-4">
          Simulateur ARE 2026 — barèmes France Travail et calcul des indemnités
        </h1>
        <p class="text-sm text-orange-200 mb-2">
          <span class="inline-flex items-center bg-orange-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">✓</span> Vérifié le 12 février 2026 — Barèmes officiels à jour
          </span>
        </p>'''

content = re.sub(old_h1_pattern, new_h1, content, flags=re.DOTALL)

# 3. MODIFIER LE H2 SEO
content = content.replace(
    '<h2 class="text-2xl font-bold text-gray-900 mb-6">Simulateur ARE 2026 — barèmes France Travail officiels et calcul des indemnités</h2>',
    '<h2 class="text-2xl font-bold text-gray-900 mb-6">Estimation allocation chômage : montant mensuel et durée d\'indemnisation</h2>'
)

# Sauvegarder
with codecs.open('src/pages/are.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications appliquees")
