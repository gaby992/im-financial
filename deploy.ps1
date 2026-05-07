# ============================================================
# IM Financial Dashboard — Quick Deploy Script
# Usage: .\deploy.ps1 "your commit message"
# ============================================================

param(
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host ""
Write-Host "🚀 IM Financial Dashboard — Deploying..." -ForegroundColor Cyan
Write-Host "   Commit: $Message" -ForegroundColor Gray
Write-Host ""

# Stage all changes
git add -A

# Commit
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "✅ Nothing new to commit." -ForegroundColor Yellow
} else {
    Write-Host "✅ Committed." -ForegroundColor Green
}

# Push to GitHub → triggers Vercel auto-deploy
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    Write-Host "⏳ Vercel is deploying... (~2 min)" -ForegroundColor Cyan
    Write-Host "🌐 https://im-financial.vercel.app" -ForegroundColor Magenta
    Write-Host ""
} else {
    Write-Host "❌ Push failed. Check your GitHub token." -ForegroundColor Red
}
