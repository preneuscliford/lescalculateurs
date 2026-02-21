# -*- coding: utf-8 -*-
import codecs

with open('src/pages/are.html', 'rb') as f:
    raw = f.read()

# Remplacer le H1
pattern_old = b'Simulateur ARE 2026 : estimation de l\xe2\x80\x99allocation ch\xc3\xb4mage'
pattern_new = b'Simulateur ARE 2026 \xe2\x80\x94 bar\xc3\xa8mes France Travail et calcul des indemnit\xc3\xa9s'
raw = raw.replace(pattern_old, pattern_new)

# Ajouter la date après le H1
date_html = b'''</h1>
        <p class="text-sm text-orange-200 mb-2">
          <span class="inline-flex items-center bg-orange-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">\xe2\x9c\x93</span> V\xc3\xa9rifi\xc3\xa9 le 12 f\xc3\xa9vrier 2026 \xe2\x80\x94 Bar\xc3\xa8mes officiels \xc3\xa0 jour
          </span>
        </p>
        <p class="text-xl text-orange-100 mb-6">'''

old_p = b'''</h1>
        <p class="text-xl text-orange-100 mb-6">'''
raw = raw.replace(old_p, date_html)

# Section barèmes à insérer
baremes_section = b'''      <!-- Bar\xc3\xa8mes officiels ARE 2026 -->
      <section class="mb-10 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border-2 border-orange-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span class="mr-2">\xf0\x9f\x93\x8a</span> Bar\xc3\xa8mes officiels ARE 2026 : taux, plafonds et conditions
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-orange-100">
                <th class="p-3 text-left font-semibold text-gray-800 border-b-2 border-orange-200">\xc3\x89l\xc3\xa9ment</th>
                <th class="p-3 text-left font-semibold text-gray-800 border-b-2 border-orange-200">Bar\xc3\xa8me 2026</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Taux de remplacement</strong></td>
                <td class="p-3 text-gray-700">57,43% du Salaire Journalier de R\xc3\xa9f\xc3\xa9rence (SJR)</td>
              </tr>
              <tr class="border-b border-orange-100 bg-white">
                <td class="p-3 text-gray-700"><strong>Minimum journalier</strong></td>
                <td class="p-3 text-gray-700">31,50\xe2\x82\xac brut/jour (soit ~945\xe2\x82\xac/mois)</td>
              </tr>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Maximum journalier</strong></td>
                <td class="p-3 text-gray-700">91,82\xe2\x82\xac brut/jour (soit ~2 755\xe2\x82\xac/mois)</td>
              </tr>
              <tr class="border-b border-orange-100 bg-white">
                <td class="p-3 text-gray-700"><strong>Condition d'anciennet\xc3\xa9</strong></td>
                <td class="p-3 text-gray-700">4 mois minimum (88 jours ou 610h) sur 28 mois</td>
              </tr>
              <tr class="border-b border-orange-100">
                <td class="p-3 text-gray-700"><strong>Dur\xc3\xa9e max indemnisation (&lt; 53 ans)</strong></td>
                <td class="p-3 text-gray-700">24 mois maximum</td>
              </tr>
              <tr class="bg-white">
                <td class="p-3 text-gray-700"><strong>Dur\xc3\xa9e max indemnisation (\xe2\x89\xa5 53 ans)</strong></td>
                <td class="p-3 text-gray-700">36 mois maximum</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-600 mt-4">
          <strong>Sources :</strong> 
          <a href="https://www.service-public.fr/particuliers/vosdroits/N549" target="_blank" rel="noopener" class="text-orange-600 hover:underline">service-public.fr</a>, 
          <a href="https://www.france-travail.fr" target="_blank" rel="noopener" class="text-orange-600 hover:underline">france-travail.fr</a>
          | <em>Donn\xc3\xa9es officielles en vigueur au 1er janvier 2026</em>
        </p>
      </section>

'''

old_section = b'''      </section>

      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          \xf0\x9f\xa7\xbe Ce que permet ce simulateur'''

new_section = b'''      </section>

''' + baremes_section + b'''      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          \xf0\x9f\xa7\xbe Ce que permet ce simulateur'''

raw = raw.replace(old_section, new_section)

with open('src/pages/are.html', 'wb') as f:
    f.write(raw)

print("Phase 1 - OK")
