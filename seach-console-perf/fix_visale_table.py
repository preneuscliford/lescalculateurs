with open('src/pages/garantie-visale.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Corriger les <td> sans text-gray-900
c = c.replace('<td class="border border-gray-300 p-3 font-semibold">', '<td class="border border-gray-300 p-3 font-semibold text-gray-900">')
c = c.replace('<td class="border border-gray-300 p-3 text-center">', '<td class="border border-gray-300 p-3 text-center text-gray-900">')
c = c.replace('<td class="border border-gray-300 p-3 text-left font-semibold text-gray-800">', '<td class="border border-gray-300 p-3 text-left font-semibold text-gray-900">')
c = c.replace('<td class="border border-gray-300 p-3 text-center font-semibold text-gray-800">', '<td class="border border-gray-300 p-3 text-center font-semibold text-gray-900">')

# Corriger les th text-gray-800
c = c.replace('text-gray-800', 'text-gray-900')

# Corriger les tr sans fond
c = c.replace('class="hover:bg-gray-50">', 'class="hover:bg-gray-100 bg-gray-50">')

with open('src/pages/garantie-visale.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('Tableau garantie-visale corrigé')