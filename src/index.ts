import { Plugin } from "vite";
import * as path from "path";
import { AnimatedWebpOptimizerOptions } from "./types";
import { validateOptions, mergeOptions } from "./validators";
import { WebPProcessor } from "./processors";

const PLUGIN_NAME = "vite-plugin-animated-webp-optimizer";

export default function animatedWebpOptimizer(
  options: AnimatedWebpOptimizerOptions = {}
): Plugin {
  validateOptions(options);
  const mergedOptions = mergeOptions(options);

  return {
    name: PLUGIN_NAME,
    async closeBundle() {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Processing bundle files...`);
      }

      await processBundleFiles(mergedOptions);

      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Build completed.`);
      }
    },
  };
}

export async function processBundleFiles(options: any) {
  const publicDir = path.resolve("public");
  const distDir = path.resolve("dist");

  if (!publicDir || !distDir) {
    if (options.verbose) {
      console.log(
        `[vite-plugin-animated-webp-optimizer] Required directories not found, skipping`
      );
    }
    return;
  }

  try {
    const processor = new WebPProcessor(options);
    await processor.processDirectory(publicDir, distDir);

    if (options.verbose) {
      console.log(`[vite-plugin-animated-webp-optimizer] Build completed.`);
    }
  } catch (error) {
    if (options.verbose) {
      console.error(
        `[vite-plugin-animated-webp-optimizer] Error processing files:`,
        error
      );
    }
  }
}
