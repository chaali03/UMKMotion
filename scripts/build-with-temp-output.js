// Build script that uses a temp output directory to avoid OneDrive locks
import { execSync } from 'child_process';
import { rmSync, cpSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const tempDist = join(os.tmpdir(), 'umkmotion-dist-build');
const finalDist = join(projectRoot, 'dist');

console.log('Building to temporary directory to avoid OneDrive locks...');
console.log(`Temp directory: ${tempDist}`);

try {
  // Set environment variable to override Astro's output directory
  // We'll use a custom build script
  process.env.ASTRO_OUTPUT_DIR = tempDist;
  
  // Clean temp directory
  if (existsSync(tempDist)) {
    rmSync(tempDist, { recursive: true, force: true });
  }
  
  // Build using Astro with custom output
  console.log('Running Astro build...');
  execSync('npx astro build', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      // Try to override via Vite config
    }
  });
  
  // Copy from temp to final dist
  console.log('Copying build output to dist folder...');
  if (existsSync(finalDist)) {
    // Try to remove final dist, but don't fail if it's locked
    try {
      rmSync(finalDist, { recursive: true, force: true });
    } catch (e) {
      console.warn('Could not remove old dist folder, will try to copy over it...');
    }
  }
  
  cpSync(tempDist, finalDist, { recursive: true });
  console.log('✓ Build complete! Output copied to dist folder.');
  
  // Clean up temp directory
  try {
    rmSync(tempDist, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

