import { defineConfig } from "vite";
import dynamicWebpOptimizer from "../src/index";

export default defineConfig({
  plugins: [
    dynamicWebpOptimizer({
      quality: 85, // 일반 WebP 품질
      effort: 6, // 최대 압축 노력
      verbose: true, // 상세 로그
      maxFileSize: 400 * 1024, // 400KB 제한 (더 엄격하게)
      skipIfSmaller: 100 * 1024, // 100KB 이하면 스킵
      animationQuality: 70, // 애니메이션 품질 (더 낮춤)
      animationCompression: 6, // 최대 압축
      optimizeAnimation: true, // 애니메이션 최적화 활성화
    }),
  ],
  build: {
    outDir: "dist",
  },
});
