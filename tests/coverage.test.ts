import { Plugin } from "vite";
import animatedWebpOptimizer from "../src/index";

describe("Coverage Tests", () => {
  describe("Plugin Creation with Various Options", () => {
    it("should create plugin with all possible options", () => {
      const allOptions = {
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

      const plugin = animatedWebpOptimizer(allOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should create plugin with minimum values", () => {
      const minOptions = {
        quality: 1,
        effort: 0,
        animationQuality: 1,
        animationCompression: 0,
        maxWidth: 0,
        maxHeight: 0,
        concurrentImages: 1,
      };

      const plugin = animatedWebpOptimizer(minOptions);
      expect(plugin).toBeDefined();
    });

    it("should create plugin with maximum values", () => {
      const maxOptions = {
        quality: 100,
        effort: 6,
        animationQuality: 100,
        animationCompression: 6,
        maxWidth: 9999,
        maxHeight: 9999,
        concurrentImages: 100,
      };

      const plugin = animatedWebpOptimizer(maxOptions);
      expect(plugin).toBeDefined();
    });

    it("should create plugin with mixed options", () => {
      const mixedOptions = {
        quality: 50,
        effort: 3,
        verbose: false,
        maxFileSize: 1024 * 1024,
        skipIfSmaller: 512 * 1024,
        animationQuality: 75,
        animationCompression: 4,
        optimizeAnimation: false,
        maxWidth: 1920,
        maxHeight: 1080,
        concurrentImages: 10,
      };

      const plugin = animatedWebpOptimizer(mixedOptions);
      expect(plugin).toBeDefined();
    });

    it("should create plugin with single options", () => {
      expect(() => animatedWebpOptimizer({ quality: 90 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ effort: 5 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ verbose: true })).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ maxFileSize: 1000000 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ skipIfSmaller: 50000 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationQuality: 80 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 5 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ optimizeAnimation: false })
      ).not.toThrow();
      expect(() => animatedWebpOptimizer({ maxWidth: 1000 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ maxHeight: 800 })).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ concurrentImages: 8 })
      ).not.toThrow();
    });
  });

  describe("Option Validation Edge Cases", () => {
    it("should validate quality boundaries", () => {
      expect(() => animatedWebpOptimizer({ quality: 0 })).toThrow();
      expect(() => animatedWebpOptimizer({ quality: 1 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ quality: 50 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ quality: 100 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ quality: 101 })).toThrow();
    });

    it("should validate effort boundaries", () => {
      expect(() => animatedWebpOptimizer({ effort: -1 })).toThrow();
      expect(() => animatedWebpOptimizer({ effort: 0 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ effort: 3 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ effort: 6 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ effort: 7 })).toThrow();
    });

    it("should validate animationQuality boundaries", () => {
      expect(() => animatedWebpOptimizer({ animationQuality: 0 })).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationQuality: 1 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationQuality: 50 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationQuality: 100 })
      ).not.toThrow();
      expect(() => animatedWebpOptimizer({ animationQuality: 101 })).toThrow();
    });

    it("should validate animationCompression boundaries", () => {
      expect(() =>
        animatedWebpOptimizer({ animationCompression: -1 })
      ).toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 0 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 3 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 6 })
      ).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ animationCompression: 7 })
      ).toThrow();
    });
  });

  describe("Plugin Structure and Properties", () => {
    let plugin: Plugin;

    beforeEach(() => {
      plugin = animatedWebpOptimizer();
    });

    it("should have correct plugin structure", () => {
      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe("object");
      expect(plugin).toHaveProperty("name");
      expect(plugin).toHaveProperty("closeBundle");
    });

    it("should have correct plugin name", () => {
      expect(plugin.name).toBe("vite-plugin-animated-webp-optimizer");
    });

    it("should have closeBundle hook", () => {
      expect(plugin.closeBundle).toBeDefined();
      expect(typeof plugin.closeBundle).toBe("function");
    });

    it("should maintain plugin identity", () => {
      const plugin1 = animatedWebpOptimizer();
      const plugin2 = animatedWebpOptimizer();

      expect(plugin1).not.toBe(plugin2);
      expect(plugin1.name).toBe(plugin2.name);
      expect(typeof plugin1.closeBundle).toBe(typeof plugin2.closeBundle);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle undefined options gracefully", () => {
      expect(() => animatedWebpOptimizer(undefined as any)).not.toThrow();
    });

    it("should handle empty options object", () => {
      expect(() => animatedWebpOptimizer({})).not.toThrow();
    });

    it("should handle options with only some properties", () => {
      expect(() => animatedWebpOptimizer({ quality: 90 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ verbose: true })).not.toThrow();
      expect(() => animatedWebpOptimizer({ maxWidth: 800 })).not.toThrow();
      expect(() => animatedWebpOptimizer({ maxHeight: 600 })).not.toThrow();
      expect(() =>
        animatedWebpOptimizer({ concurrentImages: 5 })
      ).not.toThrow();
    });

    it("should handle multiple validation errors", () => {
      expect(() =>
        animatedWebpOptimizer({
          quality: 0,
          effort: -1,
          animationQuality: 101,
          animationCompression: 7,
        })
      ).toThrow();
    });
  });

  describe("Configuration Combinations", () => {
    it("should handle quality and effort combinations", () => {
      for (let quality = 1; quality <= 100; quality += 25) {
        for (let effort = 0; effort <= 6; effort += 2) {
          expect(() =>
            animatedWebpOptimizer({ quality, effort })
          ).not.toThrow();
        }
      }
    });

    it("should handle animation quality and compression combinations", () => {
      for (let quality = 1; quality <= 100; quality += 25) {
        for (let compression = 0; compression <= 6; compression += 2) {
          expect(() =>
            animatedWebpOptimizer({
              animationQuality: quality,
              animationCompression: compression,
            })
          ).not.toThrow();
        }
      }
    });

    it("should handle size limit combinations", () => {
      const sizeOptions = [
        { maxFileSize: 0, skipIfSmaller: 0 },
        { maxFileSize: 1000000, skipIfSmaller: 0 },
        { maxFileSize: 0, skipIfSmaller: 100000 },
        { maxFileSize: 2000000, skipIfSmaller: 500000 },
      ];

      sizeOptions.forEach((options) => {
        expect(() => animatedWebpOptimizer(options)).not.toThrow();
      });
    });

    it("should handle dimension combinations", () => {
      const dimensionOptions = [
        { maxWidth: 0, maxHeight: 0 },
        { maxWidth: 1920, maxHeight: 0 },
        { maxWidth: 0, maxHeight: 1080 },
        { maxWidth: 1920, maxHeight: 1080 },
        { maxWidth: 800, maxHeight: 600 },
      ];

      dimensionOptions.forEach((options) => {
        expect(() => animatedWebpOptimizer(options)).not.toThrow();
      });
    });
  });

  describe("Plugin Behavior Consistency", () => {
    it("should create consistent plugins with same options", () => {
      const options = { quality: 80, effort: 4, verbose: true };

      const plugin1 = animatedWebpOptimizer(options);
      const plugin2 = animatedWebpOptimizer(options);

      expect(plugin1.name).toBe(plugin2.name);
      expect(typeof plugin1.closeBundle).toBe(typeof plugin2.closeBundle);
    });

    it("should handle concurrent image limits", () => {
      const concurrentOptions = [1, 2, 5, 10, 20, 50, 100];

      concurrentOptions.forEach((concurrent) => {
        expect(() =>
          animatedWebpOptimizer({ concurrentImages: concurrent })
        ).not.toThrow();
      });
    });

    it("should handle boolean flags", () => {
      const booleanOptions = [
        { verbose: true },
        { verbose: false },
        { optimizeAnimation: true },
        { optimizeAnimation: false },
      ];

      booleanOptions.forEach((options) => {
        expect(() => animatedWebpOptimizer(options)).not.toThrow();
      });
    });
  });
});
