# Script de nettoyage AGRESSIF - Supprimer TOUS les euros restants
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$folder = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages\blog\departements"
$files = Get-ChildItem -Path $folder -Filter "frais-notaire-*.html"

Write-Host "=== NETTOYAGE AGRESSIF - Suppression de TOUS les euros ===" -ForegroundColor Red

# Utiliser le code Unicode pour le symbole euro
$E = [char]0x20AC

$totalChanges = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # 1. FAQ Schema.org - remplacer le texte avec montants
    $pattern1 = '"text":\s*"Pour un bien de[\d\s' + $E + ',\.]+l''[eE]conomie peut atteindre[\d\s' + $E + ',\.]+'
    $content = $content -replace $pattern1, '"text": "L''achat dans le neuf permet generalement une economie de plusieurs points de pourcentage sur les frais de notaire par rapport a l''ancien.'
    
    # 2. Prix au m2 dans introduction
    $pattern2 = '<strong>[\d\s]+\s*' + $E + '</strong>,\s*ce qui impacte'
    $content = $content -replace $pattern2, '<strong>variable selon les communes</strong>, ce qui impacte'
    
    # 3. Prix au m2 dans texte libre
    $pattern3 = 'prix moyens de\s*[\d\s]+\s*' + $E + '/m'
    $content = $content -replace $pattern3, 'prix variables selon les secteurs/m'
    
    # 4. Tableau header "Pour 200 000 E"
    $pattern4 = '<th class="px-6 py-4 text-left font-semibold">Pour\s*[\d\s]+\s*' + $E + '</th>'
    $content = $content -replace $pattern4, '<th class="px-6 py-4 text-left font-semibold">Estimation</th>'
    
    # 5. Cellules tableau avec montants
    $pattern5a = '<td class="px-6 py-4 font-bold text-orange-600">[\d\s]+\s*' + $E + '</td>'
    $content = $content -replace $pattern5a, '<td class="px-6 py-4 text-gray-600"><a href="/pages/notaire.html" class="text-blue-600 hover:underline">Simuler</a></td>'
    
    $pattern5b = '<td class="px-6 py-4 font-bold text-blue-600">[\d\s]+\s*' + $E + '</td>'
    $content = $content -replace $pattern5b, '<td class="px-6 py-4 text-gray-600"><a href="/pages/notaire.html" class="text-blue-600 hover:underline">Simuler</a></td>'
    
    # 6. "jusqu'a X E d'economie"
    $pattern6 = "jusqu'[aà]\s*<strong>[\d\s]+\s*" + $E + "\s*d'[eéE]conomie</strong>\s*pour un bien [aà]\s*[\d\s]+\s*" + $E
    $content = $content -replace $pattern6, 'une <strong>economie significative</strong> en choisissant le neuf'
    
    # 7. Mensualites
    $pattern7 = '<span class="text-3xl font-bold text-blue-700">[^<]*' + $E + '/mois</span>'
    $content = $content -replace $pattern7, '<span class="text-xl font-bold text-blue-700"><a href="/pages/pret.html" class="hover:underline">Calculer</a></span>'
    
    # 8. "vous ne paieriez que X E"
    $pattern8 = 'vous ne paieriez que\s*<strong>[\d\s]+\s*' + $E + '</strong>,\s*soit une [eéE]conomie de\s*<strong>[\d\s]+\s*' + $E + '</strong>'
    $content = $content -replace $pattern8, 'les frais seraient significativement reduits'
    
    # 9. Economie potentielle
    $pattern9 = '[EÉ]conomie potentielle\s*:\s*<strong>[\d\-]+\s*' + $E + '</strong>'
    $content = $content -replace $pattern9, 'Economie potentielle : <strong>variable</strong>'
    
    # 10. Prix au m2 dans cards
    $pattern10a = '<p class="text-3xl font-bold text-blue-600 mb-1">[\d\s]+\s*' + $E + '/m'
    $content = $content -replace $pattern10a, '<p class="text-lg font-bold text-blue-600 mb-1">Prix variable/m'
    
    $pattern10b = '<p class="text-3xl font-bold text-green-600 mb-1">[\d\s]+\s*' + $E + '/m'
    $content = $content -replace $pattern10b, '<p class="text-lg font-bold text-green-600 mb-1">Prix variable/m'
    
    $pattern10c = '<p class="text-3xl font-bold text-orange-600 mb-1">[\d\s]+\s*' + $E + '/m'
    $content = $content -replace $pattern10c, '<p class="text-lg font-bold text-orange-600 mb-1">Prix variable/m'
    
    # 11. Debours moyens
    $pattern11 = '<span class="font-mono bg-purple-100 px-3 py-1 rounded">[\d\s]+\s*' + $E + '</span>'
    $content = $content -replace $pattern11, '<span class="font-mono bg-purple-100 px-3 py-1 rounded">Variable</span>'
    
    # 12. Footer avec montants
    $pattern12 = 'Ancien\s*:\s*[^.]+' + $E + '[^.]+\.\s*Neuf\s*:\s*[^.]+' + $E + '[^.]+\.'
    $content = $content -replace $pattern12, 'Ancien : environ 7 a 9% du prix. Neuf (VEFA) : environ 2 a 3% du prix.'
    
    # 13. Mediane des prix DVF
    $pattern13 = 'La\s*<strong>m[eéE]diane des prix</strong>\s*des ventes est de\s*<strong>[\d\s]+\s*' + $E + '</strong>'
    $content = $content -replace $pattern13, 'Les prix varient selon les biens'
    
    # Sauvegarder
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline -ErrorAction Stop
            Write-Host "[OK] $($file.Name)" -ForegroundColor Green
            $totalChanges++
        } catch {
            Write-Host "[ERR] $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[-] $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Fichiers modifies: $totalChanges ===" -ForegroundColor Cyan
