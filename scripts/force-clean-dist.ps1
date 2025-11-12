# PowerShell script to force-delete the dist folder on Windows
# Run this if you're experiencing file lock issues: .\scripts\force-clean-dist.ps1

$distPath = Join-Path $PSScriptRoot "..\dist"

if (Test-Path $distPath) {
    Write-Host "Attempting to delete dist folder..." -ForegroundColor Yellow
    
    # Try normal deletion first
    try {
        Remove-Item -Path $distPath -Recurse -Force -ErrorAction Stop
        Write-Host "✓ Successfully deleted dist folder" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Normal deletion failed, trying alternative methods..." -ForegroundColor Yellow
        
        # Try taking ownership and deleting
        try {
            $acl = Get-Acl $distPath
            $permission = "BUILTIN\Administrators","FullControl","ContainerInherit,ObjectInherit","None","Allow"
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
            $acl.SetAccessRule($accessRule)
            Set-Acl $distPath $acl
            Remove-Item -Path $distPath -Recurse -Force -ErrorAction Stop
            Write-Host "✓ Successfully deleted dist folder after taking ownership" -ForegroundColor Green
        } catch {
            Write-Host "✗ Could not delete dist folder. The file may be locked by:" -ForegroundColor Red
            Write-Host "  1. File Explorer (close any windows showing the dist folder)" -ForegroundColor Red
            Write-Host "  2. Antivirus software (temporarily disable real-time scanning)" -ForegroundColor Red
            Write-Host "  3. OneDrive (exclude the dist folder from sync)" -ForegroundColor Red
            Write-Host "  4. Another process (restart your computer if needed)" -ForegroundColor Red
            Write-Host ""
            Write-Host "You can try renaming the folder manually:" -ForegroundColor Yellow
            Write-Host "  Rename-Item -Path '$distPath' -NewName 'dist.old'" -ForegroundColor Cyan
            exit 1
        }
    }
} else {
    Write-Host "✓ No dist folder to clean" -ForegroundColor Green
}

