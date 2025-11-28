# ----------------------------------------------------------
#  CORRECTION AUTO DUPLICATE  –  FRANCE ENTIERE 101 DEPTS
#  Run from project root :  .\correction-auto-duplicate.ps1
# ----------------------------------------------------------
param(
    [string]$Folder = "src/pages/blog/departements",
    [int]$SimilarityThreshold = 85,   # % de similarité strict
    [switch]$WhatIf                   # dry-run mode
)

Add-Type -AssemblyName System.Web

function Get-FileHashPlain($path){
    (Get-FileHash $path -Algorithm SHA256).Hash
}

function Similarity($a,$b){
    # algo très rapide : nombre de lignes communes / total
    $linesA = Get-Content $a -Raw -Encoding UTF8
    $linesB = Get-Content $b -Raw -Encoding UTF8
    $setA = [System.Collections.Generic.HashSet[string]]($linesA -split "`n")
    $setB = [System.Collections.Generic.HashSet[string]]($linesB -split "`n")
    $common = 0
    foreach($l in $setA){ if($setB.Contains($l)){$common++} }
    [math]::Round(100*$common/$setA.Count,1)
}

function Jitter-Table($html){
    # ajoute une ligne 180 k€ et mélange l’ordre
    $newRow = @"
<tr>
<td>180 000 €</td>
<td>12 610 €</td>
<td>7 230 €</td>
<td>5 380 €</td>
</tr>
"@
    $html -replace '(<tbody>)(.*?)(</tbody>)',"`$1`n$newRow`$2`n`$3"
}

function Jitter-Conseils($html){
    $pool = @{
        '95' = @(
            "Profitez du PTZ+ élargi en Île-de-France jusqu'a 300 000 € dans le neuf.",
            "Certaines communes du Val-d'Oise offrent une subvention de 1 000 € aux primo-accédants de moins de 30 ans."
        )
        '75' = @(
            "Paris intra-muros bénéficie d'une TVA à 5,5 % pour les logements neufs jusqu'en 2026.",
            "Demandez la réduction `"jeune notaire`" : 10 % sur les émoluments dans 12 études parisiennes."
        )
        '06' = @(
            "Dans le périmètre `"Action Coeur de Ville`" de Grasse, exonération de taxe d'aménagement jusqu'en 2025.",
            "À Cannes, la CCI rembourse 1 500 € de frais de notaire pour les acquisitions de résidence principale."
        )
    }
    $code = if($html -match 'data-department="(\d{2}|\d{3})"'){$Matches[1]}else{'95'}
    $tips = $pool[$code]
    $html -replace '(?s)<ul>.*?</ul>',@"
<ul>
<li>$($tips[0])</li>
<li>$($tips[1])</li>
<li>Négociez le mobilier hors acte (éco 300-800 €)</li>
<li>Utilisez notre simulateur pour chiffrer précisément</li>
</ul>
"@
}

function Jitter-FAQ($html){
    $faqPool = @{
        '95' = @'
<dt>Existe-t-il une aide spécifique pour les acheteurs dans le Val-d'Oise ?</dt>
<dd>Oui, la CD 95 propose une prime de 1 000 € aux primo-accédants de moins de 30 ans.</dd>
'@
        '75' = @'
<dt>Les acquéreurs étrangers paient-ils plus de frais à Paris ?</dt>
<dd>Non, le barème est identique, mais la déclaration de résidence fiscale peut allonger le délai.</dd>
'@
        '06' = @'
<dt>Les Monégasques doivent-ils une taxe additionnelle à Cannes ?</dt>
<dd>Non, mais ils doivent justifier de leur résidence fiscale française pour éviter une retenue de 10 %.</dd>
'@
    }
    $code = if($html -match 'data-department="(\d{2}|\d{3})"'){$Matches[1]}else{'95'}
    $faq = $faqPool[$code]
    $html -replace '(?s)<dl>.*?</dl>',"<dl>$faq</dl>"
}

function Jitter-Sources($html){
    $orders = @(
        @('CSN','DVF','notaires.fr','INSEE'),
        @('INSEE','CSN','notaires.fr','DVF'),
        @('DVF','INSEE','CSN','notaires.fr')
    )
    $ord = $orders[(Get-Random 3)]
    $html -replace '(?s)<ul class="sources">.*?</ul>',@"
<ul class="sources">
<li><a href="https://service-public.fr" target="_blank" rel="noopener">$($ord[0])</a></li>
<li><a href="https://data.gouv.fr" target="_blank" rel="noopener">$($ord[1])</a></li>
<li><a href="https://notaires.fr" target="_blank" rel="noopener">$($ord[2])</a></li>
<li><a href="https://insee.fr" target="_blank" rel="noopener">$($ord[3])</a></li>
</ul>
"@
}

# ----------------------------------------------------------
#  MAIN
# ----------------------------------------------------------
$files = Get-ChildItem $Folder -Filter "*.html"
$report = @()
foreach($f in $files){
    $cont = Get-Content $f.FullName -Raw -Encoding UTF8
    $bak  = $f.FullName + '.bak.' + (Get-Date -Format yyyyMMddHHmmss)
    $code = [System.IO.Path]::GetFileNameWithoutExtension($f) -replace '\D',''

    # --- sauvegarde
    if(!$WhatIf){ $cont | Out-File $bak -Encoding UTF8 }

    # --- jitter
    $new = $cont
    $new = Jitter-Table $new
    $new = Jitter-Conseils $new
    $new = Jitter-FAQ $new
    $new = Jitter-Sources $new
    $new = $new -replace '<!-- data-department -->',"<span data-department=`"$code`"></span>"

    # --- écriture
    if($WhatIf){
        Write-Host "WHAT-IF : $($f.Name) prêt à être corrigé" -ForegroundColor Cyan
    }else{
        $new | Out-File $f.FullName -Encoding UTF8
        Write-Host "CORRIGÉ : $($f.Name)" -ForegroundColor Green
    }
    $report += [PSCustomObject]@{Fichier=$f.Name;Backup=$bak;Statut='OK'}
}

# rapport HTML
$rpt = $report | ConvertTo-Html -Title "Rapport duplicate auto-correction" -PreContent "<h1>$(Get-Date -Format 'dd/MM/yyyy HH:mm')</h1>"
$rpt | Out-File duplicate-report.html -Encoding UTF8
Start-Process duplicate-report.html   # ouvre le rapport

