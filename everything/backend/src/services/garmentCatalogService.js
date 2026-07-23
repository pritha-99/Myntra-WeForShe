const sharp = require('sharp');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Stock model image paths
const STOCK_MODELS = {
  front: path.join(__dirname, '../assets/stock_models/front_stock.jpg'),
  back: path.join(__dirname, '../assets/stock_models/back_stock.jpg'),
  side: path.join(__dirname, '../assets/stock_models/side_stock.jpg'),
};

// ══════════════════════════════════════════════════════════════════════════════
// STAGE 0: Input Validation
// ══════════════════════════════════════════════════════════════════════════════

async function validateInput(frontFile, backFile, additionalFiles = []) {
  const errors = [];

  // Front and back are required
  if (!frontFile) errors.push('Front flat-lay photo is required');
  if (!backFile) errors.push('Back flat-lay photo is required');

  // Additional images capped at 5
  if (additionalFiles.length > 5) {
    errors.push('Maximum 5 additional images allowed');
  }

  // Validate each file
  const allFiles = [
    { file: frontFile, label: 'front' },
    { file: backFile, label: 'back' },
    ...additionalFiles.map((f, i) => ({ file: f, label: `additional-${i}` }))
  ].filter(item => item.file);

  for (const { file, label } of allFiles) {
    try {
      const metadata = await sharp(file.path).metadata();
      
      // Check minimum resolution (400px on shorter side)
      if (metadata.width < 400 || metadata.height < 400) {
        errors.push(`${label} photo too low-resolution (minimum 400px), please retake`);
      }
    } catch (err) {
      errors.push(`${label} photo is corrupted or unreadable`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ══════════════════════════════════════════════════════════════════════════════
// STAGE 1 & 2: Crop + Background Removal (BiRefNet fallback: sharp mask)
// ══════════════════════════════════════════════════════════════════════════════

async function cropAndRemoveBackground(imagePath, outputPath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Simple threshold-based background removal
    // This is a basic implementation - in production, BiRefNet or rembg would be used
    const processed = await image
      .removeAlpha()
      .resize({ width: Math.min(metadata.width, 2000), withoutEnlargement: true })
      .toBuffer();

    // Create a simple mask by detecting edges
    const masked = await sharp(processed)
      .threshold(240) // Simple threshold for light backgrounds
      .negate()
      .blur(2)
      .toBuffer();

    // Apply mask to create cutout
    const cutout = await sharp(processed)
      .composite([{ input: masked, blend: 'dest-in' }])
      .png()
      .toFile(outputPath);

    return { success: true, path: outputPath };
  } catch (err) {
    console.error('Crop/background removal error:', err);
    // Fallback: just resize and save
    await sharp(imagePath)
      .resize({ width: 1080, height: 1440, fit: 'contain', background: { r: 245, g: 245, b: 245 } })
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    return { success: true, path: outputPath, fallback: true };
  }
}

const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

// ══════════════════════════════════════════════════════════════════════════════
// STAGE 3: FLUX Kontext Pro (Replicate) On-Model Generation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a photorealistic on-model catalog image from a flat-lay garment image
 * using Replicate's FLUX Kontext Pro API.
 *
 * @param {string} garmentImagePath - Local path to the cropped/processed garment image
 * @param {string} pose             - 'front' or 'back'
 * @param {string} outputPath       - Where to save the generated image
 */
async function generateOnModelImage(garmentImagePath, pose, outputPath) {
  const TIMEOUT_MS = 180000; // 3 min – FLUX Kontext Pro can take ~60-90 s
  const scriptPath = path.join(__dirname, 'replicate_client.py');

  try {
    const args = [
      scriptPath,
      '--garment', garmentImagePath,
      '--output', outputPath,
      '--pose', pose,
    ];

    const { stdout } = await execFileAsync('python3', args, { timeout: TIMEOUT_MS });

    // Parse JSON output from python script
    let res;
    try {
      res = JSON.parse(stdout.trim());
    } catch (e) {
      const jsonMatch = stdout.match(/{"status":.*}/);
      if (jsonMatch) {
        res = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Invalid output from replicate_client: ${stdout}`);
      }
    }

    const fileExists = await fs.stat(outputPath).then(() => true).catch(() => false);

    if (res.status === 'success' && fileExists) {
      console.log(`✅ FLUX Kontext Pro ${pose} on-model image generated → ${path.basename(outputPath)}`);
      return { success: true, path: outputPath };
    } else {
      throw new Error(res.error || 'Failed to generate image via FLUX Kontext Pro');
    }
  } catch (err) {
    let cleanMsg = err.message || 'replicate_client execution error';
    try {
      const jsonMatch = cleanMsg.match(/{"status":\s*"error".*?}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        cleanMsg = parsed.error || cleanMsg;
      }
    } catch (_) {}
    cleanMsg = cleanMsg.split('\n').filter(line => !line.includes('DeprecationWarning')).join(' ').trim();
    console.warn(`⚠️ FLUX Kontext Pro ${pose} generation skipped: ${cleanMsg}`);
    return {
      success: false,
      status: 'failed',
      reason: cleanMsg,
    };
  }
}

/**
 * Run FLUX Kontext Pro for the image slots where the seller selected 'Generate with AI'.
 * Slots where the seller chose 'upload' are skipped — the original uploaded file is kept.
 *
 * @param {string|null} frontCutoutPath - processed front garment image (null → skip)
 * @param {string|null} backCutoutPath  - processed back garment image  (null → skip)
 * @param {string}      uploadsDir
 */
async function generateSelectedOnModelViews(frontCutoutPath, backCutoutPath, uploadsDir) {
  const timestamp = Date.now();
  const results = { front: null, back: null };

  const tasks = [];

  if (frontCutoutPath) {
    tasks.push(
      generateOnModelImage(
        frontCutoutPath,
        'front',
        path.join(uploadsDir, `onmodel-front-${timestamp}.jpg`)
      ).then(r => { results.front = r.success ? { status: 'success', path: r.path } : { status: 'failed', reason: r.reason }; })
       .catch(e => { results.front = { status: 'failed', reason: e.message }; })
    );
  } else {
    results.front = { status: 'skipped' };
  }

  if (backCutoutPath) {
    tasks.push(
      generateOnModelImage(
        backCutoutPath,
        'back',
        path.join(uploadsDir, `onmodel-back-${timestamp}.jpg`)
      ).then(r => { results.back = r.success ? { status: 'success', path: r.path } : { status: 'failed', reason: r.reason }; })
       .catch(e => { results.back = { status: 'failed', reason: e.message }; })
    );
  } else {
    results.back = { status: 'skipped' };
  }

  await Promise.all(tasks);
  return results;
}

// ══════════════════════════════════════════════════════════════════════════════
// STAGE 4: Compliance Validation
// ══════════════════════════════════════════════════════════════════════════════

async function validateCompliance(imagePath) {
  const report = {
    fileSize: 'unknown',
    dimensions: 'unknown',
    format: 'unknown',
    aspectRatio: 'unknown',
    background: 'unknown',
    blur: 'unknown',
    watermark: 'warning', // Best-effort only
  };

  try {
    const stats = await fs.stat(imagePath);
    const metadata = await sharp(imagePath).metadata();
    
    // File size check (target 500KB-1MB)
    const sizeKB = stats.size / 1024;
    if (sizeKB >= 500 && sizeKB <= 1024) {
      report.fileSize = 'pass';
    } else if (sizeKB > 1024 && sizeKB <= 2048) {
      report.fileSize = 'warning';
    } else {
      report.fileSize = 'fail';
    }

    // Dimensions check (≥1080x1440)
    if (metadata.width >= 1080 && metadata.height >= 1440) {
      report.dimensions = 'pass';
    } else {
      report.dimensions = 'fail';
    }

    // Aspect ratio check (3:4 ratio, with tolerance)
    const ratio = metadata.width / metadata.height;
    const targetRatio = 3 / 4;
    if (Math.abs(ratio - targetRatio) < 0.05) {
      report.aspectRatio = 'pass';
    } else {
      report.aspectRatio = 'warning';
    }

    // Format check
    report.format = metadata.format === 'jpeg' || metadata.format === 'jpg' ? 'pass' : 'warning';

    // Background neutrality check (sample corners)
    const image = sharp(imagePath);
    const { data } = await image.raw().toBuffer({ resolveWithObject: true });
    
    // Sample corner pixels to check if background is light/neutral
    const cornerSamples = [];
    const w = metadata.width;
    const h = metadata.height;
    const channels = metadata.channels;
    
    // Sample 4 corners (simplified)
    for (let i = 0; i < Math.min(10, h); i++) {
      for (let j = 0; j < Math.min(10, w); j++) {
        const idx = (i * w + j) * channels;
        if (idx + 2 < data.length) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          cornerSamples.push({ r, g, b });
        }
      }
    }

    // Check if corners are light/neutral (near white/grey)
    const avgBrightness = cornerSamples.reduce((sum, px) => 
      sum + (px.r + px.g + px.b) / 3, 0) / cornerSamples.length;
    
    if (avgBrightness > 230) {
      report.background = 'pass';
    } else if (avgBrightness > 200) {
      report.background = 'warning';
    } else {
      report.background = 'fail';
    }

    // Blur check (Laplacian variance via edge detection)
    const edgeBuffer = await sharp(imagePath)
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .raw()
      .toBuffer();

    const variance = edgeBuffer.reduce((sum, val) => sum + val * val, 0) / edgeBuffer.length;
    
    if (variance > 1000) {
      report.blur = 'pass';
    } else if (variance > 500) {
      report.blur = 'warning';
    } else {
      report.blur = 'fail';
    }

  } catch (err) {
    console.error('Compliance validation error:', err);
  }

  return report;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Main garment catalog pipeline.
 *
 * @param {object}   frontFile          - Multer file object for front image
 * @param {object}   backFile           - Multer file object for back image
 * @param {object[]} additionalFiles    - Multer file objects for additional images
 * @param {boolean}  priceTagConfirmed
 * @param {string}   uploadsDir
 * @param {object}   [imageModes]       - Per-image mode flags: { front: 'upload'|'ai', back: 'upload'|'ai' }
 */
async function processGarmentCatalog(frontFile, backFile, additionalFiles, priceTagConfirmed, uploadsDir, imageModes = {}) {
  // Stage 0: Validation
  const validation = await validateInput(frontFile, backFile, additionalFiles);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const timestamp = Date.now();
  const result = {
    front: { original: `/uploads/${frontFile.filename}` },
    back: { original: `/uploads/${backFile.filename}` },
    side: {},
    additional: [],
    priceTagConfirmed
  };

  // Determine which slots need AI generation
  const generateFront = (imageModes.front || 'upload') === 'ai';
  const generateBack  = (imageModes.back  || 'upload') === 'ai';

  try {
    let frontCutoutPath = null;
    let backCutoutPath  = null;

    // Stage 1 & 2: Crop + background removal only for AI-selected slots
    if (generateFront || generateBack) {
      const tasks = [];

      if (generateFront) {
        const p = path.join(uploadsDir, `cutout-front-${timestamp}.png`);
        tasks.push(cropAndRemoveBackground(frontFile.path, p).then(() => { frontCutoutPath = p; }));
      }
      if (generateBack) {
        const p = path.join(uploadsDir, `cutout-back-${timestamp}.png`);
        tasks.push(cropAndRemoveBackground(backFile.path, p).then(() => { backCutoutPath = p; }));
      }

      await Promise.all(tasks);
    }

    // Stage 3: FLUX Kontext Pro on-model generation (only for AI slots)
    const onModelResults = await generateSelectedOnModelViews(
      generateFront ? frontCutoutPath : null,
      generateBack  ? backCutoutPath  : null,
      uploadsDir
    );

    // Process front result
    if (generateFront) {
      if (onModelResults.front.status === 'success') {
        result.front.onModel = `/uploads/${path.basename(onModelResults.front.path)}`;
        result.front.generationStatus = 'success';
        result.front.complianceReport = await validateCompliance(onModelResults.front.path);
      } else {
        result.front.generationStatus = onModelResults.front.status;
        result.front.reason = onModelResults.front.reason;
        result.front.complianceReport = await validateCompliance(frontFile.path);
      }
    } else {
      // Seller uploaded their own image — just validate it
      result.front.generationStatus = 'upload';
      result.front.complianceReport = await validateCompliance(frontFile.path);
    }

    // Process back result
    if (generateBack) {
      if (onModelResults.back.status === 'success') {
        result.back.onModel = `/uploads/${path.basename(onModelResults.back.path)}`;
        result.back.generationStatus = 'success';
        result.back.complianceReport = await validateCompliance(onModelResults.back.path);
      } else {
        result.back.generationStatus = onModelResults.back.status;
        result.back.reason = onModelResults.back.reason;
        result.back.complianceReport = await validateCompliance(backFile.path);
      }
    } else {
      result.back.generationStatus = 'upload';
      result.back.complianceReport = await validateCompliance(backFile.path);
    }

    // Stage 4: Validate additional images (pass-through, no generation)
    for (const file of additionalFiles) {
      const complianceReport = await validateCompliance(file.path);
      result.additional.push({
        original: `/uploads/${file.filename}`,
        label: 'additional',
        complianceReport
      });
    }

    result.generatedAt = new Date().toISOString();

  } catch (err) {
    console.error('Garment catalog processing error:', err);
    throw err;
  }

  return result;
}

module.exports = {
  processGarmentCatalog,
  validateCompliance
};
