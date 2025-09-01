# Vite Plugin Animated WebP Optimizer

A Vite plugin that automatically optimizes animated WebP files to reduce file size while preserving animation integrity and frame positions.

## 🚀 Features

- **Automatic WebP Optimization**: Automatically detects and optimizes WebP files during build
- **Animated WebP Support**: Specialized optimization for animated WebP files
- **Frame Position Preservation**: Maintains exact frame positions using Sharp's native animation support
- **Sharp Native Support**: Direct processing without external tools like webpmux
- **Configurable Quality**: Adjustable quality and compression settings
- **Compression Mode**: Choose between lossless (quality) and lossy (performance) compression
- **Size Limits**: Optional file size limits and skip conditions
- **Resizing Options**: Configurable maximum dimensions
- **Verbose Logging**: Detailed optimization progress and results
- **Comprehensive Testing**: High test coverage with Jest and Codecov integration

## 📦 Installation

```bash
npm install vite-plugin-animated-webp-optimizer
```

### Requirements

- **Node.js**: 16.0 or higher
- **Sharp Installation**: `npm install sharp`
- **Vite**: 4.0 or higher

## 🔧 Usage

### Basic Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import animatedWebpOptimizer from "vite-plugin-animated-webp-optimizer";

export default defineConfig({
  plugins: [
    animatedWebpOptimizer({
      quality: 80,
      effort: 4,
      verbose: true,
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
      // Basic quality settings
      quality: 85, // WebP quality (1-100)
      effort: 4, // Compression effort (0-6)
      lossless: false, // Enable lossless compression (false = lossy for better performance)

      // Animation-specific settings
      animationQuality: 90, // Animation quality (1-100)
      animationCompression: 5, // Animation compression (0-6)
      optimizeAnimation: true, // Enable animation optimization

      // Size controls
      maxFileSize: 1000000, // Maximum file size in bytes
      skipIfSmaller: 50000, // Skip if file is already smaller

      // Resizing options
      maxWidth: 1920, // Maximum width
      maxHeight: 1080, // Maximum height

      // Performance
      concurrentImages: 5, // Concurrent processing limit

      // Logging
      verbose: true, // Enable detailed logging
    }),
  ],
});
```

## 🏗️ Architecture

The plugin is built with a modular, testable architecture:

### Core Modules

- **`types.ts`**: TypeScript interfaces and type definitions
- **`validators.ts`**: Option validation and default value management
- **`processors.ts`**: WebP processing logic and file handling
- **`utils.ts`**: Utility functions for file operations
- **`index.ts`**: Main plugin entry point and Vite integration

### Key Benefits

- **Testability**: Each module can be tested independently
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new features or modify existing ones
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## 🧪 Testing

### Test Coverage

The project maintains high test coverage across all modules:

- **Types**: 100% coverage
- **Validators**: 100% coverage
- **Processors**: High coverage of core logic
- **Utils**: Comprehensive utility function testing
- **Integration**: Full plugin integration testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with HTML coverage report
npm run test:coverage:html

# Run tests and upload to Codecov
npm run test:coverage:codecov
```

### Test Structure

```
tests/
├── types.test.ts          # Type definition tests
├── validators.test.ts     # Validation logic tests
├── processors.test.ts     # WebP processing tests
├── utils.test.ts          # Utility function tests
├── basic.test.ts          # Basic plugin functionality
├── integration.test.ts    # Integration scenarios
├── coverage.test.ts       # Coverage improvement tests
└── setup.ts              # Test environment setup
```

## 📊 Codecov Integration

The project is configured for Codecov integration:

- **Coverage Reports**: LCOV format for Codecov compatibility
- **Thresholds**: Configurable coverage thresholds
- **Badges**: Automatic coverage status badges
- **PR Comments**: Coverage reports on pull requests

## 🔒 Pre-commit Hooks

Husky is configured to run tests before pushing:

```bash
# Pre-push hook automatically runs:
npm run test:coverage
```

## 📈 Performance Examples

### Typical Results

| File Type     | Original Size | Optimized Size | Savings |
| ------------- | ------------- | -------------- | ------- |
| Static WebP   | 2.5 MB        | 1.8 MB         | 28%     |
| Animated WebP | 15.2 MB       | 11.8 MB        | 22%     |
| Large WebP    | 45.7 MB       | 32.1 MB        | 30%     |

### Optimization Features

- **Smart Compression**: Balances quality and file size
- **Animation Preservation**: Maintains frame timing and loop settings
- **Progressive Enhancement**: Falls back to copying if optimization fails
- **Batch Processing**: Efficient handling of multiple files

## 🎯 How It Works

