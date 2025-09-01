import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { ProcessOptions, WebPMetadata, OptimizationResult, WebPAsset } from "./types";
import { isValidWebP, formatBytes } from "./utils";

export class WebPProcessor {
  private webpFiles: string[] = [];
  private processedCount = 0;
  private totalCount = 0;

  constructor(private options: ProcessOptions) {}

  async processBundleAssets(webpAssets: WebPAsset[], distDir: string): Promise<void> {
    if (webpAssets.length === 0) {
      if (this.options.verbose) {
        console.log(`No WebP assets to process.`);
      }
      return;
    }

    this.totalCount = webpAssets.length;

    if (this.options.verbose) {
      console.log(`🚀 Processing ${this.totalCount} WebP assets from bundle...`);
    }

    // 동시 처리로 최적화
    await this.processAssetsConcurrently(webpAssets, distDir);

    if (this.options.verbose) {
      console.log(`✅ Bundle optimization completed! Processed ${this.processedCount}/${this.totalCount} files.`);
    }
  }

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

    // 먼저 모든 WebP 파일을 수집
    this.collectWebpFiles(dirPath);
    this.totalCount = this.webpFiles.length;

    if (this.totalCount === 0) {
      if (this.options.verbose) {
        console.log(`🔍 No WebP files found in directory: ${dirPath}`);
      }
      return;
    }

    if (this.options.verbose) {
      console.log(`🚀 Found ${this.totalCount} WebP files. Starting optimization...`);
    }

    // 동시 처리로 최적화
    await this.processFilesConcurrently(distDir);

    if (this.options.verbose) {
      console.log(`✅ Optimization completed! Processed ${this.processedCount}/${this.totalCount} files.`);
    }
  }

  private collectWebpFiles(dirPath: string): void {
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
        if (!excludeDirs.includes(file)) {
          this.collectWebpFiles(filePath);
        }
      } else if (file.toLowerCase().endsWith(".webp")) {
        this.webpFiles.push(filePath);
      }
    }
  }

  private async processFilesConcurrently(distDir: string): Promise<void> {
    const batchSize = this.options.concurrentImages;
    
    for (let i = 0; i < this.webpFiles.length; i += batchSize) {
      const batch = this.webpFiles.slice(i, i + batchSize);
      const promises = batch.map(filePath => this.processWebpFile(filePath, distDir));
      
      await Promise.all(promises);
      
      if (this.options.verbose) {
        const progress = Math.round(((i + batchSize) / this.webpFiles.length) * 100);
        console.log(`📊 Progress: ${Math.min(progress, 100)}% (${Math.min(i + batchSize, this.webpFiles.length)}/${this.webpFiles.length})`);
      }
    }
  }

  private async processAssetsConcurrently(webpAssets: WebPAsset[], distDir: string): Promise<void> {
    const batchSize = this.options.concurrentImages;
    
    for (let i = 0; i < webpAssets.length; i += batchSize) {
      const batch = webpAssets.slice(i, i + batchSize);
      const promises = batch.map(asset => this.processWebpAsset(asset, distDir));
      
      await Promise.all(promises);
      
      if (this.options.verbose) {
        const progress = Math.round(((i + batchSize) / webpAssets.length) * 100);
        console.log(`📊 Progress: ${Math.min(progress, 100)}% (${Math.min(i + batchSize, webpAssets.length)}/${webpAssets.length})`);
      }
    }
  }

  private async processWebpAsset(asset: WebPAsset, distDir: string): Promise<void> {
    try {
      const fileName = asset.fileName;
      const fileSize = asset.size;

      if (this.options.verbose) {
        console.log(
          `🔍 Processing: ${fileName} (${formatBytes(fileSize)})`
        );
      }

      // 애니메이션 여부 확인
      const isAnimated = asset.isAnimated || await this.detectAnimatedWebP(asset.sourcePath);
      
      if (this.options.verbose) {
        console.log(`⚡ Starting optimization: ${fileName} (${isAnimated ? 'Animated' : 'Static'})`);
      }

      const startTime = Date.now();

      // 임시 경로에 최적화된 파일을 생성
      const outputPath = asset.outputPath;

      if (isAnimated && this.options.optimizeAnimation) {
        await this.optimizeAnimatedWebP(asset.sourcePath, outputPath);
      } else {
        await this.optimizeStaticWebP(asset.sourcePath, outputPath);
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      if (this.options.verbose) {
        const optimizedSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
        const savings = fileSize - optimizedSize;
        const savingsPercent = ((savings / fileSize) * 100).toFixed(1);
        
        console.log(`✅ Completed: ${fileName} in ${processingTime}ms`);
        if (savings > 0) {
          console.log(`   📉 Size: ${formatBytes(fileSize)} → ${formatBytes(optimizedSize)} (${savingsPercent}% saved)`);
        }
      }

      // 임시 파일을 원본 파일로 교체
      const finalOutputPath = path.join(distDir, fileName);
      if (fs.existsSync(outputPath)) {
        // 임시 디렉토리가 존재하지 않으면 생성
        const tempDir = path.dirname(outputPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // 최적화된 파일을 최종 위치로 이동
        fs.copyFileSync(outputPath, finalOutputPath);
        
        // 임시 파일 삭제
        fs.unlinkSync(outputPath);
      }

      this.processedCount++;
    } catch (error) {
      if (this.options.verbose) {
        console.error(`❌ Error processing asset:`, error);
      }
      this.processedCount++;
    }
  }

  private async processWebpFile(
    filePath: string,
    distDir: string
  ): Promise<void> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;
      const fileName = path.basename(filePath);

      if (this.options.verbose) {
        console.log(
          `🔍 Processing: ${fileName} (${formatBytes(fileSize)})`
        );
      }

      if (!isValidWebP(fileBuffer)) {
        if (this.options.verbose) {
          console.log(`❌ Invalid WebP file, skipping: ${fileName}`);
        }
        return;
      }

      if (this.options.maxFileSize > 0 && fileSize > this.options.maxFileSize) {
        if (this.options.verbose) {
          console.log(
            `⏭️  File too large (${formatBytes(fileSize)} > ${formatBytes(
              this.options.maxFileSize
            )}), skipping: ${fileName}`
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
            )}), skipping: ${fileName}`
          );
        }
        return;
      }

      const isAnimated = await this.detectAnimatedWebP(filePath);
      const outputPath = path.join(distDir, fileName);

      if (this.options.verbose) {
        console.log(`⚡ Starting optimization: ${fileName} (${isAnimated ? 'Animated' : 'Static'})`);
      }

      const startTime = Date.now();

      if (isAnimated && this.options.optimizeAnimation) {
        await this.optimizeAnimatedWebP(filePath, outputPath);
      } else {
        await this.optimizeStaticWebP(filePath, outputPath);
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      if (this.options.verbose) {
        const optimizedSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
        const savings = fileSize - optimizedSize;
        const savingsPercent = ((savings / fileSize) * 100).toFixed(1);
        
        console.log(`✅ Completed: ${fileName} in ${processingTime}ms`);
        if (savings > 0) {
          console.log(`   📉 Size: ${formatBytes(fileSize)} → ${formatBytes(optimizedSize)} (${savingsPercent}% saved)`);
        }
      }

      this.processedCount++;

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
