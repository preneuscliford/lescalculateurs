# Script de nettoyage FINAL - Patterns restants
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$folder = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages\blog\departements"
$files = Get-ChildItem -Path $folder -Filter "frais-notaire-*.html"

Write-Host "=== NETTOYAGE FINAL ===" -ForegroundColor Magenta

$E = [char]0x20AC
$totalChanges = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # 1. FAQ Schema.org - Texte complet
    $content = $content -replace '"text":\s*"Pour un bien de 200 000 ' + $E + ', l''[eéE]conomie peut atteindre 7 600 ' + $E + ' en choisissant le neuf \(VEFA\)\."', '"text": "L''achat dans le neuf (VEFA) permet generalement une economie de plusieurs points de pourcentage sur les frais de notaire par rapport a l''ancien."'
    
    # 2. "jusqu'a 7 600 € d'economie pour un bien a 200 000 €"
    $content = $content -replace "jusqu'[àa] <strong>7 600 " + $E + " d'[éeE]conomie</strong> pour un bien [àa] 200 000 " + $E + "\.", 'une <strong>economie de plusieurs milliers d''euros</strong> en choisissant le neuf.'
    
    # 3. "vous ne paieriez que X €, soit une economie de Y €"
    $content = $content -replace "<strong>[\d\s]+ " + $E + "</strong>, soit une [éeE]conomie de <strong>[\d\s]+ " + $E + "</strong>", 'des frais significativement reduits en choisissant le neuf'
    
    # 4. "Economie potentielle : 300-800 €"
    $content = $content -replace "[EÉ]conomie potentielle : <strong>300-800 " + $E + "</strong>", 'Economie potentielle : <strong>plusieurs centaines d''euros</strong>'
    
    # 5. Footer avec montants - pattern exact
    $content = $content -replace "Ancien : [≈~] [\d\s]+ " + $E + " pour [\d\s]+ " + $E + " \(droits [≈~] [\d,\.]+%\) [•·] Neuf : [≈~] [\d\s]+ " + $E + " pour [\d\s]+ " + $E + " \(droits [≈~] [\d,\.]+%\)\.", 'Ancien : environ 7 a 9% du prix. Neuf (VEFA) : environ 2 a 3%. Utilisez le simulateur pour une estimation.'
    
    # 6. Mediane des prix format "60 000 €"
    $content = $content -replace "est de <strong>[\d\s]+ " + $E + "</strong>", 'varie selon les biens'
    
    # Sauvegarder
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline -ErrorAction Stop
            Write-Host "[OK] $($file.Name)" -ForegroundColor Green
            $totalChanges++
        } catch {
            Write-Host "[ERR] $($file.Name)" -ForegroundColor Red
        }
    } else {
        Write-Host "[-] $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Fichiers modifies: $totalChanges ===" -ForegroundColor Cyan
