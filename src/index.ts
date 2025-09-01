import { Plugin } from "vite";
import * as path from "path";
import { AnimatedWebpOptimizerOptions } from './types';
import { validateOptions, mergeOptions } from './validators';
import { WebPProcessor } from './processors';

const PLUGIN_NAME = "vite-plugin-animated-webp-optimizer";

export default function animatedWebpOptimizer(
  options: AnimatedWebpOptimizerOptions = {}
): Plugin {
  // Validate and merge options
  validateOptions(options);
  const mergedOptions = mergeOptions(options);

  return {
    name: PLUGIN_NAME,
    async closeBundle() {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Processing bundle files...`);
      }

      await processBundleFiles();

      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Build completed.`);
      }
    },
  };

  async function processBundleFiles() {
    const publicDir = path.resolve("public");
    const distDir = path.resolve("dist");

    if (!publicDir || !distDir) {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Required directories not found, skipping`);
      }
      return;
    }

    try {
      const processor = new WebPProcessor(mergedOptions);
      await processor.processDirectory(publicDir, distDir);
    } catch (error) {
      if (mergedOptions.verbose) {
        console.error(`[${PLUGIN_NAME}] Error processing files:`, error);
      }
    }
  }
}
