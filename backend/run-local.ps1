# Load local development values from backend/.env, then start Spring Boot.
# Copy .env.example to .env and replace CHANGE_ME before using this script.
$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path -LiteralPath $envFile)) {
  Write-Error 'Missing backend/.env. Copy .env.example to .env and set DB_USERNAME, DB_PASSWORD and JWT_SECRET.'
  exit 1
}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*?)\s*$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD) -or $env:DB_PASSWORD -eq 'CHANGE_ME') {
  Write-Error 'DB_PASSWORD is not configured in backend/.env.'
  exit 1
}
& mvn.cmd spring-boot:run
