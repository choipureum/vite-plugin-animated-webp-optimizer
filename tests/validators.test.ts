import { 
  validateOptions, 
  getDefaultOptions, 
  mergeOptions, 
  ValidationError 
} from '../src/validators';

describe('Validators', () => {
  describe('validateOptions', () => {
    it('should accept valid options', () => {
      const options = {
        quality: 85,
        effort: 4,
        animationQuality: 90,
        animationCompression: 5,
        maxFileSize: 1000000,
        skipIfSmaller: 50000,
        maxWidth: 1920,
        maxHeight: 1080,
        concurrentImages: 10,
      };

      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should accept empty options', () => {
      expect(() => validateOptions({})).not.toThrow();
    });

    it('should accept undefined options', () => {
      expect(() => validateOptions(undefined as any)).not.toThrow();
    });

    describe('quality validation', () => {
      it('should throw error for quality < 1', () => {
        expect(() => validateOptions({ quality: 0 })).toThrow(ValidationError);
        expect(() => validateOptions({ quality: -1 })).toThrow(ValidationError);
      });

      it('should throw error for quality > 100', () => {
        expect(() => validateOptions({ quality: 101 })).toThrow(ValidationError);
        expect(() => validateOptions({ quality: 200 })).toThrow(ValidationError);
      });

      it('should accept quality at boundaries', () => {
        expect(() => validateOptions({ quality: 1 })).not.toThrow();
        expect(() => validateOptions({ quality: 100 })).not.toThrow();
      });

      it('should accept quality in middle range', () => {
        expect(() => validateOptions({ quality: 50 })).not.toThrow();
        expect(() => validateOptions({ quality: 85 })).not.toThrow();
      });
    });

    describe('effort validation', () => {
      it('should throw error for effort < 0', () => {
        expect(() => validateOptions({ effort: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ effort: -10 })).toThrow(ValidationError);
      });

      it('should throw error for effort > 6', () => {
        expect(() => validateOptions({ effort: 7 })).toThrow(ValidationError);
        expect(() => validateOptions({ effort: 10 })).toThrow(ValidationError);
      });

      it('should accept effort at boundaries', () => {
        expect(() => validateOptions({ effort: 0 })).not.toThrow();
        expect(() => validateOptions({ effort: 6 })).not.toThrow();
      });

      it('should accept effort in middle range', () => {
        expect(() => validateOptions({ effort: 3 })).not.toThrow();
        expect(() => validateOptions({ effort: 4 })).not.toThrow();
      });
    });

    describe('animationQuality validation', () => {
      it('should throw error for animationQuality < 1', () => {
        expect(() => validateOptions({ animationQuality: 0 })).toThrow(ValidationError);
        expect(() => validateOptions({ animationQuality: -1 })).toThrow(ValidationError);
      });

      it('should throw error for animationQuality > 100', () => {
        expect(() => validateOptions({ animationQuality: 101 })).toThrow(ValidationError);
        expect(() => validateOptions({ animationQuality: 200 })).toThrow(ValidationError);
      });

      it('should accept animationQuality at boundaries', () => {
        expect(() => validateOptions({ animationQuality: 1 })).not.toThrow();
        expect(() => validateOptions({ animationQuality: 100 })).not.toThrow();
      });
    });

    describe('animationCompression validation', () => {
      it('should throw error for animationCompression < 0', () => {
        expect(() => validateOptions({ animationCompression: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ animationCompression: -10 })).toThrow(ValidationError);
      });

      it('should throw error for animationCompression > 6', () => {
        expect(() => validateOptions({ animationCompression: 7 })).toThrow(ValidationError);
        expect(() => validateOptions({ animationCompression: 10 })).toThrow(ValidationError);
      });

      it('should accept animationCompression at boundaries', () => {
        expect(() => validateOptions({ animationCompression: 0 })).not.toThrow();
        expect(() => validateOptions({ animationCompression: 6 })).not.toThrow();
      });
    });

    describe('size validation', () => {
      it('should throw error for negative maxFileSize', () => {
        expect(() => validateOptions({ maxFileSize: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ maxFileSize: -1000 })).toThrow(ValidationError);
      });

      it('should throw error for negative skipIfSmaller', () => {
        expect(() => validateOptions({ skipIfSmaller: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ skipIfSmaller: -1000 })).toThrow(ValidationError);
      });

      it('should accept zero values', () => {
        expect(() => validateOptions({ maxFileSize: 0 })).not.toThrow();
        expect(() => validateOptions({ skipIfSmaller: 0 })).not.toThrow();
      });

      it('should accept positive values', () => {
        expect(() => validateOptions({ maxFileSize: 1000000 })).not.toThrow();
        expect(() => validateOptions({ skipIfSmaller: 50000 })).not.toThrow();
      });
    });

    describe('dimension validation', () => {
      it('should throw error for negative maxWidth', () => {
        expect(() => validateOptions({ maxWidth: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ maxWidth: -100 })).toThrow(ValidationError);
      });

      it('should throw error for negative maxHeight', () => {
        expect(() => validateOptions({ maxHeight: -1 })).toThrow(ValidationError);
        expect(() => validateOptions({ maxHeight: -100 })).toThrow(ValidationError);
      });

      it('should accept zero values', () => {
        expect(() => validateOptions({ maxWidth: 0 })).not.toThrow();
        expect(() => validateOptions({ maxHeight: 0 })).not.toThrow();
      });

      it('should accept positive values', () => {
        expect(() => validateOptions({ maxWidth: 1920 })).not.toThrow();
        expect(() => validateOptions({ maxHeight: 1080 })).not.toThrow();
      });
    });

    describe('concurrentImages validation', () => {
      it('should throw error for concurrentImages < 1', () => {
        expect(() => validateOptions({ concurrentImages: 0 })).toThrow(ValidationError);
        expect(() => validateOptions({ concurrentImages: -1 })).toThrow(ValidationError);
      });

      it('should accept concurrentImages >= 1', () => {
        expect(() => validateOptions({ concurrentImages: 1 })).not.toThrow();
        expect(() => validateOptions({ concurrentImages: 10 })).not.toThrow();
        expect(() => validateOptions({ concurrentImages: 100 })).not.toThrow();
      });
    });

    describe('multiple validation errors', () => {
      it('should throw error for multiple invalid options', () => {
        const invalidOptions = {
          quality: 0,
          effort: -1,
          animationQuality: 101,
          animationCompression: 7,
        };

        expect(() => validateOptions(invalidOptions)).toThrow(ValidationError);
      });
    });
  });

  describe('getDefaultOptions', () => {
    it('should return all default values', () => {
      const defaults = getDefaultOptions();

      expect(defaults.quality).toBe(80);
      expect(defaults.effort).toBe(4);
      expect(defaults.verbose).toBe(false);
      expect(defaults.maxFileSize).toBe(0);
      expect(defaults.skipIfSmaller).toBe(0);
      expect(defaults.animationQuality).toBe(80);
      expect(defaults.animationCompression).toBe(4);
      expect(defaults.optimizeAnimation).toBe(true);
      expect(defaults.maxWidth).toBe(0);
      expect(defaults.maxHeight).toBe(0);
      expect(defaults.concurrentImages).toBe(5);
    });

    it('should return immutable defaults', () => {
      const defaults1 = getDefaultOptions();
      const defaults2 = getDefaultOptions();

      expect(defaults1).not.toBe(defaults2);
      expect(defaults1).toEqual(defaults2);
    });
  });

  describe('mergeOptions', () => {
    it('should merge partial options with defaults', () => {
      const partialOptions = {
        quality: 90,
        verbose: true,
        maxWidth: 1920,
      };

      const merged = mergeOptions(partialOptions);

      expect(merged.quality).toBe(90); // Custom value
      expect(merged.verbose).toBe(true); // Custom value
      expect(merged.maxWidth).toBe(1920); // Custom value
      expect(merged.effort).toBe(4); // Default value
      expect(merged.animationQuality).toBe(80); // Default value
    });

    it('should return defaults when no options provided', () => {
      const merged = mergeOptions();

      expect(merged.quality).toBe(80);
      expect(merged.effort).toBe(4);
      expect(merged.verbose).toBe(false);
    });

    it('should return defaults when empty options provided', () => {
      const merged = mergeOptions({});

      expect(merged.quality).toBe(80);
      expect(merged.effort).toBe(4);
      expect(merged.verbose).toBe(false);
    });

    it('should override all defaults when all options provided', () => {
      const allOptions = {
        quality: 95,
        effort: 6,
        verbose: true,
        maxFileSize: 2000000,
        skipIfSmaller: 100000,
        animationQuality: 95,
        animationCompression: 6,
        optimizeAnimation: false,
        maxWidth: 2560,
        maxHeight: 1440,
        concurrentImages: 20,
      };

      const merged = mergeOptions(allOptions);

      expect(merged.quality).toBe(95);
      expect(merged.effort).toBe(6);
      expect(merged.verbose).toBe(true);
      expect(merged.maxFileSize).toBe(2000000);
      expect(merged.skipIfSmaller).toBe(100000);
      expect(merged.animationQuality).toBe(95);
      expect(merged.animationCompression).toBe(6);
      expect(merged.optimizeAnimation).toBe(false);
      expect(merged.maxWidth).toBe(2560);
      expect(merged.maxHeight).toBe(1440);
      expect(merged.concurrentImages).toBe(20);
    });
  });

  describe('ValidationError', () => {
    it('should have correct error message format', () => {
      const error = new ValidationError('test error message');
      
      expect(error.message).toBe('vite-plugin-animated-webp-optimizer: test error message');
      expect(error.name).toBe('ValidationError');
    });

    it('should be instance of Error', () => {
      const error = new ValidationError('test');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
