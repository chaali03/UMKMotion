import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage(inputPath, outputPath, maxWidth = 800, quality = 80) {
  try {
    await sharp(inputPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    console.log(`   ${(originalSize/1024).toFixed(1)}KB -> ${(optimizedSize/1024).toFixed(1)}KB (${savings}% smaller)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Optimizing oversized images for better performance...\n');
  
  // Create optimized directories
  const optimizedDir = path.join(__dirname, '..', 'public', 'asset', 'optimized');
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  // Optimize LogoDina.webp (139KB -> even smaller for Lighthouse)
  const logoDinaInput = path.join(__dirname, '..', 'public', 'asset', 'Dina', 'LogoDina.webp');
  const logoDinaOutput = path.join(optimizedDir, 'LogoDina-tiny.webp');
  
  if (fs.existsSync(logoDinaInput)) {
    await optimizeImage(logoDinaInput, logoDinaOutput, 200, 75); // More aggressive
  }
  
  // Optimize Peta.webp (66KB -> much smaller for Lighthouse)
  const petaInput = path.join(__dirname, '..', 'public', 'asset', 'optimized', 'Peta', 'Peta.webp');
  const petaOutput = path.join(optimizedDir, 'Peta-tiny.webp');
  
  if (fs.existsSync(petaInput)) {
    await optimizeImage(petaInput, petaOutput, 400, 70); // More aggressive
  }
  
  // Create tiny footer image
  const footerInput = path.join(__dirname, '..', 'public', 'LogoNavbar.webp');
  const footerOutput = path.join(optimizedDir, 'Footer-tiny.webp');
  
  if (fs.existsSync(footerInput)) {
    await optimizeImage(footerInput, footerOutput, 150, 70);
  }
  
  console.log('\n✨ Image optimization complete!');
  console.log('📝 Update your components to use the optimized versions:');
  console.log('   - LogoDina.webp -> /asset/optimized/LogoDina-small.webp');
  console.log('   - Peta.webp -> /asset/optimized/Peta-small.webp');
}

main().catch(console.error);
