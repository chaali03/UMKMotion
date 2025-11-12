@echo off
REM Admin-level script to force delete the dist folder
REM Run this as Administrator: Right-click -> Run as Administrator

echo Attempting to force delete dist folder...
echo.

cd /d "%~dp0\.."

if not exist "dist" (
    echo Dist folder does not exist.
    pause
    exit /b 0
)

echo Taking ownership of dist folder...
takeown /f "dist" /r /d y >nul 2>&1

echo Granting full control to Administrators...
icacls "dist" /grant Administrators:F /t >nul 2>&1

echo Deleting dist folder...
rmdir /s /q "dist" 2>nul

if not exist "dist" (
    echo.
    echo SUCCESS: Dist folder deleted!
) else (
    echo.
    echo ERROR: Could not delete dist folder.
    echo The file may be locked by:
    echo   1. Antivirus software (disable real-time scanning temporarily)
    echo   2. OneDrive (exclude dist folder from sync)
    echo   3. File Explorer (close any windows showing the dist folder)
    echo   4. Another process (restart your computer)
)

pause

