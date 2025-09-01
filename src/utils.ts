import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

/**
 * WebP 파일의 유효성을 검사합니다.
 */
export function isValidWebP(buffer: Buffer | null | undefined): boolean {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return false;
  }

  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

/**
 * 바이트를 사람이 읽기 쉬운 형태로 변환합니다.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  if (bytes < 0) return `-${formatBytes(Math.abs(bytes))}`;
  if (!isFinite(bytes)) return `${bytes} Bytes`;

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= sizes.length) {
    return `${bytes} Bytes`;
  }

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 애니메이션 WebP인지 감지합니다.
 */
export async function detectAnimatedWebP(filePath: string): Promise<boolean> {
  try {
    const sharpImage = sharp(filePath, { animated: true, pages: -1 });
    const metadata = await sharpImage.metadata();
    return typeof metadata?.pages === "number" && metadata.pages > 1;
  } catch (error) {
    return false;
  }
}

/**
 * 애니메이션 WebP를 최적화합니다.
 */
export async function optimizeAnimatedWebP(
  inputPath: string,
  outputPath: string,
  options: {
    quality: number;
    effort: number;
    lossless?: boolean;
    maxWidth: number;
    maxHeight: number;
    verbose?: boolean;
  }
): Promise<void> {
  const {
    quality,
    effort,
    lossless = false,
    maxWidth,
    maxHeight,
    verbose = false,
  } = options;

  try {
    if (verbose) {
      console.log(`🎬 Optimizing animated WebP: ${path.basename(inputPath)}`);
    }

    const sharpImage = sharp(inputPath, { animated: true, pages: -1 });
    const imageMeta = await sharpImage.metadata();
    const {
      width,
      height: heightAllPages,
      size,
      loop,
      pages,
      pageHeight,
      delay,
    } = imageMeta;

    const height =
      pageHeight ||
      (heightAllPages && pages ? heightAllPages / pages : heightAllPages);

    let processedImage = sharpImage;

    if (maxWidth > 0 || maxHeight > 0) {
      const targetWidth = maxWidth > 0 ? maxWidth : width || 0;
      const targetHeight = maxHeight > 0 ? maxHeight : height || 0;

      const adjustedHeight =
        pages && pages > 1 ? targetHeight * pages : targetHeight;

      processedImage = sharpImage.resize({
        width: targetWidth,
        height: adjustedHeight,
        fit: sharp.fit.inside,
      });
    }

    const webpOptions = {
      quality,
      effort,
      smartSubsample: true,
      lossless,
      loop: typeof loop === "number" && loop >= 0 ? loop : 0,
      delay: delay || undefined,
      force: true,
    };

    await processedImage.webp(webpOptions).toFile(outputPath);

    if (verbose) {
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = originalSize - optimizedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      console.log(
        `✅ Optimized: ${formatBytes(originalSize)} → ${formatBytes(
          optimizedSize
        )} (${savingsPercent}% saved)`
      );
    }
  } catch (error) {
    if (verbose) {
      console.error(`❌ Optimization failed:`, error);
    }
    throw error;
  }
}

/**
 * 정적 WebP를 최적화합니다.
 */
export async function optimizeStaticWebP(
  inputPath: string,
  outputPath: string,
  options: {
    quality: number;
    effort: number;
    lossless?: boolean;
    verbose?: boolean;
  }
): Promise<void> {
  const { quality, effort, lossless = false, verbose = false } = options;

  try {
    if (verbose) {
      console.log(`🖼️  Optimizing static WebP: ${path.basename(inputPath)}`);
    }

    await sharp(inputPath)
      .webp({
        quality,
        effort,
        smartSubsample: true,
        lossless,
      })
      .toFile(outputPath);

    if (verbose) {
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = originalSize - optimizedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      console.log(
        `✅ Optimized: ${formatBytes(originalSize)} → ${formatBytes(
          optimizedSize
        )} (${savingsPercent}% saved)`
      );
    }
  } catch (error) {
    if (verbose) {
      console.error(`❌ Optimization failed:`, error);
    }
    throw error;
  }
}

/**
 * 파일을 dist 디렉토리로 복사합니다.
 */
export function copyFileToDist(inputPath: string, distDir: string): void {
  try {
    const outputPath = path.join(distDir, path.basename(inputPath));
    fs.copyFileSync(inputPath, outputPath);
  } catch (error) {
    throw new Error(`Failed to copy file: ${error}`);
  }
}

/**
 * 디렉토리를 재귀적으로 처리합니다.
 */
export async function processDirectory(
  dirPath: string,
  distDir: string,
  options: {
    verbose?: boolean;
    maxFileSize: number;
    skipIfSmaller: number;
    quality: number;
    effort: number;
    animationQuality: number;
    animationCompression: number;
    optimizeAnimation: boolean;
    maxWidth: number;
    maxHeight: number;
  }
): Promise<void> {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await processDirectory(filePath, distDir, options);
    } else if (file.toLowerCase().endsWith(".webp")) {
      await processWebpFile(filePath, distDir, options);
    }
  }
}

/**
 * WebP 파일을 처리합니다.
 */
async function processWebpFile(
  filePath: string,
  distDir: string,
  options: {
    verbose?: boolean;
    maxFileSize: number;
    skipIfSmaller: number;
    quality: number;
    effort: number;
    animationQuality: number;
    animationCompression: number;
    optimizeAnimation: boolean;
    maxWidth: number;
    maxHeight: number;
  }
): Promise<void> {
  const {
    verbose = false,
    maxFileSize,
    skipIfSmaller,
    quality,
    effort,
    animationQuality,
    animationCompression,
    optimizeAnimation,
    maxWidth,
    maxHeight,
  } = options;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    if (verbose) {
      console.log(
        `🔍 Processing: ${path.basename(filePath)} (${formatBytes(fileSize)})`
      );
    }

    if (!isValidWebP(fileBuffer)) {
      if (verbose) {
        console.log(`❌ Invalid WebP file, skipping`);
      }
      return;
    }

    if (skipIfSmaller > 0 && fileSize < skipIfSmaller) {
      if (verbose) {
        console.log(`⏭️  File too small, skipping`);
      }
      return;
    }

    const isAnimated = await detectAnimatedWebP(filePath);
    const outputPath = path.join(distDir, path.basename(filePath));

    if (isAnimated && optimizeAnimation) {
      await optimizeAnimatedWebP(filePath, outputPath, {
        quality: animationQuality,
        effort: animationCompression,
        maxWidth,
        maxHeight,
        verbose,
      });
    } else {
      await optimizeStaticWebP(filePath, outputPath, {
        quality,
        effort,
        verbose,
      });
    }

    if (maxFileSize > 0) {
      const optimizedSize = fs.statSync(outputPath).size;
      if (optimizedSize > maxFileSize) {
        if (verbose) {
          console.warn(
            `⚠️  File still too large: ${formatBytes(
              optimizedSize
            )} > ${formatBytes(maxFileSize)}`
          );
        }
      }
    }
  } catch (error) {
    if (verbose) {
      console.error(`❌ Error processing file:`, error);
    }
    copyFileToDist(filePath, distDir);
  }
}
