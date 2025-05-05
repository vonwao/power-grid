const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to read filesets from _filesets.js
function getFilesets() {
  try {
    const filesetPath = path.join(process.cwd(), '_filesets.js');
    if (!fs.existsSync(filesetPath)) {
      return {};
    }
    
    // Dynamically import the filesets
    delete require.cache[require.resolve('./_filesets.js')];
    return require('./_filesets.js');
  } catch (error) {
    return {};
  }
}

// Function to expand file patterns
function expandFilePattern(pattern) {
  const fullPath = path.join(process.cwd(), pattern);
  
  if (pattern.includes('**')) {
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
function combineFiles(target) {
  const filesets = getFilesets();
  
  if (!target) {
    console.log('\nUsage: node combine_context.js <fileset|directory>');
    if (Object.keys(filesets).length > 0) {
      console.log('Available filesets:', Object.keys(filesets).join(', '));
    } else {
      console.log('No filesets found in _filesets.js');
    }
    return;
  }
  
  let relevantFiles = [];
  let isDirectory = false;
  
  // Check if target is a fileset
  if (filesets[target]) {
    // Expand the fileset
    for (const item of filesets[target]) {
      relevantFiles = relevantFiles.concat(expandFilePattern(item));
    }
  } else {
    // Treat as directory
    relevantFiles = expandFilePattern(target);
    isDirectory = true;
  }
  
  relevantFiles = [...new Set(relevantFiles)]; // Remove duplicates
  
  // Log file list
  console.log(`\nfiles: ${relevantFiles.map(f => path.basename(f)).join(', ')} (total: ${relevantFiles.length})`);
  
  let combinedContent = `${isDirectory ? 'DIRECTORY' : 'FILESET'}: ${target}\n\n`;
  
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
  const outputPath = path.join(process.cwd(), `output_${target.replace(/\//g, '_')}.txt`);
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
const target = process.argv[2];
combineFiles(target);