import { WebPProcessor } from "../src/processors";
import { ProcessOptions } from "../src/types";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");
jest.mock("sharp");

describe("WebPProcessor", () => {
  let processor: WebPProcessor;
  let mockOptions: ProcessOptions;

  beforeEach(() => {
    mockOptions = {
      verbose: false,
      maxFileSize: 0,
      skipIfSmaller: 0,
      quality: 80,
      effort: 4,
      animationQuality: 80,
      animationCompression: 4,
      optimizeAnimation: true,
      maxWidth: 0,
      maxHeight: 0,
      concurrentImages: 15,
      outDir: 'dist',
    };

    processor = new WebPProcessor(mockOptions);
  });

  describe("constructor", () => {
    it("should create processor with options", () => {
      expect(processor).toBeInstanceOf(WebPProcessor);
    });
  });

  describe("processDirectory", () => {
    it("should handle non-existent directory", async () => {
      const mockFs = require("fs");
      mockFs.existsSync.mockReturnValue(false);

      await processor.processDirectory("nonexistent", "dist");

      expect(mockFs.existsSync).toHaveBeenCalledWith("nonexistent");
    });

    it("should process empty directory", async () => {
      const mockFs = require("fs");
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      await processor.processDirectory("empty", "dist");

      expect(mockFs.readdirSync).toHaveBeenCalledWith("empty");
    });
  });
});
