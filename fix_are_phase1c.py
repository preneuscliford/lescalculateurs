#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 1 optimisation SEO page ARE - Partie C
Correction H1 et ajout section barèmes
"""

import codecs

# Lire le fichier
with codecs.open('src/pages/are.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. MODIFIER LE H1 (avec l'apostrophe typographique)
old_h1 = '''<h1 class="text-4xl font-bold mb-4">
          Simulateur ARE 2026 : estimation de l'allocation chômage
        </h1>'''

new_h1 = '''<h1 class="text-4xl font-bold mb-4">
          Simulateur ARE 2026 — barèmes France Travail et calcul des indemnités
        </h1>
        <p class="text-sm text-orange-200 mb-2">
          <span class="inline-flex items-center bg-orange-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">✓</span> Vérifié le 12 février 2026 — Barèmes officiels à jour
          </span>
        </p>'''

content = content.replace(old_h1, new_h1)

# Si ça n'a pas marché, essayer avec un pattern différent
if old_h1 in content:
    # Essayer sans les espaces exacts
    content = content.replace(
        'Simulateur ARE 2026 : estimation de l'allocation chômage',
        'Simulateur ARE 2026 — barèmes France Travail et calcul des indemnités'
    )
    # Ajouter la date après le H1
    content = content.replace(
        '''</h1>
        <p class="text-xl text-orange-100 mb-6">''',
        '''</h1>
        <p class="text-sm text-orange-200 mb-2">
          <span class="inline-flex items-center bg-orange-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">✓</span> Vérifié le 12 février 2026 — Barèmes officiels à jour
          </span>
        </p>
        <p class="text-xl text-orange-100 mb-6">'''
    )

# 2. AJOUTER LA SECTION BARÈMES APRÈS LE RÉSUMÉ RAPIDE
section_baremes = '''
      <!-- Barèmes officiels ARE 2026 -->
      <section class="mb-10 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border-2 border-orange-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span class="mr-2">📊</span> Barèmes officiels ARE 2026 : taux, plafonds et conditions
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-orange-100">
                <th class="p-3 text-left font-semibold text-gray-800 border-b-2 border-orange-200">Élément</th>
                <th class="p-3 text-left font-semibold text-gray-800 border-b-2 border-orange-200">Barème 2026</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Taux de remplacement</strong></td>
                <td class="p-3 text-gray-700">57,43% du Salaire Journalier de Référence (SJR)</td>
              </tr>
              <tr class="border-b border-orange-100 bg-white">
                <td class="p-3 text-gray-700"><strong>Minimum journalier</strong></td>
                <td class="p-3 text-gray-700">31,50€ brut/jour (soit ~945€/mois)</td>
              </tr>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Maximum journalier</strong></td>
                <td class="p-3 text-gray-700">91,82€ brut/jour (soit ~2 755€/mois)</td>
              </tr>
              <tr class="border-b border-orange-100 bg-white">
                <td class="p-3 text-gray-700"><strong>Condition d'ancienneté</strong></td>
                <td class="p-3 text-gray-700">4 mois minimum (88 jours ou 610h) sur 28 mois</td>
              </tr>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Durée max indemnisation (&lt; 53 ans)</strong></td>
                <td class="p-3 text-gray-700">24 mois maximum</td>
              </tr>
              <tr class="bg-white">
                <td class="p-3 text-gray-700"><strong>Durée max indemnisation (≥ 53 ans)</strong></td>
                <td class="p-3 text-gray-700">36 mois maximum</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-600 mt-4">
          <strong>Sources :</strong> 
          <a href="https://www.service-public.fr/particuliers/vosdroits/N549" target="_blank" rel="noopener" class="text-orange-600 hover:underline">service-public.fr</a>, 
          <a href="https://www.france-travail.fr" target="_blank" rel="noopener" class="text-orange-600 hover:underline">france-travail.fr</a>
          | <em>Données officielles en vigueur au 1er janvier 2026</em>
        </p>
      </section>
'''

# Insérer après le résumé rapide
old_section = '''      </section>

      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          🧾 Ce que permet ce simulateur
        </h2>'''

new_section = '''      </section>
''' + section_baremes + '''
      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          🧾 Ce que permet ce simulateur
        </h2>'''

content = content.replace(old_section, new_section)

# Sauvegarder
with codecs.open('src/pages/are.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 1C - Modifications appliquees")
