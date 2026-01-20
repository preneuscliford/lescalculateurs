# Script de nettoyage juridique profond - 102 pages departementales
# Objectif : Supprimer TOUS les montants en euros, elargir fourchettes, renforcer avertissements
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$folder = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages\blog\departements"
$files = Get-ChildItem -Path $folder -Filter "frais-notaire-*.html"

Write-Host "=== NETTOYAGE JURIDIQUE PROFOND - $($files.Count) pages ===" -ForegroundColor Cyan
Write-Host "Regles appliquees:" -ForegroundColor Yellow
Write-Host "  - Supprimer TOUS les montants fixes en euros" -ForegroundColor Yellow
Write-Host "  - Elargir fourchettes (7-9% ancien, 2-3% neuf)" -ForegroundColor Yellow
Write-Host "  - Remplacer exemples chiffres par renvois simulateur" -ForegroundColor Yellow
Write-Host ""

$totalChanges = 0
$euro = [char]0x20AC

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $changes = 0
    
    # ==========================================================
    # 1. ELARGIR LES FOURCHETTES (7-8% -> 7-9%)
    # ==========================================================
    
    # Header bloc jaune
    if ($content -match 'entre 7% et 8% du prix') {
        $content = $content -replace 'entre 7% et 8% du prix', 'entre 7% et 9% du prix'
        $changes++
    }
    
    # Introduction avec fourchette
    if ($content -match 'entre\s*<strong>4%\s*et\s*8\.?0?%') {
        $content = $content -replace 'entre\s*<strong>4%\s*et\s*8\.?0?%', 'entre <strong>2% et 9%'
        $changes++
    }
    
    # ==========================================================
    # 2. SUPPRIMER TABLEAU COMPARATIF AVEC MONTANTS FIXES
    # ==========================================================
    
    # Remplacer colonne "Pour 200 000 €" par "Estimation"
    $content = $content -replace '<th class="px-6 py-4 text-left font-semibold">Pour 200\s*000\s*'+$euro+'</th>', '<th class="px-6 py-4 text-left font-semibold">Estimation</th>'
    
    # Remplacer les montants dans les cellules par renvoi simulateur
    $content = $content -replace '<td class="px-6 py-4 font-bold text-orange-600">\d+[\s\d]*'+$euro+'</td>', '<td class="px-6 py-4 text-gray-600"><a href="/pages/notaire.html" class="text-blue-600 hover:underline">Calculer</a></td>'
    $content = $content -replace '<td class="px-6 py-4 font-bold text-blue-600">\d+[\s\d]*'+$euro+'</td>', '<td class="px-6 py-4 text-gray-600"><a href="/pages/notaire.html" class="text-blue-600 hover:underline">Calculer</a></td>'
    
    # ==========================================================
    # 3. SUPPRIMER SECTION SIMULATION COMPLETE
    # ==========================================================
    
    # Remplacer le bloc "Projet d'achat" par un texte generique
    $patternSimulation = '<div class="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 mb-6">[\s\S]*?<h3 class="text-xl font-bold text-gray-900 mb-4">Projet d''achat[\s\S]*?</div>\s*</div>\s*</div>'
    if ($content -match $patternSimulation) {
        $replacementSimulation = @'
<div class="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 mb-6 text-center">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Estimez votre projet</h3>
          <p class="text-gray-700 mb-4">Le montant exact des frais depend du prix du bien, de sa nature et des formalites specifiques a votre dossier.</p>
          <a href="/pages/notaire.html" class="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700">Calculer mes frais de notaire</a>
        </div>
'@
        $content = $content -replace $patternSimulation, $replacementSimulation
        $changes++
    }
    
    # ==========================================================
    # 4. SUPPRIMER "BON A SAVOIR" AVEC MONTANTS
    # ==========================================================
    
    # Pattern: "jusqu'a X XXX € d'economie"
    $content = $content -replace "jusqu'[àa]\s*<strong>[\d\s]+\s*$euro\s*d'[ée]conomie</strong>\s*pour un bien [àa]\s*[\d\s]+\s*$euro", "une economie significative en choisissant le neuf"
    
    # Pattern: "Pour un bien de 200 000 €, l'économie peut atteindre..."
    $content = $content -replace "Pour un bien de\s*[\d\s]+\s*$euro,\s*l'[ée]conomie peut atteindre\s*[\d\s]+\s*$euro", "L''achat dans le neuf permet generalement une economie de plusieurs points de pourcentage sur les frais"
    
    # ==========================================================
    # 5. SUPPRIMER PRIX AU M2 FIXES
    # ==========================================================
    
    # Remplacer les prix au m2 par "Variable"
    $content = $content -replace '<p class="text-3xl font-bold text-blue-600 mb-1">[\d\s]+\s*'+$euro+'/m[²2]</p>', '<p class="text-xl font-bold text-blue-600 mb-1">Variable selon secteur</p>'
    $content = $content -replace '<p class="text-3xl font-bold text-green-600 mb-1">[\d\s]+\s*'+$euro+'/m[²2]</p>', '<p class="text-xl font-bold text-green-600 mb-1">Variable selon secteur</p>'
    $content = $content -replace '<p class="text-3xl font-bold text-orange-600 mb-1">[\d\s]+\s*'+$euro+'/m[²2]</p>', '<p class="text-xl font-bold text-orange-600 mb-1">Variable selon secteur</p>'
    
    # Prix moyen au m2 dans introduction
    $content = $content -replace '<strong>[\d\s]+\s*'+$euro+'</strong>,\s*ce qui impacte', '<strong>variable selon les communes</strong>, ce qui impacte'
    
    # ==========================================================
    # 6. SUPPRIMER DEBOURS FIXES
    # ==========================================================
    
    # Debours moyens
    $content = $content -replace '<span class="font-mono bg-purple-100 px-3 py-1 rounded">\d+\s*'+$euro+'</span>', '<span class="font-mono bg-purple-100 px-3 py-1 rounded">Variable</span>'
    
    # ==========================================================
    # 7. NETTOYER FAQ AVEC CHIFFRES
    # ==========================================================
    
    # FAQ: "le neuf ≈ X,XX% et l'ancien ≈ X.X%"
    $content = $content -replace 'Le\s*<strong>neuf</strong>\s*[≈~]\s*[\d,\.]+%\s*et\s*l''<strong>ancien</strong>\s*[≈~]\s*[\d,\.]+%', 'Le <strong>neuf</strong> represente environ 2 a 3% et l''<strong>ancien</strong> environ 7 a 9%'
    
    # ==========================================================
    # 8. SUPPRIMER FOOTER AVEC MONTANTS
    # ==========================================================
    
    # Pattern final "Ancien : ≈ XX XXX € pour 200 000 €"
    $content = $content -replace "Ancien\s*:\s*[≈~]\s*[\d\s]+\s*$euro\s*pour\s*[\d\s]+\s*$euro[^.]*\.\s*Neuf\s*:\s*[≈~]\s*[\d\s]+\s*$euro\s*pour\s*[\d\s]+\s*$euro[^.]*\.", "Ancien : environ 7 a 9% du prix. Neuf (VEFA) : environ 2 a 3% du prix. Utilisez le simulateur pour une estimation personnalisee."
    
    # ==========================================================
    # 9. SUPPRIMER MENSUALITES ET MONTANTS RESTANTS
    # ==========================================================
    
    # Mensualite estimee
    $content = $content -replace '<span class="text-3xl font-bold text-blue-700">[≈~]\s*[\d\s]+\s*'+$euro+'/mois</span>', '<span class="text-xl font-bold text-blue-700">A calculer selon votre projet</span>'
    
    # "vous ne paieriez que X XXX €"
    $content = $content -replace "vous ne paieriez que\s*<strong>[\d\s]+\s*$euro</strong>,\s*soit une [ée]conomie de\s*<strong>[\d\s]+\s*$euro</strong>", "les frais seraient significativement reduits"
    
    # Economie potentielle
    $content = $content -replace "[ÉE]conomie potentielle\s*:\s*<strong>[\d\-]+\s*$euro</strong>", "Economie potentielle : <strong>variable selon le bien</strong>"
    
    # ==========================================================
    # 10. RENFORCER AVERTISSEMENT LEGAL
    # ==========================================================
    
    $oldAvertissement = '<!-- AVERTISSEMENT LEGAL -->[\s\S]*?<!-- FIN AVERTISSEMENT LEGAL -->'
    $newAvertissement = @'
<!-- AVERTISSEMENT LEGAL -->
      <div class="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <p class="text-sm text-gray-800 m-0">
          <strong>Avertissement legal :</strong> Les informations presentees sur cette page sont fournies a titre strictement indicatif sur la base des baremes reglementes en vigueur. Elles ne constituent ni un devis, ni un conseil juridique. Seul un notaire est habilite a determiner le montant exact des frais lors de la signature de l'acte authentique.
          <a href="/pages/notaire.html" class="text-blue-600 underline font-semibold">Utilisez notre simulateur</a> pour une premiere estimation.
        </p>
      </div>
      <!-- FIN AVERTISSEMENT LEGAL -->
'@
    if ($content -match $oldAvertissement) {
        $content = $content -replace $oldAvertissement, $newAvertissement
        $changes++
    }
    
    # Sauvegarder si modifications
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "[OK] $($file.Name)" -ForegroundColor Green
        $totalChanges++
    } else {
        Write-Host "[-] $($file.Name) - aucune modification" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
Write-Host "Fichiers modifies: $totalChanges / $($files.Count)" -ForegroundColor Green
