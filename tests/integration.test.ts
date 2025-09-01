import { Plugin } from "vite";
import animatedWebpOptimizer from "../src/index";

describe("Integration Tests", () => {
  let plugin: Plugin;

  describe("Plugin Initialization", () => {
    it("should create plugin with all options", () => {
      const options = {
        quality: 85,
        effort: 6,
        verbose: true,
        maxFileSize: 500 * 1024,
        skipIfSmaller: 100 * 1024,
        animationQuality: 70,
        animationCompression: 6,
        optimizeAnimation: true,
        maxWidth: 800,
        maxHeight: 600,
        concurrentImages: 3,
      };

      plugin = animatedWebpOptimizer(options);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should handle edge case options", () => {
      const options = {
        quality: 1,
        effort: 0,
        animationQuality: 1,
        animationCompression: 0,
        maxWidth: 0,
        maxHeight: 0,
      };

      plugin = animatedWebpOptimizer(options);
      expect(plugin).toBeDefined();
    });
  });

  describe("Plugin Structure", () => {
    beforeEach(() => {
      plugin = animatedWebpOptimizer({ verbose: true });
    });

    it("should have closeBundle hook", () => {
      expect(plugin.closeBundle).toBeDefined();
    });

    it("should have correct plugin name", () => {
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should have correct plugin type", () => {
      expect(typeof plugin).toBe("object");
      expect(plugin).toHaveProperty("name");
      expect(plugin).toHaveProperty("closeBundle");
    });
  });

  describe("Configuration Validation", () => {
    it("should validate quality range", () => {
      expect(() => animatedWebpOptimizer({ quality: 0 })).toThrow();
      expect(() => animatedWebpOptimizer({ quality: 101 })).toThrow();
      expect(() => animatedWebpOptimizer({ quality: 50 })).not.toThrow();
    });

    it("should validate effort range", () => {
      expect(() => animatedWebpOptimizer({ effort: -1 })).toThrow();
      expect(() => animatedWebpOptimizer({ effort: 7 })).toThrow();
      expect(() => animatedWebpOptimizer({ effort: 3 })).not.toThrow();
    });

    it("should validate animationQuality range", () => {
      expect(() => animatedWebpOptimizer({ animationQuality: 0 })).toThrow();
      expect(() => animatedWebpOptimizer({ animationQuality: 101 })).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationQuality: 75 })
      ).not.toThrow();
    });

    it("should validate animationCompression range", () => {
      expect(() =>
        animatedWebpOptimizer({ animationCompression: -1 })
      ).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 7 })
      ).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 4 })
      ).not.toThrow();
    });
  });

  describe("Option Combinations", () => {
    it("should handle all options set to minimum values", () => {
      const options = {
        quality: 1,
        effort: 0,
        animationQuality: 1,
        animationCompression: 0,
        maxWidth: 0,
        maxHeight: 0,
        concurrentImages: 1,
      };

      expect(() => animatedWebpOptimizer(options)).not.toThrow();
    });

    it("should handle all options set to maximum values", () => {
      const options = {
        quality: 100,
        effort: 6,
        animationQuality: 100,
        animationCompression: 6,
        maxWidth: 9999,
        maxHeight: 9999,
        concurrentImages: 100,
      };

      expect(() => animatedWebpOptimizer(options)).not.toThrow();
    });

    it("should handle mixed valid options", () => {
      const options = {
        quality: 80,
        effort: 4,
        verbose: true,
        maxFileSize: 1024 * 1024,
        skipIfSmaller: 512 * 1024,
        animationQuality: 85,
        animationCompression: 5,
        optimizeAnimation: false,
        maxWidth: 1920,
        maxHeight: 1080,
        concurrentImages: 10,
      };

      expect(() => animatedWebpOptimizer(options)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined options", () => {
      expect(() => animatedWebpOptimizer(undefined as any)).not.toThrow();
    });

    it("should handle empty options object", () => {
      expect(() => animatedWebpOptimizer({})).not.toThrow();
    });

    it("should handle options with only some properties", () => {
      expect(() => animatedWebpOptimizer({ quality: 90 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ verbose: true })).not.toThrow();
      expect(() => animatedWebpOptimizer({ maxWidth: 800 })).not.toThrow();
    });
  });

  describe("Plugin Behavior", () => {
    it("should create different plugin instances", () => {
      const plugin1 = animatedWebpOptimizer({ quality: 80 });
      const plugin2 = animatedWebpOptimizer({ quality: 90 });

      expect(plugin1).not.toBe(plugin2);
      expect(plugin1.name).toBe(plugin2.name);
    });

    it("should maintain plugin state", () => {
      const plugin = animatedWebpOptimizer({ verbose: true });

      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
      expect(plugin.closeBundle).toBeDefined();
    });
  });
});
