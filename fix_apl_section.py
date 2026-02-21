# -*- coding: utf-8 -*-
import codecs

with codecs.open('src/pages/apl.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Texte à rechercher (avec l'apostrophe typographique)
old_section = '''          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Comment est calculée l'APL ?
            </h3>
            <p class="text-gray-600">
              Le calcul exact dépend de la zone, du loyer retenu (plafonné), de
              la composition du foyer et des ressources. Une lecture simple est
              :
              <strong>APL ≈ loyer retenu − participation personnelle</strong>.
              Pour un chiffre adapté à votre cas, utilisez le simulateur
              ci‑dessus.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              APL pour propriétaire : ce qu'il faut savoir'''

new_section = '''          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Comment calculer votre participation personnelle APL ?
            </h3>
            <p class="text-gray-600 mb-3">
              La <strong>participation personnelle</strong> est la somme que vous devez payer de votre poche. Elle est calculée selon vos revenus et votre situation familiale.
            </p>
            <div class="bg-gray-50 p-3 rounded-lg mb-3">
              <p class="text-sm font-mono bg-white p-2 rounded border">
                Participation = (Revenus mensuels × 0.0038) − Forfait charges
              </p>
            </div>
            <p class="text-gray-600 text-sm mb-2">
              <strong>Exemple concret :</strong> Avec 2 000€ de revenus mensuels :
            </p>
            <ul class="text-gray-600 text-sm space-y-1 ml-4 mb-3">
              <li>• Calcul : 2 000€ × 0.0038 = 7,60€</li>
              <li>• Moins forfait charges (ex: 12€ pour 1 personne)</li>
              <li>• → Participation = 0€ minimum (forfait déductible)</li>
            </ul>
            <p class="text-gray-600 text-sm">
              Plus vos revenus sont élevés, plus votre participation augmente et moins vous recevez d'APL.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Comment est calculée l'APL ?
            </h3>
            <p class="text-gray-600">
              Le calcul exact dépend de la zone, du loyer retenu (plafonné), de
              la composition du foyer et des ressources. Une lecture simple est
              :
              <strong>APL ≈ loyer retenu − participation personnelle</strong>.
              Pour un chiffre adapté à votre cas, utilisez le simulateur
              ci‑dessus.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              APL pour propriétaire : ce qu'il faut savoir'''

if old_section in content:
    content = content.replace(old_section, new_section)
    print("Section remplacee avec succes")
else:
    print("Section non trouvee - tentative avec pattern alternatif")
    # Essayer avec des espaces differents
    old_section2 = old_section.replace("'", "'")
    if old_section2 in content:
        content = content.replace(old_section2, new_section)
        print("Section remplacee (pattern 2)")
    else:
        print("Pattern 2 non trouve non plus")

with codecs.open('src/pages/apl.html', 'w', encoding='utf-8') as f:
    f.write(content)
