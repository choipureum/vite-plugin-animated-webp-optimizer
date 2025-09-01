# Vite Plugin Animated WebP Optimizer

A Vite plugin that automatically optimizes animated WebP files to reduce file size while preserving animation integrity and frame positions.

## ✨ Key Features

- 🎬 **Animated WebP Support**: High-quality animation optimization using Sharp's `animated: true` option
- 📦 **Automatic Optimization**: Automatically detects and optimizes WebP files during build
- 🎯 **Smart Detection**: Automatically distinguishes between animated and static WebP files
- 🔧 **Flexible Configuration**: Various options for quality, compression, file size limits, etc.
- 📊 **Detailed Logging**: Comprehensive logging of optimization process and results
- 🚀 **Frame Position Preservation**: Maintains exact frame positions and timing from original animation

## 🚀 Installation

```bash
npm install vite-plugin-animated-webp-optimizer
```

## 📖 Usage

### Basic Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import animatedWebpOptimizer from "vite-plugin-animated-webp-optimizer";

export default defineConfig({
  plugins: [
    animatedWebpOptimizer({
      verbose: true, // Enable detailed logging
    }),
  ],
});
```

### Advanced Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import animatedWebpOptimizer from "vite-plugin-animated-webp-optimizer";

export default defineConfig({
  plugins: [
    animatedWebpOptimizer({
      quality: 85, // Static WebP quality (1-100)
      effort: 6, // Compression effort (0-6, higher = more compression)
      verbose: true, // Detailed logging
      maxFileSize: 400 * 1024, // Maximum file size (400KB)
      skipIfSmaller: 100 * 1024, // Skip if smaller than 100KB
      animationQuality: 70, // Animated WebP quality (1-100)
      animationCompression: 6, // Animated WebP compression (0-6)
      optimizeAnimation: true, // Enable animation optimization
      maxWidth: 0, // Maximum width for resizing (0 = no resize)
      maxHeight: 0, // Maximum height for resizing (0 = no resize)
      concurrentImages: 5, // Number of concurrent images to process
    }),
  ],
});
```

## ⚙️ Options

| Option                 | Type    | Default | Description                                         |
| ---------------------- | ------- | ------- | --------------------------------------------------- |
| `quality`              | number  | 80      | Static WebP quality (1-100)                         |
| `effort`               | number  | 4       | Compression effort (0-6)                            |
| `verbose`              | boolean | false   | Enable detailed logging                             |
| `maxFileSize`          | number  | 0       | Maximum file size in bytes (0 = no limit)           |
| `skipIfSmaller`        | number  | 0       | Skip optimization if file is smaller than this size |
| `animationQuality`     | number  | 80      | Animated WebP quality (1-100)                       |
| `animationCompression` | number  | 4       | Animated WebP compression level (0-6)               |
| `optimizeAnimation`    | boolean | true    | Enable animation optimization                       |
| `maxWidth`             | number  | 0       | Maximum width for resizing (0 = no resize)          |
| `maxHeight`            | number  | 0       | Maximum height for resizing (0 = no resize)         |
| `concurrentImages`     | number  | 5       | Number of concurrent images to process              |

## 🎯 Performance Examples

### Animated WebP Optimization

- **Original**: 744 KB (96 frames, 360x240)
- **Optimized**: 488 KB
- **Savings**: **34.5%** (256 KB reduction)

### Optimization Process

1. **Animation Detection**: Uses Sharp's `animated: true` option to detect animated WebP files
2. **Metadata Analysis**: Extracts frame count, dimensions, timing, and loop information
3. **Direct Optimization**: Sharp processes the animated WebP directly while preserving animation structure
4. **Structure Preservation**: Maintains exact frame positions, timing, and animation properties

## 🔧 Requirements

- Node.js 16+
- Vite 4+
- Sharp library

### Sharp Installation

```bash
npm install sharp
```

## 📁 File Structure

```
your-project/
├── public/
│   └── animation.webp    # Original animated WebP
├── dist/
│   └── animation.webp    # Optimized animated WebP
├── vite.config.ts
└── package.json
```

## 🎬 How It Works

### Animation Detection

The plugin uses Sharp's `animated: true` option to detect animated WebP files:

```typescript
const sharpImage = sharp(filePath, { animated: true, pages: -1 });
const metadata = await sharpImage.metadata();
const isAnimated = metadata.pages && metadata.pages > 1;
```

### Animation Optimization

For animated WebP files, the plugin:

1. Preserves original animation structure using Sharp's built-in animation support
2. Applies quality and compression settings while maintaining frame integrity
3. Preserves loop count, frame delays, and other animation properties

### Static WebP Optimization

For static WebP files, standard Sharp optimization is applied.

## 🚨 Important Notes

- **Frame Position Preservation**: This plugin maintains exact frame positions and timing from the original animation
- **No Frame Extraction**: Unlike other solutions, this plugin doesn't extract and recombine frames, ensuring perfect animation integrity
- **Sharp Native Support**: Leverages Sharp's native animated WebP support for optimal results
- **Fallback Handling**: If optimization fails, the original file is copied to maintain functionality

## 🔍 Technical Details

### Robert Michalski Method

This plugin implements the approach described in [Robert Michalski's blog](https://www.robert-michalski.com/nodejs-resize-and-convert-animated-gif-webp-images) for handling animated images with Sharp:

```typescript
// Key implementation
const sharpImage = sharp(inputPath, { animated: true, pages: -1 });
const metadata = await sharpImage.metadata();

// Preserve original structure
await processedImage
  .webp({
    quality: animationQuality,
    effort: animationCompression,
    loop: typeof loop === "number" && loop >= 0 ? loop : 0,
    delay: delay || undefined,
    force: true,
  })
  .toFile(outputPath);
```

### Why This Approach Works

- **Direct Processing**: Sharp processes the animated WebP directly without frame extraction
- **Structure Preservation**: All animation metadata (frames, timing, positions) is automatically preserved
- **Performance**: No need for external tools like webpmux
- **Reliability**: Leverages Sharp's battle-tested image processing capabilities

## 🤝 Contributing

Bug reports, feature suggestions, and pull requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing library
- [WebP](https://developers.google.com/speed/webp) - Google's WebP format
- [Vite](https://vitejs.dev/) - Fast frontend build tool
- [Robert Michalski](https://www.robert-michalski.com/nodejs-resize-and-convert-animated-gif-webp-images) - For the animated image optimization approach
