# -*- coding: utf-8 -*-
import codecs

with codecs.open('src/pages/are.html', 'r', encoding='utf-8') as f:
    c = f.read()

baremes = '''      <!-- Barèmes officiels ARE 2026 -->
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
                <td class="p-3 text-gray-700"><strong>Condition d\'ancienneté</strong></td>
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

old = '''      </section>

      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          🧾 Ce que permet ce simulateur'''

new = '''      </section>

''' + baremes + '''      <section
        class="mb-10 bg-orange-50 border border-orange-100 rounded-lg p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          🧾 Ce que permet ce simulateur'''

c = c.replace(old, new)

with codecs.open('src/pages/are.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('Baremes OK')
