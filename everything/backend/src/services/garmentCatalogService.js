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
// STAGE 3: CatVTON Hugging Face Space On-Model Generation
// ══════════════════════════════════════════════════════════════════════════════

async function generateOnModelImage(garmentImagePath, stockModelPath, pose, outputPath) {
  const TIMEOUT_MS = 90000; // 90s timeout for CatVTON HF Space
  const scriptPath = path.join(__dirname, 'catvton_client.py');

  try {
    const args = [
      scriptPath,
      '--person', stockModelPath,
      '--garment', garmentImagePath,
      '--output', outputPath,
      '--cloth_type', 'upper',
      '--steps', '20',
      '--guidance', '2.5',
      '--seed', '42'
    ];

    const { stdout } = await execFileAsync('python3', args, { timeout: TIMEOUT_MS });
    
    // Parse json output from python script
    let res;
    try {
      res = JSON.parse(stdout.trim());
    } catch (e) {
      // Find JSON string in stdout if extra output exists
      const jsonMatch = stdout.match(/\{"status":.*\}/);
      if (jsonMatch) {
        res = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Invalid output from CatVTON script: ${stdout}`);
      }
    }

    const fileExists = await fs.stat(outputPath).then(() => true).catch(() => false);

    if (res.status === 'success' && fileExists) {
      console.log(`✅ CatVTON ${pose} on-model image generated → ${path.basename(outputPath)}`);
      return { success: true, path: outputPath };
    } else {
      throw new Error(res.error || 'Failed to generate image via CatVTON');
    }
  } catch (err) {
    let cleanMsg = err.message || 'CatVTON execution error';
    try {
      const jsonMatch = cleanMsg.match(/\{"status":\s*"error".*?\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        cleanMsg = parsed.error || cleanMsg;
      }
    } catch (_) {}
    // Remove extra backtraces or deprecation noise
    cleanMsg = cleanMsg.split('\n').filter(line => !line.includes('DeprecationWarning')).join(' ').trim();
    console.warn(`⚠️ CatVTON ${pose} generation skipped: ${cleanMsg}`);
    return {
      success: false,
      status: 'failed',
      reason: cleanMsg,
    };
  }
}

async function generateAllOnModelViews(frontCutoutPath, backCutoutPath, uploadsDir) {
  const timestamp = Date.now();
  const results = {
    front: null,
    back: null,
    side: null
  };

  // Run all three Gemini calls in parallel with independent error handling
  const [frontResult, backResult, sideResult] = await Promise.allSettled([
    generateOnModelImage(
      frontCutoutPath,
      STOCK_MODELS.front,
      'front',
      path.join(uploadsDir, `onmodel-front-${timestamp}.jpg`)
    ),
    generateOnModelImage(
      backCutoutPath,
      STOCK_MODELS.back,
      'back',
      path.join(uploadsDir, `onmodel-back-${timestamp}.jpg`)
    ),
    generateOnModelImage(
      frontCutoutPath, // Side uses front cutout as reference
      STOCK_MODELS.side,
      'side',
      path.join(uploadsDir, `onmodel-side-${timestamp}.jpg`)
    )
  ]);

  // Process results independently
  results.front = frontResult.status === 'fulfilled' && frontResult.value.success
    ? { status: 'success', path: frontResult.value.path }
    : { status: 'failed', reason: frontResult.reason || frontResult.value?.reason };

  results.back = backResult.status === 'fulfilled' && backResult.value.success
    ? { status: 'success', path: backResult.value.path }
    : { status: 'failed', reason: backResult.reason || backResult.value?.reason };

  results.side = sideResult.status === 'fulfilled' && sideResult.value.success
    ? { status: 'success', path: sideResult.value.path }
    : { status: 'failed', reason: sideResult.reason || sideResult.value?.reason };

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

async function processGarmentCatalog(frontFile, backFile, additionalFiles, priceTagConfirmed, uploadsDir) {
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

  try {
    // Stage 1 & 2: Crop and background removal for front and back
    const frontCutoutPath = path.join(uploadsDir, `cutout-front-${timestamp}.png`);
    const backCutoutPath = path.join(uploadsDir, `cutout-back-${timestamp}.png`);

    const [frontCutout, backCutout] = await Promise.all([
      cropAndRemoveBackground(frontFile.path, frontCutoutPath),
      cropAndRemoveBackground(backFile.path, backCutoutPath)
    ]);

    // Stage 3: Generate on-model views (3 parallel Gemini calls)
    const onModelResults = await generateAllOnModelViews(frontCutoutPath, backCutoutPath, uploadsDir);

    // Process front on-model
    if (onModelResults.front.status === 'success') {
      result.front.onModel = `/uploads/${path.basename(onModelResults.front.path)}`;
      result.front.generationStatus = 'success';
      result.front.complianceReport = await validateCompliance(onModelResults.front.path);
    } else {
      result.front.generationStatus = onModelResults.front.status;
      result.front.reason = onModelResults.front.reason;
      // Still validate original
      result.front.complianceReport = await validateCompliance(frontFile.path);
    }

    // Process back on-model
    if (onModelResults.back.status === 'success') {
      result.back.onModel = `/uploads/${path.basename(onModelResults.back.path)}`;
      result.back.generationStatus = 'success';
      result.back.complianceReport = await validateCompliance(onModelResults.back.path);
    } else {
      result.back.generationStatus = onModelResults.back.status;
      result.back.reason = onModelResults.back.reason;
      // Still validate original
      result.back.complianceReport = await validateCompliance(backFile.path);
    }

    // Process side on-model
    if (onModelResults.side.status === 'success') {
      result.side.onModel = `/uploads/${path.basename(onModelResults.side.path)}`;
      result.side.generationStatus = 'success';
      result.side.complianceReport = await validateCompliance(onModelResults.side.path);
    } else {
      result.side.generationStatus = onModelResults.side.status;
      result.side.reason = onModelResults.side.reason;
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
