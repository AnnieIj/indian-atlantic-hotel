import sharp from 'sharp';
import { readdirSync, statSync, renameSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'indian atlantic pics');
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 75;
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return;

  const sizeBefore = statSync(filePath).size;
  const tmpPath = filePath + '.tmp';

  try {
    await sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(tmpPath);

    const sizeAfter = statSync(tmpPath).size;
    renameSync(tmpPath, filePath);

    if (sizeAfter < sizeBefore) {
      const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
      console.log(`✓ ${basename(filePath)}: ${(sizeBefore/1024/1024).toFixed(1)}MB → ${(sizeAfter/1024/1024).toFixed(1)}MB (-${saved}%)`);
    } else {
      console.log(`~ ${basename(filePath)}: already optimal`);
    }
  } catch (err) {
    try { renameSync(tmpPath, filePath); } catch {}
    console.error(`✗ ${basename(filePath)}: ${err.message}`);
  }
}

async function run() {
  console.log(`\nCompressing images in: ${IMAGES_DIR}\n`);
  const files = readdirSync(IMAGES_DIR);
  for (const file of files) {
    await compressImage(join(IMAGES_DIR, file));
  }
  console.log('\nDone.');
}

run().catch(console.error);
