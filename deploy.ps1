# ============================================================
# IM Financial Dashboard — Auto Deploy Script
# Usage: .\deploy.ps1 "commit message"
# Commits + pushes to GitHub -> Vercel auto-deploys in ~2 min
# Tokens stored in environment variables (not in code)
# ============================================================

param(
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

# Tokens loaded from machine environment (set once, never in code)
$GH   = $env:IM_GITHUB_TOKEN
$REPO = "https://${GH}@github.com/gaby992/im-financial.git"

if (-not $GH) {
    Write-Host "ERROR: Set env var IM_GITHUB_TOKEN first." -ForegroundColor Red
    Write-Host 'Run: $env:IM_GITHUB_TOKEN = "ghp_..."' -ForegroundColor Yellow
    exit 1
}

git remote set-url origin $REPO

Write-Host ""
Write-Host "IM Financial Dashboard -- Deploying..." -ForegroundColor Cyan
Write-Host "Commit: $Message" -ForegroundColor Gray
Write-Host ""

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m $Message
    Write-Host "Committed." -ForegroundColor Green
} else {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
}

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Pushed to GitHub!" -ForegroundColor Green
    Write-Host "Vercel is building... (~2 min)" -ForegroundColor Cyan
    Write-Host "Live: https://im-financial-dashboard.vercel.app" -ForegroundColor Magenta
} else {
    Write-Host "Push failed. Check connection." -ForegroundColor Red
}
