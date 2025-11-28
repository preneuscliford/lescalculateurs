# Test DeepSeek chat completions (reads .env if necessary)
if (-not $env:DEEPSEEK_API_KEY) {
  $envFile = Join-Path (Get-Location) '.env'
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$') {
        $k = $matches[1]
        $v = $matches[2].Trim('"'' ')
        # set env var dynamically
        $exists = Get-ChildItem Env: | Where-Object { $_.Name -eq $k }
        if (-not $exists) { Set-Item -Path ("Env:$k") -Value $v }
      }
    }
  }
}

$headers = @{
  Authorization = "Bearer $env:DEEPSEEK_API_KEY"
  'Content-Type' = 'application/json'
}

$body = @{
  model = "deepseek-chat"
  messages = @(
    @{ role = "system"; content = "You are an expert French real-estate writer. Return only a short self-contained HTML fragment (no <html>, <head>, <script> tags)." }
    @{ role = "user"; content = "Génère un paragraphe unique sur les frais de notaire dans le Calvados (14)" }
  )
  temperature = 0.7
  max_tokens = 300
} | ConvertTo-Json -Depth 6

try {
  Write-Host "Calling DeepSeek endpoint..." -ForegroundColor Cyan
  $resp = Invoke-RestMethod -Uri "https://api.deepseek.com/v1/chat/completions" -Method Post -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 30
  Write-Host "`n=== Full response (JSON) ===" -ForegroundColor Green
  $resp | ConvertTo-Json -Depth 6
  Write-Host "`n=== Generated fragment ===" -ForegroundColor Green
  if ($resp.choices -and $resp.choices[0].message) {
    $resp.choices[0].message.content
  } elseif ($resp.choices -and $resp.choices[0].text) {
    $resp.choices[0].text
  } else {
    $resp | ConvertTo-Json -Depth 6
  }
} catch {
  Write-Host "Request failed:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.Exception.Response) {
    try {
      $sr = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($sr)
      $bodyText = $reader.ReadToEnd()
      Write-Host "`nResponse body:" -ForegroundColor Yellow
      Write-Host $bodyText
    } catch {
      Write-Host "Could not read response body."
    }
  }
}
