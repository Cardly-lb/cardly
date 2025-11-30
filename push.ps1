# Push script
Write-Host "Checking git status..."
git status
Write-Host "`nChecking remote..."
git remote -v
Write-Host "`nCurrent branch:"
git branch --show-current
Write-Host "`nInitializing if needed..."
if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit with @vitejs/plugin-react dependency"
    git branch -M main
}
Write-Host "`nSetting remote..."
git remote remove origin 2>$null
git remote add origin https://github.com/Cardly-lb/cardly.git
Write-Host "`nPushing to GitHub..."
git push -u origin main 2>&1
Write-Host "`nDone!"

