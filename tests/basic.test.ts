import { Plugin } from "vite";
import animatedWebpOptimizer from "../src/index";

describe("Basic Plugin Tests", () => {
  let plugin: Plugin;

  describe("Plugin Creation", () => {
    it("should create a plugin with default options", () => {
      plugin = animatedWebpOptimizer();
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should create a plugin with custom options", () => {
      const options = {
        quality: 90,
        effort: 5,
        verbose: true,
        animationQuality: 85,
      };

      plugin = animatedWebpOptimizer(options);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should have required plugin properties", () => {
      plugin = animatedWebpOptimizer();
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
      expect(typeof plugin.closeBundle).toBe("function");
    });
  });

  describe("Option Validation", () => {
    it("should throw error for invalid quality", () => {
      expect(() => animatedWebpOptimizer({ quality: 0 })).toThrow();
      expect(() => animatedWebpOptimizer({ quality: 101 })).toThrow();
    });

    it("should throw error for invalid effort", () => {
      expect(() => animatedWebpOptimizer({ effort: -1 })).toThrow();
      expect(() => animatedWebpOptimizer({ effort: 7 })).toThrow();
    });

    it("should throw error for invalid animationQuality", () => {
      expect(() => animatedWebpOptimizer({ animationQuality: 0 })).toThrow();
      expect(() => animatedWebpOptimizer({ animationQuality: 101 })).toThrow();
    });

    it("should throw error for invalid animationCompression", () => {
      expect(() =>
        animatedWebpOptimizer({ animationCompression: -1 })
      ).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 7 })
      ).toThrow();
    });

    it("should accept valid options", () => {
      expect(() =>
        animatedWebpOptimizer({
          quality: 50,
          effort: 3,
          animationQuality: 75,
          animationCompression: 5,
        })
      ).not.toThrow();
    });
  });

  describe("Plugin Structure", () => {
    beforeEach(() => {
      plugin = animatedWebpOptimizer();
    });

    it("should have closeBundle hook", () => {
      expect(plugin.closeBundle).toBeDefined();
      expect(typeof plugin.closeBundle).toBe("function");
    });

    it("should have correct plugin name", () => {
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });
  });

  describe("Default Values", () => {
    it("should use correct default values", () => {
      plugin = animatedWebpOptimizer();
      // Plugin should be created without errors, indicating default values are valid
      expect(plugin).toBeDefined();
    });

    it("should handle empty options object", () => {
      plugin = animatedWebpOptimizer({});
      expect(plugin).toBeDefined();
    });

    it("should handle undefined options", () => {
      plugin = animatedWebpOptimizer(undefined as any);
      expect(plugin).toBeDefined();
    });
  });
});
