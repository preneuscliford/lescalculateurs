with open('src/pages/carte-famille-nombreuse.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Corriger les <td> sans text-gray-900
c = c.replace('<td class="border border-gray-300 p-3 font-semibold">', '<td class="border border-gray-300 p-3 font-semibold text-gray-900">')
c = c.replace('<td class="border border-gray-300 p-3 text-center">', '<td class="border border-gray-300 p-3 text-center text-gray-900">')

# Corriger bg-white invisible sur fond blanc
c = c.replace('class="hover:bg-gray-50 bg-white"', 'class="hover:bg-gray-100 bg-gray-50"')

# Ajouter bg-gray-50 aux tr sans fond
c = c.replace('class="hover:bg-gray-50">', 'class="hover:bg-gray-100 bg-gray-50">')

# Corriger les th text-gray-800 -> text-gray-900
c = c.replace('text-gray-800', 'text-gray-900')

with open('src/pages/carte-famille-nombreuse.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('Tableau carte-famille-nombreuse corrigé')
print('- td sans style -> text-gray-900')
print('- bg-white -> bg-gray-50')
print('- text-gray-800 -> text-gray-900')