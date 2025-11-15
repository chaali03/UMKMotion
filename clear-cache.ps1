# Clear Vite and Astro cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✓ Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "No Vite cache found" -ForegroundColor Gray
}

Write-Host "Clearing Astro cache..." -ForegroundColor Yellow
if (Test-Path ".astro") {
    Remove-Item -Recurse -Force ".astro"
    Write-Host "✓ Astro cache cleared" -ForegroundColor Green
} else {
    Write-Host "No Astro cache found" -ForegroundColor Gray
}

Write-Host "`nCache cleared! Please:" -ForegroundColor Cyan
Write-Host "1. Stop your dev server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "`nIf errors persist, try:" -ForegroundColor Yellow
Write-Host "npm run dev -- --force" -ForegroundColor White

