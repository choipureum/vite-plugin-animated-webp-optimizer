#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  outputDir: 'public/assets/optimized',
  dryRun: false
};

// Parse command line arguments
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg === '--dry-run') config.dryRun = true;
  if (arg.startsWith('--output=')) config.outputDir = arg.split('=')[1];
});

console.log('🧹 WebP Cleanup Script');
console.log(`📁 Target: ${config.outputDir}`);
console.log(`🔍 Mode: ${config.dryRun ? 'Dry Run (no files deleted)' : 'Live (files will be deleted)'}`);
console.log('');

// Check if directory exists
if (!fs.existsSync(config.outputDir)) {
  console.log(`✅ Output directory doesn't exist: ${config.outputDir}`);
  return;
}

// Count files and calculate total size
function analyzeDirectory(dir) {
  let fileCount = 0;
  let totalSize = 0;
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        fileCount++;
        totalSize += stat.size;
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return { fileCount, totalSize, files };
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
function main() {
  console.log('🔍 Analyzing directory...');
  
  const { fileCount, totalSize, files } = analyzeDirectory(config.outputDir);
  
  if (fileCount === 0) {
    console.log('✅ Directory is already empty');
    return;
  }
  
  console.log(`📊 Found ${fileCount} files (${formatBytes(totalSize)})`);
  console.log('');
  
  if (config.dryRun) {
    console.log('🔍 Files that would be deleted:');
    files.forEach(file => {
      const relativePath = path.relative(config.outputDir, file);
      const stats = fs.statSync(file);
      console.log(`   📄 ${relativePath} (${formatBytes(stats.size)})`);
    });
    
    console.log('');
    console.log('💡 Run without --dry-run to actually delete files');
  } else {
    console.log('🗑️  Deleting files...');
    
    let deletedCount = 0;
    let deletedSize = 0;
    
    files.forEach(file => {
      try {
        const stats = fs.statSync(file);
        fs.unlinkSync(file);
        
        const relativePath = path.relative(config.outputDir, file);
        console.log(`   ✅ Deleted: ${relativePath} (${formatBytes(stats.size)})`);
        
        deletedCount++;
        deletedSize += stats.size;
      } catch (error) {
        console.error(`   ❌ Failed to delete: ${path.relative(config.outputDir, file)} - ${error.message}`);
      }
    });
    
    // Try to remove empty directories
    try {
      fs.rmdirSync(config.outputDir);
      console.log(`   🗂️  Removed empty directory: ${config.outputDir}`);
    } catch (error) {
      // Directory might not be empty or might not exist
    }
    
    console.log('');
    console.log('📊 Cleanup Summary:');
    console.log('===================');
    console.log(`✅ Deleted: ${deletedCount} files`);
    console.log(`📉 Freed space: ${formatBytes(deletedSize)}`);
  }
}

// Run the script
main().catch(console.error);
