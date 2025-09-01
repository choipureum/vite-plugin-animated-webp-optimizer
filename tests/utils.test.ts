import { isValidWebP, formatBytes } from "../src/utils";

describe("Utils", () => {
  describe("isValidWebP", () => {
    it("should return true for valid WebP files", () => {
      const validWebP = Buffer.from("RIFF\x00\x00\x00\x00WEBPVP8");
      expect(isValidWebP(validWebP)).toBe(true);
    });

    it("should return false for invalid WebP files", () => {
      const invalidWebP = Buffer.from("INVALID");
      expect(isValidWebP(invalidWebP)).toBe(false);
    });

    it("should return false for empty buffer", () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(isValidWebP(emptyBuffer)).toBe(false);
    });

    it("should return false for null buffer", () => {
      const nullBuffer = null as any;
      expect(isValidWebP(nullBuffer)).toBe(false);
    });

    it("should return false for undefined buffer", () => {
      const undefinedBuffer = undefined as any;
      expect(isValidWebP(undefinedBuffer)).toBe(false);
    });

    it("should return false for buffer too small", () => {
      const smallBuffer = Buffer.from("RI");
      expect(isValidWebP(smallBuffer)).toBe(false);
    });

    it("should return false for buffer without RIFF header", () => {
      const noRiffBuffer = Buffer.from("WEBP\x00\x00\x00\x00VP8");
      expect(isValidWebP(noRiffBuffer)).toBe(false);
    });

    it("should return false for buffer without WEBP header", () => {
      const noWebpBuffer = Buffer.from("RIFF\x00\x00\x00\x00PNG");
      expect(isValidWebP(noWebpBuffer)).toBe(false);
    });

    it("should handle buffer with extra data", () => {
      const extraDataBuffer = Buffer.from(
        "RIFF\x00\x00\x00\x00WEBPVP8\x00\x00\x00\x00EXTRA"
      );
      expect(isValidWebP(extraDataBuffer)).toBe(true);
    });
  });

  describe("formatBytes", () => {
    it("should format 0 bytes", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("should format bytes less than 1KB", () => {
      expect(formatBytes(512)).toBe("512 Bytes");
      expect(formatBytes(1023)).toBe("1023 Bytes");
    });

    it("should format 1KB", () => {
      expect(formatBytes(1024)).toBe("1 KB");
    });

    it("should format kilobytes", () => {
      expect(formatBytes(1536)).toBe("1.5 KB");
      expect(formatBytes(2048)).toBe("2 KB");
      expect(formatBytes(5120)).toBe("5 KB");
    });

    it("should format 1MB", () => {
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
    });

    it("should format megabytes", () => {
      expect(formatBytes(1024 * 1024 * 1.5)).toBe("1.5 MB");
      expect(formatBytes(1024 * 1024 * 2)).toBe("2 MB");
      expect(formatBytes(1024 * 1024 * 10)).toBe("10 MB");
    });

    it("should format 1GB", () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should format gigabytes", () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1.5)).toBe("1.5 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 2)).toBe("2 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 10)).toBe("10 GB");
    });

    it("should format 1TB", () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should format terabytes", () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1.5)).toBe("1.5 TB");
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 2)).toBe("2 TB");
    });

    it("should handle decimal precision", () => {
      expect(formatBytes(1024 * 1.123)).toBe("1.12 KB");
      expect(formatBytes(1024 * 1.126)).toBe("1.13 KB");
      expect(formatBytes(1024 * 1024 * 1.999)).toBe("2 MB");
    });

    it("should handle very large numbers", () => {
      const petabyte = 1024 * 1024 * 1024 * 1024 * 1024;
      expect(formatBytes(petabyte)).toBe("1 PB");
      expect(formatBytes(petabyte * 2)).toBe("2 PB");
    });

    it("should handle negative numbers", () => {
      expect(formatBytes(-512)).toBe("-512 Bytes");
      expect(formatBytes(-1024)).toBe("-1 KB");
      expect(formatBytes(-1024 * 1024)).toBe("-1 MB");
    });

    it("should handle NaN", () => {
      expect(formatBytes(NaN)).toBe("NaN Bytes");
    });

    it("should handle Infinity", () => {
      expect(formatBytes(Infinity)).toBe("Infinity Bytes");
    });

    it("should handle -Infinity", () => {
      expect(formatBytes(-Infinity)).toBe("-Infinity Bytes");
    });
  });
});
