import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { ProcessOptions, WebPMetadata, OptimizationResult } from "./types";
import { isValidWebP, formatBytes } from "./utils";

export class WebPProcessor {
  constructor(private options: ProcessOptions) {}

  async processDirectory(dirPath: string, distDir: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      if (this.options.verbose) {
        console.log(`Directory not found: ${dirPath}`);
      }
      return;
    }

    // 제외할 디렉토리 목록
    const excludeDirs = [
      "node_modules",
      ".git",
      "dist",
      "coverage",
      ".vite",
      ".next",
      "build",
      "out",
    ];

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 제외할 디렉토리는 건너뛰기
        if (!excludeDirs.includes(file)) {
          await this.processDirectory(filePath, distDir);
        }
      } else if (file.toLowerCase().endsWith(".webp")) {
        await this.processWebpFile(filePath, distDir);
      }
    }
  }

  private async processWebpFile(
    filePath: string,
    distDir: string
  ): Promise<void> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;

      if (this.options.verbose) {
        console.log(
          `🔍 Processing: ${path.basename(filePath)} (${formatBytes(fileSize)})`
        );
      }

      if (!isValidWebP(fileBuffer)) {
        if (this.options.verbose) {
          console.log(`❌ Invalid WebP file, skipping`);
        }
        return;
      }

      if (this.options.maxFileSize > 0 && fileSize > this.options.maxFileSize) {
        if (this.options.verbose) {
          console.log(
            `⏭️  File too large (${formatBytes(fileSize)} > ${formatBytes(
              this.options.maxFileSize
            )}), skipping`
          );
        }
        return;
      }

      if (
        this.options.skipIfSmaller > 0 &&
        fileSize < this.options.skipIfSmaller
      ) {
        if (this.options.verbose) {
          console.log(
            `⏭️  File too small (${formatBytes(fileSize)} < ${formatBytes(
              this.options.skipIfSmaller
            )}), skipping`
          );
        }
        return;
      }

      const isAnimated = await this.detectAnimatedWebP(filePath);
      const outputPath = path.join(distDir, path.basename(filePath));

      if (isAnimated && this.options.optimizeAnimation) {
        await this.optimizeAnimatedWebP(filePath, outputPath);
      } else {
        await this.optimizeStaticWebP(filePath, outputPath);
      }

      if (this.options.maxFileSize > 0) {
        const optimizedSize = fs.statSync(outputPath).size;
        if (optimizedSize > this.options.maxFileSize) {
          if (this.options.verbose) {
            console.warn(
              `⚠️  File still too large: ${formatBytes(
                optimizedSize
              )} > ${formatBytes(this.options.maxFileSize)}`
            );
          }
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.error(`❌ Error processing file:`, error);
      }
      this.copyFileToDist(filePath, distDir);
    }
  }

  private async detectAnimatedWebP(filePath: string): Promise<boolean> {
    try {
      const sharpImage = sharp(filePath, { animated: true, pages: -1 });
      const metadata = await sharpImage.metadata();
      return typeof metadata?.pages === "number" && metadata.pages > 1;
    } catch (error) {
      return false;
    }
  }

  private async optimizeAnimatedWebP(
    inputPath: string,
    outputPath: string
  ): Promise<OptimizationResult> {
    try {
      if (this.options.verbose) {
        console.log(`🎬 Optimizing animated WebP: ${path.basename(inputPath)}`);
      }

      const sharpImage = sharp(inputPath, { animated: true, pages: -1 });
      const imageMeta = await sharpImage.metadata();
      const metadata = this.parseMetadata(imageMeta);

      let processedImage = sharpImage;

      if (this.options.maxWidth > 0 || this.options.maxHeight > 0) {
        processedImage = this.resizeImage(sharpImage, metadata);
      }

      const webpOptions = {
        quality: this.options.animationQuality,
        effort: this.options.animationCompression,
        smartSubsample: true,
        lossless: false,
        loop:
          typeof metadata.loop === "number" && metadata.loop >= 0
            ? metadata.loop
            : 0,
        delay: metadata.delay || undefined,
        force: true,
      };

      await processedImage.webp(webpOptions).toFile(outputPath);

      return this.calculateOptimizationResult(inputPath, outputPath);
    } catch (error) {
      if (this.options.verbose) {
        console.error(`❌ Optimization failed:`, error);
      }
      throw error;
    }
  }

  private async optimizeStaticWebP(
    inputPath: string,
    outputPath: string
  ): Promise<OptimizationResult> {
    try {
      if (this.options.verbose) {
        console.log(`🖼️  Optimizing static WebP: ${path.basename(inputPath)}`);
      }

      await sharp(inputPath)
        .webp({
          quality: this.options.quality,
          effort: this.options.effort,
          smartSubsample: true,
          lossless: false,
        })
        .toFile(outputPath);

      return this.calculateOptimizationResult(inputPath, outputPath);
    } catch (error) {
      if (this.options.verbose) {
        console.error(`❌ Optimization failed:`, error);
      }
      throw error;
    }
  }

  private parseMetadata(imageMeta: sharp.Metadata): WebPMetadata {
    return {
      width: imageMeta.width,
      height: imageMeta.height,
      size: imageMeta.size,
      loop: imageMeta.loop,
      pages: imageMeta.pages,
      pageHeight: imageMeta.pageHeight,
      delay: imageMeta.delay,
    };
  }

  private resizeImage(
    sharpImage: sharp.Sharp,
    metadata: WebPMetadata
  ): sharp.Sharp {
    const targetWidth =
      this.options.maxWidth > 0 ? this.options.maxWidth : metadata.width || 0;
    const targetHeight =
      this.options.maxHeight > 0
        ? this.options.maxHeight
        : metadata.height || 0;

    const adjustedHeight =
      metadata.pages && metadata.pages > 1
        ? targetHeight * metadata.pages
        : targetHeight;

    return sharpImage.resize({
      width: targetWidth,
      height: adjustedHeight,
      fit: sharp.fit.inside,
    });
  }

  private calculateOptimizationResult(
    inputPath: string,
    outputPath: string
  ): OptimizationResult {
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = (savings / originalSize) * 100;

    if (this.options.verbose) {
      console.log(
        `✅ Optimized: ${formatBytes(originalSize)} → ${formatBytes(
          optimizedSize
        )} (${savingsPercent.toFixed(1)}% saved)`
      );
    }

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings,
      savingsPercent,
    };
  }

  private copyFileToDist(inputPath: string, distDir: string): void {
    try {
      const outputPath = path.join(distDir, path.basename(inputPath));
      fs.copyFileSync(inputPath, outputPath);

      if (this.options.verbose) {
        console.log(`📋 Copied ${path.basename(inputPath)} to dist`);
      }
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  }
}
