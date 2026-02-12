$pages = @('aah.html', 'are.html', 'apl.html', 'apl-etudiant.html', 'financement.html', 'travail.html', 'taxe.html', 'crypto-bourse.html', 'comment-calculer-plus-value.html', 'comment-calculer-frais-notaire.html', 'charges.html', 'asf.html', 'sources.html', 'plusvalue.html', 'prime-activite.html', 'pret.html', 'notaire.html', 'impot.html', 'ik.html', 'guide-complet-impot-revenu-2026.html', 'ponts.html', 'rsa.html', 'salaire.html', 'salaire-seo.html', 'salaire-brut-net-calcul-2026.html', 'historique-mises-a-jour.html', 'methodologie.html', 'a-propos.html', 'simulateurs.html', 'blog.html', 'crypto-bourse.html')

foreach ($page in $pages) {
    $path = "src/pages/$page"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        $original = $content
        
        # Remplacer dans les navigations uniquement (entre <nav> et </nav>)
        if ($content -match '<nav[^>]*>') {
            # Pattern pour remplacer uniquement dans la nav
            $content = $content -replace '(?s)(<nav[^>]*>.*?)(Méthodologie)(.*?</nav>)', '$1Méthodo$3'
            $content = $content -replace '(?s)(<nav[^>]*>.*?)(Notre Méthodologie)(.*?</nav>)', '$1Méthodo$3'
            $content = $content -replace '(?s)(<nav[^>]*>.*?)(Sources Officielles)(.*?</nav>)', '$1Sources$3'
            $content = $content -replace '(?s)(<nav[^>]*>.*?)(Tous les Simulateurs)(.*?</nav>)', '$1Outils$3'
        }
        
        # Remplacer aussi dans les footers
        if ($content -match '<footer[^>]*>') {
            $content = $content -replace '(?s)(<footer[^>]*>.*?)(Méthodologie)(.*?</footer>)', '$1Méthodo$3'
            $content = $content -replace '(?s)(<footer[^>]*>.*?)(Notre Méthodologie)(.*?</footer>)', '$1Méthodo$3'
            $content = $content -replace '(?s)(<footer[^>]*>.*?)(Sources Officielles)(.*?</footer>)', '$1Sources$3'
        }
        
        if ($content -ne $original) {
            Set-Content $path $content -NoNewline
            Write-Host "✅ $page"
        } else {
            Write-Host "ℹ️ $page - aucun changement"
        }
    } else {
        Write-Host "❌ $page - non trouvé"
    }
}

Write-Host "`nTerminé!"
