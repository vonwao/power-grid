const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to read filesets from _filesets.js
function getFilesets() {
  try {
    const filesetPath = path.join(process.cwd(), '_filesets.js');
    if (!fs.existsSync(filesetPath)) {
      // Create a minimal default _filesets.js file
      const defaultFilesets = `module.exports = {
  "default": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
};`;
      fs.writeFileSync(filesetPath, defaultFilesets, 'utf8');
    }
    
    // Dynamically import the filesets
    delete require.cache[require.resolve('./_filesets.js')];
    return require('./_filesets.js');
  } catch (error) {
    console.error(`Error loading filesets: ${error.message}`);
    return { default: [] };
  }
}

// Function to expand file patterns
function expandFilePattern(pattern) {
  const fullPath = path.join(process.cwd(), pattern);
  
  if (pattern.includes('*') || pattern.includes('**')) {
    const files = glob.sync(fullPath, { nodir: true });
    return files.map(file => path.relative(process.cwd(), file));
  }
  
  try {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath)
        .filter(file => fs.statSync(path.join(fullPath, file)).isFile())
        .map(file => path.join(pattern, file));
      return files;
    }
  } catch (error) {
    // Continue if file/directory doesn't exist
  }
  
  return [pattern];
}

// Function to count tokens (rough estimate)
function countTokens(text) {
  return text.split(/\s+/).length;
}

// Main function
function combineFiles(filesetName = 'default') {
  const filesets = getFilesets();
  
  if (!filesetName) {
    console.log('Available filesets:', Object.keys(filesets).join(', '));
    console.log('\nUsage: node combine_context.js [fileset-name]');
    return;
  }
  
  if (!filesets[filesetName]) {
    console.error(`Fileset "${filesetName}" not found. Available: ${Object.keys(filesets).join(', ')}`);
    return;
  }
  
  // Expand the fileset
  let relevantFiles = [];
  for (const item of filesets[filesetName]) {
    relevantFiles = relevantFiles.concat(expandFilePattern(item));
  }
  relevantFiles = [...new Set(relevantFiles)]; // Remove duplicates
  
  let combinedContent = `FILESET: ${filesetName}\n\n`;
  
  // Process each file
  for (const file of relevantFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContent += `====== ${file} ======\n\n${content}\n\n\n`;
    } catch (error) {
      combinedContent += `====== ${file} ======\n\nERROR: ${error.message}\n\n\n`;
    }
  }
  
  // Calculate statistics
  const tokenCount = countTokens(combinedContent);
  const contextWindowSize = 200000;
  const percentageUsed = ((tokenCount / contextWindowSize) * 100).toFixed(2);
  
  // Write output
  const outputPath = path.join(process.cwd(), `output_${filesetName}.txt`);
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
const filesetName = process.argv[2];
combineFiles(filesetName);