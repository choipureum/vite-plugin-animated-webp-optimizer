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
      // Vite 설정에서 outDir 가져오기
      buildOutputDir = config.build.outDir || "dist";
      mergedOptions.outDir = buildOutputDir;
    },
    async generateBundle(options, bundle) {
      if (mergedOptions.verbose) {
        console.log(`[${PLUGIN_NAME}] Analyzing bundle for WebP files...`);
      }

      // bundle에서 WebP 파일들을 찾아서 해시 매핑 생성
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

      // 해시 매핑 정보를 옵션에 저장
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

    // WebP 파일인지 확인
    if (fileName.toLowerCase().endsWith(".webp")) {
      // sourcePath를 안전하게 문자열로 변환
      let sourcePath: string;
      if (asset.source) {
        // Buffer인 경우 fileName을 사용, 문자열인 경우 그대로 사용
        sourcePath = typeof asset.source === 'string' ? asset.source : fileName;
      } else if (asset.fileName) {
        sourcePath = asset.fileName;
      } else {
        sourcePath = fileName;
      }

      const outputPath = path.join(outDir, fileName);

      webpAssets.push({
        sourcePath,
        fileName,
        outputPath,
        size: asset.size || 0,
        isAnimated: false, // 나중에 detectAnimatedWebP로 확인
      });
    }
  }

  return webpAssets;
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

    // bundle에서 찾은 WebP 파일들이 있으면 그것들을 사용, 없으면 전체 스캔
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
      // 프로젝트 루트부터 모든 폴더를 재귀적으로 검색
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
