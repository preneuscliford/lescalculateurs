# Script de nettoyage - Supprimer les avertissements en double et le HTML orphelin
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$folder = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages\blog\departements"
$files = Get-ChildItem -Path $folder -Filter "frais-notaire-*.html"

Write-Host "=== Nettoyage des $($files.Count) pages ===" -ForegroundColor Cyan

$totalCleaned = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # 1. Garder seulement le premier avertissement legal, supprimer les suivants
    $avertissementPattern = '(\s*<!-- AVERTISSEMENT LEGAL -->[\s\S]*?<!-- FIN AVERTISSEMENT LEGAL -->\s*)'
    $matches = [regex]::Matches($content, $avertissementPattern)
    
    if ($matches.Count -gt 1) {
        # Garder le premier, supprimer les autres
        for ($i = $matches.Count - 1; $i -ge 1; $i--) {
            $content = $content.Remove($matches[$i].Index, $matches[$i].Length)
        }
    }
    
    # 2. Supprimer les blocs CTA orphelins (</div> + <!-- CTA BLOCK END --> sans contenu)
    $orphanPattern = '\s*</div>\s*<!-- CTA BLOCK END -->\s*(?=\s*</div>\s*<!-- CTA BLOCK END -->|\s*<!-- Article Header)'
    while ($content -match $orphanPattern) {
        $content = $content -replace $orphanPattern, ''
    }
    
    # 3. Nettoyer les espaces multiples
    $content = $content -replace '(\r?\n){4,}', "`n`n`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "[CLEAN] $($file.Name)" -ForegroundColor Green
        $totalCleaned++
    } else {
        Write-Host "[-] $($file.Name) - deja propre" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "Fichiers nettoyes: $totalCleaned / $($files.Count)" -ForegroundColor Green
