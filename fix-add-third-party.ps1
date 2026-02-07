# Liste des pages à corriger
$pages = @(
    "a-propos.html",
    "comment-calculer-plus-value.html",
    "apl-etudiant.html",
    "comment-calculer-frais-notaire.html",
    "pret.html",
    "charges.html",
    "blog.html",
    "plusvalue.html",
    "asf.html",
    "are.html",
    "notaire.html",
    "methodologie.html",
    "impot.html",
    "sources.html",
    "simulateurs.html",
    "salaire.html",
    "financement.html",
    "salaire-seo.html",
    "rsa.html",
    "crypto-bourse.html",
    "prime-activite.html",
    "aah.html"
)

foreach ($page in $pages) {
    $path = "pages_YMYL_SAFE/$page"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        
        # Vérifier si third-party-loader.js est déjà présent
        if (-not ($content -match 'third-party-loader\.js')) {
            # Ajouter third-party-loader après google-adsense-account meta
            $content = $content -replace '(<meta name="google-adsense-account" content="ca-pub-2209781252231399" />)', "`$1`n    <script defer src=""/third-party-loader.js""></script>"
            Set-Content $path $content -Encoding UTF8 -NoNewline
            Write-Host "Ajoute third-party-loader: $page"
        } else {
            Write-Host "Deja OK: $page"
        }
    } else {
        Write-Host "Non trouve: $page"
    }
}

Write-Host "Termine!"
