import {
  AnimatedWebpOptimizerOptions,
  ProcessOptions,
  WebPMetadata,
  OptimizationResult,
} from "../src/types";

describe("Type Definitions", () => {
  describe("AnimatedWebpOptimizerOptions", () => {
    it("should allow all valid options", () => {
      const options: AnimatedWebpOptimizerOptions = {
        quality: 85,
        effort: 4,
        verbose: true,
        maxFileSize: 1000000,
        skipIfSmaller: 50000,
        animationQuality: 90,
        animationCompression: 5,
        optimizeAnimation: true,
        maxWidth: 1920,
        maxHeight: 1080,
        concurrentImages: 10,
      };

      expect(options.quality).toBe(85);
      expect(options.effort).toBe(4);
      expect(options.verbose).toBe(true);
      expect(options.maxFileSize).toBe(1000000);
      expect(options.skipIfSmaller).toBe(50000);
      expect(options.animationQuality).toBe(90);
      expect(options.animationCompression).toBe(5);
      expect(options.optimizeAnimation).toBe(true);
      expect(options.maxWidth).toBe(1920);
      expect(options.maxHeight).toBe(1080);
      expect(options.concurrentImages).toBe(10);
    });

    it("should allow partial options", () => {
      const options: AnimatedWebpOptimizerOptions = {
        quality: 90,
        verbose: true,
      };

      expect(options.quality).toBe(90);
      expect(options.verbose).toBe(true);
      expect(options.effort).toBeUndefined();
    });

    it("should allow empty options", () => {
      const options: AnimatedWebpOptimizerOptions = {};
      expect(Object.keys(options)).toHaveLength(0);
    });
  });

  describe("ProcessOptions", () => {
    it("should have correct ProcessOptions structure", () => {
      const options: ProcessOptions = {
        verbose: true,
        maxFileSize: 1000000,
        skipIfSmaller: 50000,
        quality: 85,
        effort: 6,
        lossless: false,
        animationQuality: 90,
        animationCompression: 5,
        optimizeAnimation: true,
        maxWidth: 1920,
        maxHeight: 1080,
        concurrentImages: 15,
        outDir: 'dist',
      };

      expect(options.verbose).toBe(true);
      expect(options.maxFileSize).toBe(1000000);
      expect(options.skipIfSmaller).toBe(50000);
      expect(options.quality).toBe(85);
      expect(options.effort).toBe(6);
      expect(options.animationQuality).toBe(90);
      expect(options.animationCompression).toBe(5);
      expect(options.optimizeAnimation).toBe(true);
      expect(options.maxWidth).toBe(1920);
      expect(options.maxHeight).toBe(1080);
              expect(options.concurrentImages).toBe(15);
    });
  });

  describe("WebPMetadata", () => {
    it("should allow all metadata properties", () => {
      const metadata: WebPMetadata = {
        pages: 96,
        loop: 0,
        delay: [100, 100, 100],
        width: 360,
        height: 240,
        size: 1000000,
        pageHeight: 240,
      };

      expect(metadata.pages).toBe(96);
      expect(metadata.loop).toBe(0);
      expect(metadata.delay).toEqual([100, 100, 100]);
      expect(metadata.width).toBe(360);
      expect(metadata.height).toBe(240);
      expect(metadata.size).toBe(1000000);
      expect(metadata.pageHeight).toBe(240);
    });

    it("should allow partial metadata", () => {
      const metadata: WebPMetadata = {
        width: 100,
        height: 100,
      };

      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
      expect(metadata.pages).toBeUndefined();
    });
  });

  describe("OptimizationResult", () => {
    it("should have all required properties for success", () => {
      const result: OptimizationResult = {
        success: true,
        originalSize: 1000000,
        optimizedSize: 800000,
        savings: 200000,
        savingsPercent: 20.0,
      };

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(1000000);
      expect(result.optimizedSize).toBe(800000);
      expect(result.savings).toBe(200000);
      expect(result.savingsPercent).toBe(20.0);
      expect(result.error).toBeUndefined();
    });

    it("should allow error property for failed optimization", () => {
      const result: OptimizationResult = {
        success: false,
        originalSize: 1000000,
        optimizedSize: 1000000,
        savings: 0,
        savingsPercent: 0,
        error: "Optimization failed",
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Optimization failed");
    });
  });
});
