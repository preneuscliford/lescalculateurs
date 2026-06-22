"""
Ajoute les favicons, breadcrumb schema, et CSS aux 4 nouvelles pages.
"""
pages = [
    'src/pages/allocation-familiale.html',
    'src/pages/aspa.html',
    'src/pages/carte-famille-nombreuse.html',
    'src/pages/garantie-visale.html',
]

favicon_block = '''    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="manifest" href="../assets/site.webmanifest">
    <link rel="shortcut icon" href="../assets/favicon.ico">

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
    <link rel="manifest" href="/assets/site.webmanifest">
    <link rel="shortcut icon" href="/assets/favicon.ico">
<link rel="stylesheet" href="../tailwind.css">'''

for page_path in pages:
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Vérifier si déjà présent
    if 'favicon-32x32.png' in content:
        print(f'{page_path}: favicons déjà présents')
        continue

    # Insérer après le meta charset ou après le link rel="stylesheet"
    insert_after = '<meta name="google-adsense-account" content="ca-pub-2209781252231399" />'
    if 'canonical' in content and 'tailwind.css' not in content:
        insert_after = 'rel="canonical"'
    
    if insert_after in content:
        # Trouver la fin de la ligne du meta adsense
        idx = content.find(insert_after)
        if idx != -1:
            end_of_line = content.find('\n', idx)
            content = content[:end_of_line+1] + favicon_block + '\n' + content[end_of_line+1:]
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'{page_path}: favicons + tailwind.css ajoutés')

print('\nTerminé.')