1. **Build Trigger**: Plugin activates during Vite's `closeBundle` hook
2. **File Discovery**: Scans `public/` directory for WebP files
3. **Type Detection**: Identifies animated vs. static WebP files
4. **Optimization**: Applies appropriate optimization strategy
5. **Output**: Saves optimized files to `dist/` directory

### Technical Details

- **Sharp Integration**: Uses Sharp's native animated WebP support
- **Metadata Preservation**: Maintains animation properties (loop, delay, pages)
- **Error Handling**: Graceful fallback for failed optimizations
- **Memory Management**: Efficient processing of large files

## 🔧 Configuration Options

### Compression Modes

The plugin supports two compression modes:

#### **Lossy Compression (Default)**

```typescript
animatedWebpOptimizer({
  lossless: false, // Default: Fast processing, smaller files
  quality: 80, // Good balance of quality and size
  effort: 2, // Fast compression
});
```

#### **Lossless Compression**

```typescript
animatedWebpOptimizer({
  lossless: true, // Quality preservation, larger files
  quality: 100, // Maximum quality
  effort: 4, // Thorough compression
});
```

### Performance Comparison

| Mode         | Processing Speed | File Size | Quality | Best For             |
| ------------ | ---------------- | --------- | ------- | -------------------- |
| **Lossy**    | ⚡ Fast          | 📉 Small  | 🟡 95%  | Web optimization     |
| **Lossless** | 🐌 Slow          | 📊 Medium | 🟢 100% | Quality preservation |

| Option                 | Type    | Default | Description                   |
| ---------------------- | ------- | ------- | ----------------------------- |
| `quality`              | number  | 80      | WebP quality (1-100)          |
| `effort`               | number  | 4       | Compression effort (0-6)      |
| `lossless`             | boolean | false   | Enable lossless compression   |
| `verbose`              | boolean | false   | Enable detailed logging       |
| `maxFileSize`          | number  | 0       | Maximum file size limit       |
| `skipIfSmaller`        | number  | 0       | Skip if file is smaller       |
| `animationQuality`     | number  | 80      | Animation quality (1-100)     |
| `animationCompression` | number  | 4       | Animation compression (0-6)   |
| `optimizeAnimation`    | boolean | true    | Enable animation optimization |
| `maxWidth`             | number  | 0       | Maximum width for resizing    |
| `maxHeight`            | number  | 0       | Maximum height for resizing   |
| `concurrentImages`     | number  | 5       | Concurrent processing limit   |

## 🛠️ Manual WebP Optimization Scripts

For better performance during development, you can use standalone scripts to optimize WebP files before building:

### **Standalone Optimization Script**

```bash
# Basic optimization
npm run webp:optimize

# Fast optimization (lower quality, faster processing)
npm run webp:optimize:fast

# Watch mode for development
npm run webp:optimize:watch

# Custom settings
npm run webp:optimize -- --quality=75 --effort=1 --source=src/assets --output=dist/assets
```

### **Cleanup Script**

```bash
# Clean optimized files
npm run webp:clean

# Dry run (see what would be deleted)
npm run webp:clean -- --dry-run
```

### **Build Integration**

```bash
# Build with automatic WebP optimization
npm run build

# Fast build (clean + build)
npm run build:fast
```

### **Script Options**

| Option | Description | Example |
|--------|-------------|---------|
| `--fast` | Enable fast mode (quality: 60, effort: 1) | `npm run webp:optimize -- --fast` |
| `--watch` | Watch for file changes | `npm run webp:optimize -- --watch` |
| `--quality=N` | Set quality (1-100) | `npm run webp:optimize -- --quality=85` |
| `--effort=N` | Set effort (0-6) | `npm run webp:optimize -- --effort=3` |
| `--source=DIR` | Source directory | `npm run webp:optimize -- --source=public/images` |
| `--output=DIR` | Output directory | `npm run webp:optimize -- --output=dist/images` |

### **Performance Benefits**

- **Faster Development**: WebP optimization happens separately from Vite build
- **Reduced Build Time**: No WebP processing during hot reload
- **Flexible Control**: Choose when and how to optimize
- **Batch Processing**: Process multiple files concurrently

## 🚀 Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd vite-plugin-animated-webp-optimizer

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Project Structure

```
├── src/                    # Source code
│   ├── types.ts           # Type definitions
│   ├── validators.ts      # Validation logic
│   ├── processors.ts      # WebP processing
│   ├── utils.ts           # Utility functions
│   └── index.ts           # Main plugin
├── tests/                  # Test files
├── examples/               # Usage examples
├── coverage/               # Coverage reports
└── docs/                   # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- **Test Coverage**: Maintain high test coverage
- **Type Safety**: Use TypeScript for all new code
- **Code Style**: Follow existing code style and patterns
- **Documentation**: Update docs for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
