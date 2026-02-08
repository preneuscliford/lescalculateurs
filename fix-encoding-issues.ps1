# Script pour corriger les erreurs d'encodage courantes

# Table de conversion des erreurs fréquentes
$replacements = @(
    # UTF-8 mal interprété comme Latin-1/Windows-1252
    @{ Bad = 'Ã©'; Good = 'é' },      # é
    @{ Bad = 'Ã¨'; Good = 'è' },      # è
    @{ Bad = 'Ã '; Good = 'à' },      # à
    @{ Bad = 'Ã´'; Good = 'ô' },      # ô
    @{ Bad = 'Ã»'; Good = 'û' },      # û
    @{ Bad = 'Ã§'; Good = 'ç' },      # ç
    @{ Bad = 'Å“'; Good = 'œ' },      # œ
    @{ Bad = 'Ã‰'; Good = 'É' },      # É
    @{ Bad = 'Ã€'; Good = 'À' },      # À
    @{ Bad = 'ÃŠ'; Good = 'Ê' },      # Ê
    @{ Bad = 'Ã'; Good = 'à' },       # à (cas général)
    @{ Bad = 'Â'; Good = '' },        # caractère indésirable
    
    # Caractère de remplacement Unicode
    @{ Bad = "`u{FFFD}"; Good = 'é' }  # � → é (cas spécifique calculér)
);

$files = @();
$files += Get-ChildItem pages_YMYL_SAFE -Filter "*.html";
$files += Get-ChildItem src/pages -Recurse -Filter "*.html";

$fixedCount = 0;
$totalReplacements = 0;

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8;
    $originalContent = $content;
    $fileReplacements = 0;
    
    foreach ($rep in $replacements) {
        $count = [regex]::Matches($content, [regex]::Escape($rep.Bad)).Count;
        if ($count -gt 0) {
            $content = $content -replace [regex]::Escape($rep.Bad), $rep.Good;
            $fileReplacements += $count;
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline;
        $fixedCount++;
        $totalReplacements += $fileReplacements;
        Write-Host "✅ Corrigé $fileReplacements erreurs dans: $($file.FullName.Replace($PWD.Path + '\', ''))";
    }
}

Write-Host "`n==================================";
Write-Host "Fichiers corrigés: $fixedCount";
Write-Host "Total corrections: $totalReplacements";
Write-Host "==================================";
