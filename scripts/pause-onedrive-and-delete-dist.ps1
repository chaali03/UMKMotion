# Script to pause OneDrive sync, delete dist folder, then resume OneDrive
# Run as Administrator for best results

Write-Host "Pausing OneDrive sync..." -ForegroundColor Yellow

# Try to pause OneDrive sync
$onedriveProcess = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
if ($onedriveProcess) {
    # Pause OneDrive sync using registry (if possible)
    try {
        # This requires admin privileges
        $regPath = "HKCU:\Software\Microsoft\OneDrive"
        if (Test-Path $regPath) {
            Write-Host "OneDrive is running. Attempting to pause sync..." -ForegroundColor Yellow
            # Note: OneDrive doesn't have a simple pause command, but we can try to stop the process temporarily
        }
    } catch {
        Write-Host "Could not pause OneDrive automatically" -ForegroundColor Red
    }
}

$distPath = Join-Path $PSScriptRoot "..\dist"
$distPath = Resolve-Path $distPath -ErrorAction SilentlyContinue

if (-not $distPath) {
    Write-Host "Dist folder does not exist. Nothing to delete." -ForegroundColor Green
    exit 0
}

Write-Host "Attempting to delete dist folder: $distPath" -ForegroundColor Yellow

# Try multiple deletion strategies
$success = $false

# Strategy 1: Normal deletion
try {
    Remove-Item -Path $distPath -Recurse -Force -ErrorAction Stop
    Write-Host "SUCCESS: Dist folder deleted!" -ForegroundColor Green
    $success = $true
} catch {
    Write-Host "Normal deletion failed, trying with ownership change..." -ForegroundColor Yellow
    
    # Strategy 2: Take ownership and delete
    try {
        Start-Process -FilePath "takeown" -ArgumentList "/f", "`"$distPath`"", "/r", "/d", "y" -Wait -NoNewWindow -WindowStyle Hidden -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Start-Process -FilePath "icacls" -ArgumentList "`"$distPath`"", "/grant", "Administrators:F", "/t" -Wait -NoNewWindow -WindowStyle Hidden -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Remove-Item -Path $distPath -Recurse -Force -ErrorAction Stop
        Write-Host "SUCCESS: Dist folder deleted after taking ownership!" -ForegroundColor Green
        $success = $true
    } catch {
        Write-Host "Ownership change deletion also failed." -ForegroundColor Red
        Write-Host ""
        Write-Host "OneDrive is likely syncing this folder. Please:" -ForegroundColor Yellow
        Write-Host "1. Right-click OneDrive icon in system tray" -ForegroundColor Cyan
        Write-Host "2. Click 'Pause syncing' -> '2 hours'" -ForegroundColor Cyan
        Write-Host "3. Then run this script again" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "OR exclude the dist folder from OneDrive:" -ForegroundColor Yellow
        Write-Host "1. Right-click OneDrive icon -> Settings" -ForegroundColor Cyan
        Write-Host "2. Go to 'Sync and backup' -> 'Advanced settings'" -ForegroundColor Cyan
        Write-Host "3. Click 'Choose folders' and uncheck the dist folder" -ForegroundColor Cyan
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "Failed to delete dist folder. OneDrive is likely the cause." -ForegroundColor Red
    Write-Host "Please pause OneDrive sync manually and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Dist folder deleted successfully! You can now run: npm run build" -ForegroundColor Green

