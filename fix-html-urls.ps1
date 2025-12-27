# Fix all HTML files - remove .html from JSON-LD and og: URLs
$pagesDir = "c:\Users\prene\OneDrive\Bureau\lesCalculateurs\src\pages"

Get-ChildItem -Path $pagesDir -Filter "*.html" -Recurse | ForEach-Object {
    $file = $_
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Fix pattern 1: Remove .html from JSON-LD URLs
    # "item": "https://...something.html" -> "item": "https://...something"
    $content = $content -replace '("(?:item|url|canonicalUrl)":\s*"[^"]*?)\.html(")', '$1$2'
    
    # Fix pattern 2: Replace /index.html with /
    $content = $content -replace 'https://(?:www\.)?lescalculateurs\.fr/index\.html', 'https://www.lescalculateurs.fr/'
    
    # Fix pattern 3: Remove .html from URLs in meta content attributes
    # content="...something.html" -> content="...something"
    $content = $content -replace '(content="[^"]*?)\.html"', '$1"'
    
    # Write back if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "✅ Fixed: $($file.Name)"
    }
}

Write-Host "`n✅ All HTML files processed"
