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

// Function to generate a simple ASCII histogram
function generateHistogram(data, buckets, metric) {
  // Group files into buckets
  const histogramData = Array(buckets).fill(0);
  const max = Math.max(...data.map(item => item.value));
  const bucketSize = max / buckets;
  
  data.forEach(item => {
    const bucketIndex = Math.min(Math.floor(item.value / bucketSize), buckets - 1);
    histogramData[bucketIndex]++;
  });
  
  // Find the max count for scaling
  const maxCount = Math.max(...histogramData);
  const scale = 20; // Max length of the bar
  
  // Generate histogram
  let histogram = `\nFile distribution by ${metric}:\n`;
  
  histogramData.forEach((count, i) => {
    const min = Math.round(i * bucketSize);
    const max = Math.round((i + 1) * bucketSize);
    const barLength = Math.round((count / maxCount) * scale);
    const bar = '█'.repeat(barLength);
    
    histogram += `${min.toString().padStart(6)} - ${max.toString().padEnd(6)}: ${bar} (${count})\n`;
  });
  
  return histogram;
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Function to format date/time without seconds
function formatDateTime(date) {
  const options = { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  };
  return date.toLocaleString(undefined, options);
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
  
  // Get file stats and sort by last modified
  const fileDetails = relevantFiles.map(file => {
    const stats = fs.statSync(file);
    return {
      path: file,
      size: stats.size,
      lines: fs.readFileSync(file, 'utf8').split('\n').length,
      mtime: stats.mtime
    };
  });
  
  // Sort files by last modified date (newest first)
  fileDetails.sort((a, b) => b.mtime - a.mtime);
  
  // Log file list
  console.log(`\nFound ${fileDetails.length} files (sorted by last modified)`);
  
  // Add timestamp to the output 
  const now = new Date();
  const formattedNow = formatDateTime(now);
  let combinedContent = `PROCESSING: ${target} (Generated: ${formattedNow})\n\n`;
  
  // Process each file
  for (const file of fileDetails) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const lastModified = formatDateTime(file.mtime);
      const fileSize = formatFileSize(file.size);
      const lineCount = file.lines;
      
      combinedContent += `====== ${file.path} ======\n`;
      combinedContent += `Last Modified: ${lastModified} | Size: ${fileSize} | Lines: ${lineCount}\n\n`;
      combinedContent += `${content}\n\n\n`;
    } catch (error) {
      combinedContent += `====== ${file.path} ======\n\nERROR: ${error.message}\n\n\n`;
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
  
  // Generate histograms
  const sizeData = fileDetails.map(file => ({ value: file.size }));
  const lineData = fileDetails.map(file => ({ value: file.lines }));
  
  const sizeHistogram = generateHistogram(sizeData, 5, 'file size');
  const lineHistogram = generateHistogram(lineData, 5, 'line count');
  
  // Display summary
  console.log(`\nOutput: ${outputPath}`);
  console.log(`Generated: ${formattedNow}`);
  console.log(`Token count: ${tokenCount.toLocaleString()}`);
  console.log(`Context window: ${percentageUsed}% of 200K`);
  
  // Display histograms
  console.log(sizeHistogram);
  console.log(lineHistogram);
  
  // Display file details
  console.log('\nFiles by last modified:');
  fileDetails.slice(0, 10).forEach(file => {
    console.log(`${formatDateTime(file.mtime)} | ${formatFileSize(file.size).padEnd(8)} | ${file.lines.toString().padEnd(5)} lines | ${path.basename(file.path)}`);
  });
  if (fileDetails.length > 10) {
    console.log(`... and ${fileDetails.length - 10} more files`);
  }
  
  console.log(`\nTo copy to clipboard:`);
  console.log(`  macOS: pbcopy < "${outputPath}"`);
  console.log(`  Linux: xclip -selection clipboard < "${outputPath}"`);
  console.log(`  Windows: clip < "${outputPath}"`);
}

// Execute
combineFiles();