# Script pour ajouter third-party-loader.js à tous les fichiers src/pages/ qui n'ont pas le script

$files = Get-ChildItem src/pages -Recurse -Filter "*.html"
$fixed = 0
$alreadyOk = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    if ($content -match 'third-party-loader\.js') {
        $alreadyOk++
        continue
    }
    
    # Cherche le pattern pour insérer le script (après google-adsense-account meta ou avant </head>)
    if ($content -match '<meta name="google-adsense-account" content="[^"]*" />') {
        # Ajoute après le meta google-adsense-account
        $content = $content -replace '(<meta name="google-adsense-account" content="[^"]*" />)', "`$1`n    <script defer src=""/third-party-loader.js""></script>"
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
        $fixed++
        Write-Host "Fixed: $($file.FullName.Replace($PWD.Path + '\', ''))"
    } elseif ($content -match '</head>') {
        # Ajoute avant </head> si pas de google-adsense-account
        $content = $content -replace '(</head>)', "    <script defer src=""/third-party-loader.js""></script>`n`$1"
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
        $fixed++
        Write-Host "Fixed: $($file.FullName.Replace($PWD.Path + '\', ''))"
    }
}

Write-Host ""
Write-Host "==================================="
Write-Host "Fichiers corriges: $fixed"
Write-Host "Deja OK: $alreadyOk"
Write-Host "Total: $($files.Count)"
Write-Host "==================================="
