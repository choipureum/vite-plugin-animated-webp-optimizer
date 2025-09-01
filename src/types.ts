export interface AnimatedWebpOptimizerOptions {
  /**
   * WebP quality (1-100)
   * @default 80
   */
  quality?: number;

  /**
   * Compression effort (0-6)
   * @default 4
   */
  effort?: number;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;

  /**
   * Maximum file size in bytes (0 = no limit)
   * @default 0
   */
  maxFileSize?: number;

  /**
   * Skip optimization if file is already smaller than this size
   * @default 0
   */
  skipIfSmaller?: number;

  /**
   * Animation quality for animated WebP (1-100)
   * @default 80
   */
  animationQuality?: number;

  /**
   * Animation compression method (0-6)
   * @default 4
   */
  animationCompression?: number;

  /**
   * Enable animation optimization
   * @default true
   */
  optimizeAnimation?: boolean;

  /**
   * Maximum width for resizing (0 = no resize)
   * @default 0
   */
  maxWidth?: number;

  /**
   * Maximum height for resizing (0 = no resize)
   * @default 0
   */
  maxHeight?: number;

  /**
   * Number of concurrent images to process
   * @default 5
   */
  concurrentImages?: number;
}

export interface ProcessOptions {
  verbose: boolean;
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

export interface WebPMetadata {
  pages?: number;
  loop?: number;
  delay?: number[];
  width?: number;
  height?: number;
  size?: number;
  pageHeight?: number;
}

export interface OptimizationResult {
  success: boolean;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  error?: string;
}
