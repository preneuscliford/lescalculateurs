# -*- coding: utf-8 -*-
import codecs

with codecs.open('src/pages/are.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Ajouter la date après le H1
old = '''</h1>
        <p class="text-xl text-orange-100 mb-6">'''

new = '''</h1>
        <p class="text-sm text-orange-200 mb-2">
          <span class="inline-flex items-center bg-orange-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">✓</span> Vérifié le 12 février 2026 — Barèmes officiels à jour
          </span>
        </p>
        <p class="text-xl text-orange-100 mb-6">'''

c = c.replace(old, new)

with codecs.open('src/pages/are.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('Date OK')
