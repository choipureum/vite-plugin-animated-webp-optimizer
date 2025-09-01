#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Configuration
const config = {
  sourceDir: "public/assets",
  outputDir: "public/assets/optimized",
  quality: 80,
  effort: 2,
  lossless: false,
  maxFileSize: 1024 * 1024, // 1MB
  skipIfSmaller: 100 * 1024, // 100KB
  concurrentImages: 10,
  watch: false,
  fast: false,
};

// Parse command line arguments
const args = process.argv.slice(2);
args.forEach((arg) => {
  if (arg === "--watch") config.watch = true;
  if (arg === "--fast") {
    config.quality = 60;
    config.effort = 1;
    config.concurrentImages = 20;
  }
  if (arg.startsWith("--quality="))
    config.quality = parseInt(arg.split("=")[1]);
  if (arg.startsWith("--effort=")) config.effort = parseInt(arg.split("=")[1]);
  if (arg.startsWith("--source=")) config.sourceDir = arg.split("=")[1];
  if (arg.startsWith("--output=")) config.outputDir = arg.split("=")[1];
  if (arg.startsWith("--maxFileSize="))
    config.maxFileSize = parseInt(arg.split("=")[1]);
  if (arg.startsWith("--skipIfSmaller="))
    config.skipIfSmaller = parseInt(arg.split("=")[1]);
});

console.log("🚀 WebP Optimizer Script");
console.log(`📁 Source: ${config.sourceDir}`);
console.log(`📁 Output: ${config.outputDir}`);
console.log(`⚡ Quality: ${config.quality}, Effort: ${config.effort}`);
console.log(`📏 Max file size: ${formatBytes(config.maxFileSize)}`);
console.log(`🔍 Skip if smaller: ${formatBytes(config.skipIfSmaller)}`);
console.log(`🔄 Concurrent: ${config.concurrentImages}`);
console.log(`🏃 Fast mode: ${config.fast}`);
console.log("");

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
  console.log(`✅ Created output directory: ${config.outputDir}`);
}

// Find all WebP files
function findWebpFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Source directory not found: ${dir}`);
    return files;
  }

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.toLowerCase().endsWith(".webp")) {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

// Optimize single WebP file
async function optimizeWebP(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const fileName = path.basename(inputPath);

    // Skip if file is too small
    if (config.skipIfSmaller > 0 && stats.size < config.skipIfSmaller) {
      console.log(
        `⏭️  Skipping small file: ${fileName} (${formatBytes(stats.size)})`
      );
      return { skipped: true, originalSize: stats.size };
    }

    // Skip if file is too large
    if (config.maxFileSize > 0 && stats.size > config.maxFileSize) {
      console.log(
        `⏭️  Skipping large file: ${fileName} (${formatBytes(stats.size)})`
      );
      return { skipped: true, originalSize: stats.size };
    }

    console.log(`🔍 Processing: ${fileName} (${formatBytes(stats.size)})`);

    const startTime = Date.now();

    // Detect if animated
    const metadata = await sharp(inputPath, {
      animated: true,
      pages: -1,
    }).metadata();
    const isAnimated = metadata.pages && metadata.pages > 1;

    if (isAnimated) {
      console.log(`🎬 Animated WebP detected: ${metadata.pages} frames`);

      await sharp(inputPath, { animated: true, pages: -1 })
        .webp({
          quality: config.quality,
          effort: config.effort,
          smartSubsample: true,
          lossless: config.lossless,
          loop: metadata.loop || 0,
          delay: metadata.delay,
          force: true,
          nearLossless: false,
        })
        .toFile(outputPath);
    } else {
      await sharp(inputPath)
        .webp({
          quality: config.quality,
          effort: config.effort,
          smartSubsample: true,
          lossless: config.lossless,
          nearLossless: false,
        })
        .toFile(outputPath);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const optimizedSize = fs.statSync(outputPath).size;
    const savings = stats.size - optimizedSize;
    const savingsPercent = ((savings / stats.size) * 100).toFixed(1);

    console.log(`✅ Completed: ${fileName} in ${processingTime}ms`);
    if (savings > 0) {
      console.log(
        `   📉 Size: ${formatBytes(stats.size)} → ${formatBytes(
          optimizedSize
        )} (${savingsPercent}% saved)`
      );
    }

    return {
      success: true,
      originalSize: stats.size,
      optimizedSize,
      savings,
      savingsPercent,
      processingTime,
    };
  } catch (error) {
    console.error(
      `❌ Error processing ${path.basename(inputPath)}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

// Process files in batches
async function processBatch(files, batchSize) {
  const results = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map((filePath) => {
      const relativePath = path.relative(config.sourceDir, filePath);
      const outputPath = path.join(config.outputDir, relativePath);

      // Ensure output subdirectory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      return optimizeWebP(filePath, outputPath);
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Progress update
    const progress = Math.min(i + batchSize, files.length);
    console.log(
      `📊 Progress: ${progress}/${files.length} (${Math.round(
        (progress / files.length) * 100
      )}%)`
    );
  }

  return results;
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Main execution
async function main() {
  const webpFiles = findWebpFiles(config.sourceDir);

  if (webpFiles.length === 0) {
    console.log("🔍 No WebP files found in source directory");
    return;
  }

  console.log(`🚀 Found ${webpFiles.length} WebP files`);
  console.log(
    `⚡ Starting optimization with ${config.concurrentImages} concurrent processes...`
  );
  console.log("");

  const startTime = Date.now();
  const results = await processBatch(webpFiles, config.concurrentImages);

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Summary
  console.log("");
  console.log("📊 Optimization Summary:");
  console.log("========================");

  const successful = results.filter((r) => r.success);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.success && !r.skipped);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`⏭️  Skipped: ${skipped.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);

  if (successful.length > 0) {
    const totalOriginal = successful.reduce(
      (sum, r) => sum + r.originalSize,
      0
    );
    const totalOptimized = successful.reduce(
      (sum, r) => sum + r.optimizedSize,
      0
    );
    const totalSavings = totalOriginal - totalOptimized;
    const totalSavingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(
      1
    );

    console.log(
      `📉 Total savings: ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`
    );
    console.log(`📁 Output directory: ${config.outputDir}`);
  }

  if (failed.length > 0) {
    console.log("");
    console.log("❌ Failed files:");
    failed.forEach((result) => {
      console.log(`   - ${result.error}`);
    });
  }
}

// Watch mode
if (config.watch) {
  console.log("👀 Watch mode enabled - monitoring for changes...");

  fs.watch(config.sourceDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.toLowerCase().endsWith(".webp")) {
      console.log(`🔄 File changed: ${filename}`);
      setTimeout(() => main(), 1000); // Debounce
    }
  });

  // Initial run
  main();
} else {
  // Single run
  main().catch(console.error);
}
