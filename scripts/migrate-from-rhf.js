#!/usr/bin/env node

/**
 * This script helps migrate from react-hook-form to our custom form implementation
 * by scanning the codebase for react-hook-form imports and suggesting replacements.
 * 
 * Usage: node scripts/migrate-from-rhf.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Map of react-hook-form types to our custom types
const typeMap = {
  'RegisterOptions': 'ValidationOptions',
  'FieldError': 'FieldError',
  'FieldValues': 'FieldValues',
  'FieldPath': 'FieldPath',
  'UseFormReturn': 'FormMethods',
  'FormState': 'FormState'
};

// Directories to scan
const dirsToScan = [
  'components',
  'pages'
];

// File extensions to scan
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Files to ignore
const ignoreFiles = [
  'node_modules',
  '.next',
  'build',
  'dist',
  '.git'
];

// Find all files recursively
async function findFiles(dir) {
  const files = [];
  
  async function scan(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      // Skip ignored directories
      if (ignoreFiles.some(ignore => fullPath.includes(ignore))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

// Scan a file for react-hook-form imports
async function scanFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  
  // Look for import statements from react-hook-form
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('from \'react-hook-form\'') || line.includes('from "react-hook-form"')) {
      // Extract imported types
      const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]react-hook-form['"]/);
      
      if (importMatch && importMatch[1]) {
        const importedTypes = importMatch[1].split(',').map(t => t.trim());
        const replacements = [];
        
        for (const type of importedTypes) {
          // Check if we have a replacement for this type
          const baseType = type.split(' as ')[0].trim();
          if (typeMap[baseType]) {
            replacements.push({
              original: type,
              replacement: type.replace(baseType, typeMap[baseType])
            });
          }
        }
        
        if (replacements.length > 0) {
          results.push({
            line: i + 1,
            original: line,
            replacements,
            suggestedLine: line.replace(
              /from\s+['"]react-hook-form['"]/,
              'from \'../../../types/form\''
            )
          });
        }
      }
    }
  }
  
  return { filePath, results };
}

// Main function
async function main() {
  console.log('Scanning codebase for react-hook-form imports...\n');
  
  let allFiles = [];
  
  // Find all files in specified directories
  for (const dir of dirsToScan) {
    const files = await findFiles(dir);
    allFiles = [...allFiles, ...files];
  }
  
  console.log(`Found ${allFiles.length} files to scan.\n`);
  
  // Scan each file
  const results = [];
  for (const file of allFiles) {
    const fileResults = await scanFile(file);
    if (fileResults.results.length > 0) {
      results.push(fileResults);
    }
  }
  
  // Print results
  if (results.length === 0) {
    console.log('No react-hook-form imports found.');
    return;
  }
  
  console.log(`Found react-hook-form imports in ${results.length} files:\n`);
  
  for (const { filePath, results } of results) {
    console.log(`\x1b[1m${filePath}\x1b[0m`);
    
    for (const result of results) {
      console.log(`  Line ${result.line}: ${result.original.trim()}`);
      console.log(`  Suggested: ${result.suggestedLine.trim()}`);
      console.log(`  Types to replace:`);
      
      for (const { original, replacement } of result.replacements) {
        console.log(`    ${original} -> ${replacement}`);
      }
      
      console.log('');
    }
    
    console.log('');
  }
  
  console.log('Migration steps:');
  console.log('1. Replace imports as suggested above');
  console.log('2. Update any usage of react-hook-form hooks with our custom hooks');
  console.log('3. Run tests to ensure everything works correctly');
}

main().catch(console.error);
