# Script pour corriger les erreurs d'orthographe communes
$replacements = @(
    # Erreurs d'accents
    @{ Pattern = 'calcul[eéèê]r(?!\w)'; Replacement = 'calculer' },
    @{ Pattern = 'd[eéèê]clar[eéèê]r(?!\w)'; Replacement = 'déclarer' },
    @{ Pattern = 'simul[eéèê]r(?!\w)'; Replacement = 'simuler' },
    @{ Pattern = 'Calcul[eéèê]r(?!\w)'; Replacement = 'Calculer' },
    @{ Pattern = 'D[eéèê]clar[eéèê]r(?!\w)'; Replacement = 'Déclarer' },
    @{ Pattern = 'Simul[eéèê]r(?!\w)'; Replacement = 'Simuler' }
);

# Fichiers à traiter
$files = @();
$files += Get-ChildItem pages_YMYL_SAFE -Filter "*.html" -ErrorAction SilentlyContinue;
$files += Get-ChildItem src/pages -Recurse -Filter "*.html" -ErrorAction SilentlyContinue;

$fixedCount = 0;

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8;
    $originalContent = $content;
    
    foreach ($rep in $replacements) {
        $content = $content -replace $rep.Pattern, $rep.Replacement;
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline;
        $fixedCount++;
        Write-Host "✅ Corrigé: $($file.FullName.Replace($PWD.Path + '\', ''))";
    }
}

Write-Host "`n==================================";
Write-Host "Fichiers corrigés: $fixedCount";
Write-Host "==================================";
