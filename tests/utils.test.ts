import {
  isValidWebP,
  formatBytes,
  detectAnimatedWebP,
  copyFileToDist,
} from "../src/utils";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");
jest.mock("sharp");

describe("Utility Functions", () => {
  describe("isValidWebP", () => {
    it("should validate correct WebP header", () => {
      const validWebPBuffer = Buffer.from("RIFF\x00\x00\x00\x00WEBP");
      expect(isValidWebP(validWebPBuffer)).toBe(true);
    });

    it("should reject invalid WebP header", () => {
      const invalidBuffer = Buffer.from("INVALID");
      expect(isValidWebP(invalidBuffer)).toBe(false);
    });

    it("should reject buffer that is too small", () => {
      const smallBuffer = Buffer.from("RIFF");
      expect(isValidWebP(smallBuffer)).toBe(false);
    });

    it("should handle edge case buffers", () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(isValidWebP(emptyBuffer)).toBe(false);

      const shortBuffer = Buffer.from("RIFF\x00\x00\x00");
      expect(isValidWebP(shortBuffer)).toBe(false);

      const longBuffer = Buffer.alloc(100);
      longBuffer.write("RIFF", 0);
      longBuffer.write("WEBP", 8);
      expect(isValidWebP(longBuffer)).toBe(true);
    });
  });

  describe("formatBytes", () => {
    it("should format 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("should format bytes correctly", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(2048)).toBe("2 KB");
      expect(formatBytes(512)).toBe("512 Bytes");
    });

    it("should format large bytes correctly", () => {
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
    });

    it("should format decimal values correctly", () => {
      expect(formatBytes(1536)).toBe("1.5 KB");
      expect(formatBytes(768)).toBe("768 Bytes");
      expect(formatBytes(1572864)).toBe("1.5 MB");
    });

    it("should handle edge cases", () => {
      expect(formatBytes(1)).toBe("1 Bytes");
      expect(formatBytes(1023)).toBe("1023 Bytes");
      expect(formatBytes(1025)).toBe("1 KB");
    });
  });

  describe("detectAnimatedWebP", () => {
    it("should detect animated WebP correctly", async () => {
      const mockSharp = require("sharp");
      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({
          pages: 96,
          loop: 0,
          delay: [100],
          width: 360,
          height: 240,
        }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const result = await detectAnimatedWebP("test.webp");
      expect(result).toBe(true);
    });

    it("should detect static WebP correctly", async () => {
      const mockSharp = require("sharp");
      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({
          pages: 1,
          width: 100,
          height: 100,
        }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const result = await detectAnimatedWebP("test.webp");
      expect(result).toBe(false);
    });

    it("should handle detection errors gracefully", async () => {
      const mockSharp = require("sharp");
      mockSharp.mockImplementation(() => {
        throw new Error("Sharp error");
      });

      const result = await detectAnimatedWebP("test.webp");
      expect(result).toBe(false);
    });

    it("should handle metadata errors gracefully", async () => {
      const mockSharp = require("sharp");
      const mockSharpInstance = {
        metadata: jest.fn().mockRejectedValue(new Error("Metadata error")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const result = await detectAnimatedWebP("test.webp");
      expect(result).toBe(false);
    });
  });

  describe("copyFileToDist", () => {
    it("should copy file successfully", () => {
      const mockFs = require("fs");
      const mockPath = require("path");

      mockPath.join.mockReturnValue("dist/test.webp");
      mockFs.copyFileSync.mockImplementation(() => {});

      expect(() => copyFileToDist("test.webp", "dist")).not.toThrow();
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "test.webp",
        "dist/test.webp"
      );
    });

    it("should handle copy errors", () => {
      const mockFs = require("fs");
      const mockPath = require("path");

      mockPath.join.mockReturnValue("dist/test.webp");
      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error("Copy failed");
      });

      expect(() => copyFileToDist("test.webp", "dist")).toThrow(
        "Failed to copy file: Error: Copy failed"
      );
    });
  });
});
