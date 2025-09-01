import { AnimatedWebpOptimizerOptions } from "./types";

const PLUGIN_NAME = "vite-plugin-animated-webp-optimizer";

export class ValidationError extends Error {
  constructor(message: string) {
    super(`${PLUGIN_NAME}: ${message}`);
    this.name = "ValidationError";
  }
}

export function validateOptions(
  options: AnimatedWebpOptimizerOptions = {}
): void {
  if (options.quality !== undefined) {
    if (options.quality < 1 || options.quality > 100) {
      throw new ValidationError("quality must be between 1 and 100");
    }
  }

  if (options.effort !== undefined) {
    if (options.effort < 0 || options.effort > 6) {
      throw new ValidationError("effort must be between 0 and 6");
    }
  }

  if (options.animationQuality !== undefined) {
    if (options.animationQuality < 1 || options.animationQuality > 100) {
      throw new ValidationError("animationQuality must be between 1 and 100");
    }
  }

  if (options.animationCompression !== undefined) {
    if (options.animationCompression < 0 || options.animationCompression > 6) {
      throw new ValidationError("animationCompression must be between 0 and 6");
    }
  }

  if (options.maxFileSize !== undefined && options.maxFileSize < 0) {
    throw new ValidationError("maxFileSize must be non-negative");
  }

  if (options.skipIfSmaller !== undefined && options.skipIfSmaller < 0) {
    throw new ValidationError("skipIfSmaller must be non-negative");
  }

  if (options.maxWidth !== undefined && options.maxWidth < 0) {
    throw new ValidationError("maxWidth must be non-negative");
  }

  if (options.maxHeight !== undefined && options.maxHeight < 0) {
    throw new ValidationError("maxHeight must be non-negative");
  }

  if (options.concurrentImages !== undefined && options.concurrentImages < 1) {
    throw new ValidationError("concurrentImages must be at least 1");
  }
}

export function getDefaultOptions(): Required<AnimatedWebpOptimizerOptions> {
  return {
    quality: 80,
    effort: 4,
    verbose: false,
    maxFileSize: 0,
    skipIfSmaller: 0,
    animationQuality: 80,
    animationCompression: 4,
    optimizeAnimation: true,
    maxWidth: 0,
    maxHeight: 0,
    concurrentImages: 5,
  };
}

export function mergeOptions(
  options: AnimatedWebpOptimizerOptions = {}
): Required<AnimatedWebpOptimizerOptions> {
  const defaults = getDefaultOptions();
  return { ...defaults, ...options };
}
