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
    configResolved(config) {
      // Vite 설정에서 outDir 가져오기
      mergedOptions.outDir = config.build.outDir || 'dist';
    },
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
  const projectRoot = process.cwd(); // 프로젝트 루트 디렉토리
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

    // 프로젝트 루트부터 모든 폴더를 재귀적으로 검색
    await processor.processDirectory(projectRoot, distDir);

    if (options.verbose) {
      console.log(`[${PLUGIN_NAME}] Build completed. Output directory: ${distDir}`);
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
