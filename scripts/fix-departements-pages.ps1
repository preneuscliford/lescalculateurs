# Script de correction des 102 pages departementales
# Encodage UTF-8 avec BOM pour caracteres speciaux
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$folder = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages\blog\departements"
$files = Get-ChildItem -Path $folder -Filter "frais-notaire-*.html"

Write-Host "=== Correction des $($files.Count) pages departementales ===" -ForegroundColor Cyan

$totalChanges = 0
$euro = [char]0x20AC
$approx = [char]0x2248
$bullet = [char]0x2022

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $changes = 0
    
    # 1. Remplacer bloc avec montants fixes par fourchettes en %
    $patternMontants = "$approx\s*[\d\s]+\s*$euro\s*pour\s*200\s*000\s*$euro\s*\(ancien.*?$approx\s*0,71%\)"
    $replacementMontants = "entre 7% et 8% du prix (ancien) $bullet entre 2% et 3% (neuf/VEFA)"
    if ($content -match $patternMontants) {
        $content = $content -replace $patternMontants, $replacementMontants
        $changes++
    }
    
    # 2. Corriger la date "6 octobre 2025"
    if ($content -match '6 octobre 2025') {
        $content = $content -replace '6 octobre 2025', 'Janvier 2026'
        $changes++
    }
    
    # 3. Corriger FAQ "2025 :" dans les questions
    if ($content -match '(\w+) 2025 : neuf ou ancien') {
        $content = $content -replace '(\w+) 2025 : neuf ou ancien', '$1 2026 : neuf ou ancien'
        $changes++
    }
    
    # 4. Corriger "estimation precise"
    if ($content -match 'estimation pr.cise') {
        $content = $content -replace 'estimation pr.cise', 'estimation indicative'
        $changes++
    }
    
    # 5. Ajouter avertissement legal si absent
    if ($content -notmatch 'AVERTISSEMENT LEGAL') {
        $avertissement = @"

      <!-- AVERTISSEMENT LEGAL -->
      <div class="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <p class="text-sm text-gray-800 m-0">
          <strong>Avertissement :</strong> Les informations sont des estimations indicatives basees sur les baremes reglementes. Elles ne remplacent pas un devis notarial.
          <a href="/pages/notaire.html" class="text-blue-600 underline">Utilisez notre simulateur</a> pour une estimation personnalisee.
        </p>
      </div>
      <!-- FIN AVERTISSEMENT LEGAL -->
"@
        $content = $content -replace '(<!-- CTA BLOCK END -->)', "`$1$avertissement"
        $changes++
    }
    
    # 6. Mettre a jour dateModified dans schema.org
    if ($content -match '"dateModified":\s*"2025-') {
        $content = $content -replace '"dateModified":\s*"2025-\d{2}-\d{2}T[\d:\.]+Z"', '"dateModified": "2026-01-18T10:00:00Z"'
        $changes++
    }
    
    # Sauvegarder si modifications
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "[OK] $($file.Name) - $changes corrections" -ForegroundColor Green
        $totalChanges += $changes
    } else {
        Write-Host "[-] $($file.Name) - aucune modification" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "Fichiers traites: $($files.Count)" -ForegroundColor White
Write-Host "Total corrections: $totalChanges" -ForegroundColor Green
