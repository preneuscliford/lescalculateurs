# -*- coding: utf-8 -*-
import codecs

with codecs.open('src/pages/prime-activite.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer le H1 avec l'apostrophe typographique
old_text = 'Simulateur Prime d\u2019activité 2026 : estimation du montant mensuel'
new_text = '''Simulateur Prime d\u2019activité 2026 — barèmes CAF et calcul du montant mensuel
        </h1>
        <p class="text-sm text-green-200 mb-3">
          <span class="inline-flex items-center bg-green-800 bg-opacity-50 px-3 py-1 rounded-full">
            <span class="mr-1">✓</span> Vérifié le 12 février 2026 — Barèmes CAF officiels à jour
          </span>
        </p'''

if old_text in content:
    content = content.replace(old_text, new_text)
    with codecs.open('src/pages/prime-activite.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK - H1 et date ajoutes')
else:
    print('Texte non trouve')
