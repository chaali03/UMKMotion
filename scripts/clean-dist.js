import { rmSync, existsSync, renameSync, unlinkSync, statSync } from 'fs';
import { join, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryDeleteFile(filePath) {
  try {
    unlinkSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

async function tryRenameFile(filePath, newPath) {
  try {
    renameSync(filePath, newPath);
    return true;
  } catch (e) {
    return false;
  }
}

async function renameLockedFile(filePath) {
  // Try to rename the locked file itself
  const timestamp = Date.now();
  const dir = pathDirname(filePath);
  const ext = filePath.split('.').pop();
  const baseName = pathDirname(filePath).split(/[/\\]/).pop();
  const newPath = join(dir, `${baseName}.locked.${timestamp}.${ext}`);
  
  for (let i = 0; i < 3; i++) {
    if (tryRenameFile(filePath, newPath)) {
      return newPath;
    }
    await sleep(300);
  }
  return null;
}

async function cleanDist() {
  if (!existsSync(distPath)) {
    console.log('✓ No dist directory to clean');
    return;
  }

  // First, try to handle known problematic files individually
  const problematicFile = join(distPath, 'asset', 'optimized', 'umkm', 'umkm1.webp');
  if (existsSync(problematicFile)) {
    console.log('⚠ Found potentially locked file, attempting to handle it...');
    
    // Try deletion first
    let deleted = false;
    for (let i = 0; i < 3; i++) {
      if (tryDeleteFile(problematicFile)) {
        console.log('✓ Deleted problematic file');
        deleted = true;
        await sleep(200);
        break;
      }
      await sleep(300);
    }
    
    // If deletion failed, try renaming the file
    if (!deleted) {
      console.log('⚠ Deletion failed, attempting to rename locked file...');
      const renamedPath = await renameLockedFile(problematicFile);
      if (renamedPath) {
        console.log(`✓ Renamed locked file to ${pathDirname(renamedPath).split(/[/\\]/).pop()}/...`);
        await sleep(200);
      } else {
        console.log('⚠ Could not rename locked file, will try to rename entire dist folder...');
        // If we can't delete or rename the file, try renaming the entire dist folder
        // This way Astro won't try to clean it and will create a fresh one
        const oldDistPath = join(__dirname, '..', `dist.old.${Date.now()}`);
        try {
          await sleep(500);
          renameSync(distPath, oldDistPath);
          console.log('✓ Renamed dist folder to avoid cleanup issues');
          console.log('✓ Astro will create a fresh dist folder');
          // Try to delete the old folder in background
          setTimeout(() => {
            try {
              rmSync(oldDistPath, { recursive: true, force: true });
            } catch (e) {
              // Ignore
            }
          }, 5000);
          return; // Success - dist folder renamed, Astro will create new one
        } catch (renameErr) {
          console.log('⚠ Could not rename dist folder either');
        }
      }
    }
  }

  // Try multiple strategies to clean the directory on Windows
  const maxRetries = 10;
  const retryDelay = 500; // Increased delay for Windows file locks

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Strategy 1: Direct deletion with retries
      rmSync(distPath, { 
        recursive: true, 
        force: true, 
        maxRetries: 5, 
        retryDelay: 200 
      });
      console.log('✓ Cleaned dist directory');
      // Wait a bit to ensure file handles are released
      await sleep(100);
      return;
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`⚠ Attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
      } else {
        // Strategy 2: Try PowerShell deletion on Windows with ownership change (more aggressive)
        if (platform() === 'win32') {
          try {
            console.log('⚠ Trying PowerShell deletion with ownership change...');
            // Use a simpler approach - escape the path properly and use single quotes
            const escapedPath = distPath.replace(/'/g, "''").replace(/\\/g, '/');
            const psDeleteScript = `$path = '${escapedPath}'; if (Test-Path $path) { try { takeown /f $path /r /d y 2>$null; Start-Sleep -Milliseconds 500; icacls $path /grant Administrators:F /t 2>$null; Start-Sleep -Milliseconds 500; Remove-Item -Path $path -Recurse -Force -ErrorAction Stop; Write-Host "Success" } catch { Write-Host "Failed: $_"; exit 1 } }`;
            const result = execSync(`powershell -Command "${psDeleteScript}"`, {
              stdio: 'pipe',
              timeout: 15000,
              encoding: 'utf8'
            });
            if (result.includes('Success') || !existsSync(distPath)) {
              console.log('✓ Cleaned dist directory using PowerShell with ownership');
              await sleep(100);
              return;
            }
          } catch (psError) {
            console.log('⚠ PowerShell deletion with ownership also failed, trying rename...');
          }
        }
        
        // Strategy 3: Try renaming parent directories working backwards from the locked file
        if (platform() === 'win32') {
          try {
            console.log('⚠ Attempting to rename parent directories...');
            const problematicDir = join(distPath, 'asset', 'optimized', 'umkm');
            const umkmDir = join(distPath, 'asset', 'optimized');
            const optimizedDir = join(distPath, 'asset');
            
            // Try renaming directories from the locked file upwards
            const timestamp = Date.now();
            let renamed = false;
            
            if (existsSync(problematicDir)) {
              const newUmkmDir = join(pathDirname(problematicDir), `umkm.locked.${timestamp}`);
              if (tryRenameFile(problematicDir, newUmkmDir)) {
                console.log('✓ Renamed umkm directory');
                renamed = true;
                await sleep(200);
              }
            }
            
            // If that worked, try the rest
            if (renamed || !existsSync(problematicDir)) {
              // Now try to delete/rename the rest
              await sleep(300);
            }
          } catch (e) {
            // Continue to folder rename
          }
        }
        
        // Strategy 4: Try renaming the entire dist folder (sometimes works when deletion doesn't)
        // This is the key workaround - if we can't delete, rename it so Astro doesn't try to clean it
        try {
          const oldDistPath = join(__dirname, '..', `dist.old.${Date.now()}`);
          // Wait a bit before renaming to let locks clear
          await sleep(1000);
          renameSync(distPath, oldDistPath);
          console.log('✓ Renamed dist directory to dist.old (Astro will create a fresh dist folder)');
          console.log('✓ This avoids the file lock issue - build can proceed');
          // Try to delete the renamed folder in the background (non-blocking)
          setTimeout(() => {
            try {
              rmSync(oldDistPath, { recursive: true, force: true });
            } catch (e) {
              // Ignore - will be cleaned later or on next build
            }
          }, 2000);
          // Wait a bit more to ensure rename is complete
          await sleep(200);
          // Exit successfully - dist folder is renamed, Astro will create new one
          return;
        } catch (renameError) {
          // Final fallback: Use cmd to take ownership and delete (sometimes works when PowerShell doesn't)
          if (platform() === 'win32') {
            try {
              console.log('⚠ Trying cmd with ownership change as final attempt...');
              // Use cmd.exe which sometimes handles file operations better
              const distPathEscaped = distPath.replace(/\\/g, '\\\\');
              execSync(`cmd /c "takeown /f "${distPathEscaped}" /r /d y >nul 2>&1 && icacls "${distPathEscaped}" /grant Administrators:F /t >nul 2>&1 && rmdir /s /q "${distPathEscaped}" 2>nul"`, {
                stdio: 'pipe',
                timeout: 15000
              });
              await sleep(500);
              if (!existsSync(distPath)) {
                console.log('✓ Cleaned dist directory using cmd with ownership');
                return;
              }
            } catch (e) {
              // Ignore - we've tried everything
            }
          }
          
          // Last resort: Try one more time to rename with extended delay
          try {
            console.log('⚠ Final attempt: Trying to rename dist folder with extended delay...');
            await sleep(2000);
            const oldDistPath = join(__dirname, '..', `dist.old.${Date.now()}`);
            renameSync(distPath, oldDistPath);
            console.log('✓ Successfully renamed dist folder on final attempt');
            console.log('✓ Build can proceed - Astro will create a fresh dist folder');
            return;
          } catch (finalRenameError) {
            console.warn('');
            console.warn('╔══════════════════════════════════════════════════════════════╗');
            console.warn('║  CRITICAL: Could not clean or rename dist directory        ║');
            console.warn('╚══════════════════════════════════════════════════════════════╝');
            console.warn('');
            console.warn('The dist folder contains locked files that cannot be deleted or renamed.');
            console.warn('This will cause the build to fail.');
            console.warn('');
            console.warn('IMMEDIATE FIX OPTIONS:');
            console.warn('');
            console.warn('Option 1 (Recommended): Run as Administrator');
            console.warn('  Right-click PowerShell/CMD -> Run as Administrator, then:');
            console.warn('  .\\scripts\\unlock-and-delete-dist.bat');
            console.warn('');
            console.warn('Option 2: Manual cleanup');
            console.warn('  1. Close File Explorer windows showing the dist folder');
            console.warn('  2. Close any dev servers (npm run dev)');
            console.warn('  3. Run: .\\scripts\\force-clean-dist.ps1');
            console.warn('');
            console.warn('Option 3: Exclude from antivirus/OneDrive');
            console.warn('  1. Add dist folder to antivirus exclusions');
            console.warn('  2. Exclude dist folder from OneDrive sync');
            console.warn('  3. Restart your computer');
            console.warn('');
            console.warn('After fixing, run: npm run build');
            console.warn('');
            // Exit with error code so user knows to fix it
            process.exit(1);
          }
        }
      }
    }
  }
}

cleanDist().catch(error => {
  console.warn('⚠ Cleanup script error:', error.message);
  // Don't fail the build
});

