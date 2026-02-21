# -*- coding: utf-8 -*-
import codecs

with codecs.open('src/pages/apl.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = "          <div>\n            <h3 class=\"text-lg font-semibold text-gray-900 mb-2\">\n              Quelles ressources pour l\u2019APL ?\n            </h3>\n            <p class=\"text-gray-600\">\n              La CAF utilise des <strong>ressources</strong> transmises par\n              l\u2019administration fiscale et recalcul\u00e9es selon ses r\u00e8gles. Plus vos\n              ressources sont \u00e9lev\u00e9es, plus la participation personnelle\n              augmente et plus l\u2019APL diminue. En cas de changement de situation,\n              il faut le d\u00e9clarer rapidement.\n            </p>\n          </div>"

new = """          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Quelles ressources pour l\u2019APL ?
            </h3>
            <p class="text-gray-600">
              La CAF utilise des <strong>ressources</strong> transmises par
              l\u2019administration fiscale et recalcul\u00e9es selon ses r\u00e8gles. Plus vos
              ressources sont \u00e9lev\u00e9es, plus la participation personnelle
              augmente et plus l\u2019APL diminue. En cas de changement de situation,
              il faut le d\u00e9clarer rapidement.
            </p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Comment calculer votre participation personnelle APL ?
            </h3>
            <p class="text-gray-600 mb-3">
              La <strong>participation personnelle</strong> est la somme que vous devez payer de votre poche. Elle est calcul\u00e9e selon vos revenus et votre situation familiale.
            </p>
            <div class="bg-white p-3 rounded-lg mb-3 border">
              <p class="text-sm font-mono">
                Participation = (Revenus \u00d7 0.0038) \u2212 Forfait charges
              </p>
            </div>
            <p class="text-gray-600 text-sm mb-2">
              <strong>Exemple :</strong> Avec 2 000\u20ac de revenus :
            </p>
            <ul class="text-gray-600 text-sm space-y-1 ml-4">
              <li>\u2022 2 000\u20ac \u00d7 0.0038 = 7,60\u20ac</li>
              <li>\u2022 Moins forfait charges (12\u20ac pour 1 pers.)</li>
              <li>\u2022 \u2192 Participation minimale</li>
            </ul>
          </div>"""

if old in content:
    content = content.replace(old, new)
    with codecs.open('src/pages/apl.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("OK - Section ajoutee")
else:
    print("Pattern non trouve")
