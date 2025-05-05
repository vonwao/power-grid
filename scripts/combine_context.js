const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to read filesets from _filesets.js
function getFilesets() {
  try {
    const filesetPath = path.join(process.cwd(), '_filesets.js');
    if (!fs.existsSync(filesetPath)) {
      // Create a default _filesets.js if it doesn't exist
      const defaultFilesets = `module.exports = {
  "default": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
};`;
      fs.writeFileSync(filesetPath, defaultFilesets, 'utf8');
      return require('./_filesets.js');
    }
    
    delete require.cache[require.resolve('./_filesets.js')];
    return require('./_filesets.js');
  } catch (error) {
    return {};
  }
}

// Function to count tokens
function countTokens(text) {
  return text.split(/\s+/).length;
}

// Main function
function combineFiles() {
  const filesets = getFilesets();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\nUsage: node combine_context.js <fileset|directory>');
    console.log('       node combine_context.js "directory/**" (use quotes)');
    if (Object.keys(filesets).length > 0) {
      console.log('\nAvailable filesets:', Object.keys(filesets).join(', '));
    }
    console.log('\nTo get ALL files in a directory recursively, use: pages');
    console.log('To use a pattern, enclose in quotes: "pages/**"');
    return;
  }
  
  let target = args[0];
  let relevantFiles = [];
  let outputName = target;
  
  // Check if target is a fileset
  if (filesets[target]) {
    for (const item of filesets[target]) {
      const files = glob.sync(item, { nodir: true });
      relevantFiles = relevantFiles.concat(files);
    }
  } else {
    // Treat as directory or pattern
    if (args.length > 1) {
      // Shell expanded the pattern, collect all arguments as files
      relevantFiles = args;
      target = 'expanded_pattern';
      outputName = 'combined_files';
    } else {
      // Single argument - check if directory
      try {
        const stats = fs.statSync(target);
        if (stats.isDirectory()) {
          // Search directory recursively
          relevantFiles = glob.sync(`${target}/**`, { nodir: true });
          outputName = target;
        } else {
          relevantFiles = [target];
        }
      } catch (e) {
        // Not a file/directory, try as glob pattern
        relevantFiles = glob.sync(target, { nodir: true });
        outputName = target.replace(/[^a-zA-Z0-9]/g, '_');
      }
    }
  }
  
  relevantFiles = [...new Set(relevantFiles)]; // Remove duplicates
  
  // Log file list
  console.log(`\nfiles: ${relevantFiles.map(f => path.basename(f)).join(', ')} (total: ${relevantFiles.length})`);
  
  let combinedContent = `PROCESSING: ${target}\n\n`;
  
  // Process each file
  for (const file of relevantFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      combinedContent += `====== ${file} ======\n\n${content}\n\n\n`;
    } catch (error) {
      combinedContent += `====== ${file} ======\n\nERROR: ${error.message}\n\n\n`;
    }
  }
  
  // Calculate statistics
  const tokenCount = countTokens(combinedContent);
  const contextWindowSize = 200000;
  const percentageUsed = ((tokenCount / contextWindowSize) * 100).toFixed(2);
  
  // Create output filename - replace any problematic characters
  const cleanOutputName = outputName.replace(/[^a-zA-Z0-9]/g, '_');
  const outputPath = path.join(process.cwd(), `output_${cleanOutputName}.txt`);
  fs.writeFileSync(outputPath, combinedContent, 'utf8');
  
  // Display summary
  console.log(`\nOutput: ${outputPath}`);
  console.log(`Token count: ${tokenCount.toLocaleString()}`);
  console.log(`Context window: ${percentageUsed}% of 200K`);
  console.log(`\nTo copy to clipboard:`);
  console.log(`  macOS: pbcopy < "${outputPath}"`);
  console.log(`  Linux: xclip -selection clipboard < "${outputPath}"`);
  console.log(`  Windows: clip < "${outputPath}"`);
}

// Execute
combineFiles();