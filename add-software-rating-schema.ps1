# Script pour ajouter le schéma SoftwareApplication conforme GPT
$htmlFiles = Get-ChildItem -Path "src/pages" -Filter "*.html" -Recurse | Where-Object { 
  $_.FullName -notmatch "simulateurs\.html|blog\.html|sources\.html|methodologie\.html" -and 
  $_.FullName -notmatch "departements.*\.html"
}

$count = 0
foreach ($file in $htmlFiles) {
  $content = Get-Content $file.FullName -Raw
  
  # Vérifier si le schema SoftwareApplication n'existe pas déjà
  if ($content -notmatch '"@type":\s*"SoftwareApplication"') {
    # Créer le schema adapté au fichier
    $fileName = $file.BaseName
    $url = "https://www.lescalculateurs.fr/pages/$fileName"
    
    # Déterminer le nom et la description selon le fichier
    $appName = switch -Wildcard ($fileName) {
      "apl*" { "Simulateur APL CAF 2026" }
      "pret*" { "Calculateur Prêt Immobilier" }
      "salaire*" { "Calculateur Salaire Net" }
      "taxe*" { "Calculateur Impôt sur le Revenu" }
      "ik*" { "Simulateur Impôt sur la Fortune" }
      "rsa*" { "Calculateur RSA 2026" }
      "plusvalue*" { "Calculateur Plus-value Immobilière" }
      "are*" { "Calculateur ARE Allocation Chômage" }
      "asf*" { "Simulateur Allocation Spéciale Fonds" }
      "prime-activite*" { "Calculateur Prime d'Activité" }
      "charges*" { "Calculateur Charges Locatives" }
      default { "Calculateur LesCalculateurs.fr" }
    }
    
    $schema = @"
    <!-- Schema.org SoftwareApplication -->
    <script type=`"application/ld+json`">
      {
        `"@context`": `"https://schema.org`",
        `"@type`": `"SoftwareApplication`",
        `"name`": `"$appName`",
        `"operatingSystem`": `"Web`",
        `"applicationCategory`": `"FinanceApplication`",
        `"description`": `"Outil de calcul gratuit et fiable pour estimer vos droits et obligations fiscales. Simulation rapide et indicative.`",
        `"url`": `"$url`",
        `"offers`": {
          `"@type`": `"Offer`",
          `"price`": `"0`",
          `"priceCurrency`": `"EUR`"
        }
      }
    </script>
"@
    
    # Trouver la position avant </head>
    if ($content -match '(.+?)\n  </head>') {
      $newContent = $content -replace '(  </head>)', ("`n" + $schema + "`n  </head>")
      Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
      Write-Host "✓ $($file.Name)"
      $count++
    }
  } else {
    Write-Host "⊘ Déjà présent: $($file.Name)"
  }
}

Write-Host "`n$count fichier(s) mis à jour"


