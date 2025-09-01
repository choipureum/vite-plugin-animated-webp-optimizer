import { Plugin } from "vite";
import * as path from "path";
import { AnimatedWebpOptimizerOptions, WebPAsset } from "./types";
import { validateOptions, mergeOptions } from "./validators";
import { WebPProcessor } from "./processors";

const PLUGIN_NAME = "vite-plugin-animated-webp-optimizer";

export default function animatedWebpOptimizer(
  options: AnimatedWebpOptimizerOptions = {}
): Plugin {
  validateOptions(options);
  const mergedOptions = mergeOptions(options);
  let buildOutputDir = "dist";

  return {
    name: PLUGIN_NAME,
    configResolved(config) {
      buildOutputDir = config.build.outDir || "dist";
      mergedOptions.outDir = buildOutputDir;
    },
    async generateBundle(options, bundle) {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Analyzing bundle for WebP files...`);
      }

      const webpAssets = findWebpAssets(bundle, buildOutputDir);

      if (webpAssets.length === 0) {
        if (mergedOptions.verbose) {
          console.log(`[${PLUGIN_NAME}] No WebP files found in bundle.`);
        }
        return;
      }

      if (mergedOptions.verbose) {
        console.log(
          `[${PLUGIN_NAME}] Found ${webpAssets.length} WebP files in bundle.`
        );
      }

      mergedOptions.webpAssets = webpAssets;
    },
    async closeBundle() {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Starting WebP optimization...`);
      }

      await processBundleFiles(mergedOptions);

      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Build completed.`);
      }
    },
  };
}

function findWebpAssets(bundle: any, outDir: string): WebPAsset[] {
  const webpAssets: WebPAsset[] = [];

  for (const fileName in bundle) {
    const asset = bundle[fileName];

    if (fileName.toLowerCase().endsWith(".webp")) {
      let sourcePath: string;
      if (asset.source) {
        if (typeof asset.source === "string") {
          if (asset.source.startsWith("assets/")) {
            const pathParts = asset.source.split("/");
            const fileName = pathParts[pathParts.length - 1];
            sourcePath = path.resolve(
              process.cwd(),
              outDir,
              "assets",
              fileName
            );
          } else if (asset.source.startsWith("./")) {
            sourcePath = path.resolve(process.cwd(), asset.source);
          } else {
            sourcePath = asset.source;
          }
        } else {
          sourcePath = path.resolve(process.cwd(), outDir, fileName);
        }
      } else if (asset.fileName) {
        sourcePath = path.resolve(process.cwd(), outDir, asset.fileName);
      } else {
        sourcePath = path.resolve(process.cwd(), outDir, fileName);
      }

      const tempDir = path.join(outDir, ".temp_webp_optimization", "assets");
      const outputPath = path.join(tempDir, fileName);

      webpAssets.push({
        sourcePath,
        fileName,
        outputPath,
        tempDir,
        size: asset.size || 0,
        isAnimated: false,
      });
    }
  }

  return webpAssets;
}

export async function processBundleFiles(options: any) {
  const projectRoot = process.cwd();
  const distDir = path.resolve(options.outDir || "dist");

  if (!distDir) {
    if (options.verbose) {
      console.log(
        `[vite-plugin-animated-webp-optimizer] Output directory not found, skipping`
      );
    }
    return;
  }

  try {
    const processor = new WebPProcessor(options);

    if (options.webpAssets && options.webpAssets.length > 0) {
      if (options.verbose) {
        console.log(
          `[${PLUGIN_NAME}] Processing ${options.webpAssets.length} WebP files from bundle...`
        );
      }
      await processor.processBundleAssets(options.webpAssets, distDir);
    } else {
      if (options.verbose) {
        console.log(
          `[${PLUGIN_NAME}] No bundle assets found, scanning all directories...`
        );
      }
      
      await processor.processDirectory(projectRoot, distDir);
    }

    if (options.verbose) {
      console.log(
        `[${PLUGIN_NAME}] Build completed. Output directory: ${distDir}`
      );
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
