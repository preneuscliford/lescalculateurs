# Test d'encodage
with open('pages_YMYL_FINAL_V2/apl.html', 'r', encoding='utf-8-sig') as f:
    content = f.read()
    
# Chercher la ligne specifique
import re
match = re.search(r'"name": "([^"]*estim[^"]*)"', content)
if match:
    print('Found:', repr(match.group(1)))
else:
    print('Not found')
    
# Verifier si le caractere est un vrai é ou un �
test_chars = ['é', 'è', 'ê', 'ë', '�']
for char in test_chars:
    if char in content:
        print(f'Found character: {repr(char)} (ord: {ord(char)})')

# Ecrire dans un fichier test
with open('test_output.html', 'w', encoding='utf-8') as f:
    f.write(content)
    
print('Written to test_output.html')
