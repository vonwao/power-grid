#!/usr/bin/env node

/**
 * This script helps fix unused variables by removing them from the code.
 * It parses ESLint output and applies fixes to the affected files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run ESLint and capture the output
function getLintResults() {
  try {
    const output = execSync('npx next lint --format json', { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    // ESLint will exit with code 1 if there are errors
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (e) {
        console.error('Failed to parse ESLint output:', e);
        return [];
      }
    }
    console.error('Failed to run ESLint:', error);
    return [];
  }
}

// Extract unused variable issues from ESLint results
function getUnusedVarIssues(results) {
  const issues = [];
  
  results.forEach(result => {
    const filePath = result.filePath;
    
    result.messages.forEach(message => {
      if (
        (message.ruleId === 'no-unused-vars' || message.ruleId === '@typescript-eslint/no-unused-vars') &&
        (message.message.includes('is defined but never used') ||
        message.message.includes('is assigned a value but never used'))
      ) {
        // Extract variable name from the message
        const match = message.message.match(/'([^']+)'/);
        if (match && match[1]) {
          const varName = match[1];
          
          issues.push({
            filePath,
            line: message.line,
            column: message.column,
            varName,
            message: message.message
          });
        }
      }
    });
  });
  
  // Group issues by file for more efficient processing
  const issuesByFile = {};
  issues.forEach(issue => {
    if (!issuesByFile[issue.filePath]) {
      issuesByFile[issue.filePath] = [];
    }
    issuesByFile[issue.filePath].push(issue);
  });
  
  return issuesByFile;
}

// Remove unused variables from code
function removeUnusedVars(issuesByFile) {
  const fixedFiles = new Set();
  
  for (const [filePath, issues] of Object.entries(issuesByFile)) {
    try {
      // Read the file content
      let fileContent = fs.readFileSync(filePath, 'utf8');
      let lines = fileContent.split('\n');
      
      // Sort issues by line number in descending order to avoid offset issues
      issues.sort((a, b) => b.line - a.line);
      
      for (const issue of issues) {
        const { line, varName } = issue;
        const lineContent = lines[line - 1];
        
        // Handle different patterns
        if (handleImportStatement(lines, line - 1, varName) ||
            handleDestructuring(lines, line - 1, varName) ||
            handleFunctionParams(lines, line - 1, varName) ||
            handleVariableDeclaration(lines, line - 1, varName)) {
          fixedFiles.add(filePath);
        }
      }
      
      // Write changes back to file
      if (fixedFiles.has(filePath)) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      }
    } catch (error) {
      console.error(`Failed to process file ${filePath}:`, error);
    }
  }
  
  return fixedFiles.size;
}

// Handle import statements (e.g., import { foo, bar } from 'module')
function handleImportStatement(lines, lineIndex, varName) {
  const line = lines[lineIndex];
  
  // Check if this is an import statement
  if (line.trim().startsWith('import ')) {
    // Named imports: import { foo, bar } from 'module'
    const namedImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from/;
    const namedMatch = line.match(namedImportRegex);
    
    if (namedMatch) {
      const importedItems = namedMatch[1].split(',').map(item => item.trim());
      const varIndex = importedItems.findIndex(item => {
        // Handle aliased imports: import { foo as bar } from 'module'
        const itemName = item.split(' as ')[0].trim();
        return itemName === varName;
      });
      
      if (varIndex !== -1) {
        // Remove the variable from the import list
        importedItems.splice(varIndex, 1);
        
        if (importedItems.length === 0) {
          // If no imports remain, remove the entire line
          lines.splice(lineIndex, 1);
        } else {
          // Update the import statement
          const newImport = line.replace(namedImportRegex, `import { ${importedItems.join(', ')} } from`);
          lines[lineIndex] = newImport;
        }
        return true;
      }
    }
    
    // Default import: import foo from 'module'
    const defaultImportRegex = new RegExp(`import\\s+${varName}\\s+from`);
    if (defaultImportRegex.test(line)) {
      // Remove the entire line for default imports
      lines.splice(lineIndex, 1);
      return true;
    }
  }
  
  return false;
}

// Handle destructuring assignments (e.g., const { foo, bar } = obj)
function handleDestructuring(lines, lineIndex, varName) {
  const line = lines[lineIndex];
  
  // Look for destructuring patterns
  const destructuringRegex = /(?:const|let|var)\s+\{\s*([^}]+)\s*\}\s*=/;
  const match = line.match(destructuringRegex);
  
  if (match) {
    const variables = match[1].split(',').map(v => v.trim());
    const varIndex = variables.findIndex(v => {
      // Handle aliased destructuring: const { foo: bar } = obj
      const parts = v.split(':');
      return parts.length > 1 ? parts[1].trim() === varName : v === varName;
    });
    
    if (varIndex !== -1) {
      // Remove the variable from the destructuring
      variables.splice(varIndex, 1);
      
      if (variables.length === 0) {
        // If no variables remain, try to remove the entire statement
        // This is complex and might need manual review
        console.log(`Warning: Empty destructuring in ${lines[lineIndex]}. Manual review recommended.`);
      } else {
        // Update the destructuring
        const newLine = line.replace(destructuringRegex, `$&{${variables.join(', ')}} =`);
        lines[lineIndex] = newLine;
      }
      return true;
    }
  }
  
  return false;
}

// Handle function parameters (e.g., function foo(bar, baz) {})
function handleFunctionParams(lines, lineIndex, varName) {
  const line = lines[lineIndex];
  
  // Function declaration or arrow function
  const functionRegex = new RegExp(`(function\\s+\\w+\\s*\\(|\\([^)]*?)\\b${varName}\\b([^)]*\\))`);
  const match = line.match(functionRegex);
  
  if (match) {
    // Get the parameter list
    const beforeVar = match[1];
    const afterVar = match[2];
    
    // Check if the parameter is alone or has adjacent parameters
    if (beforeVar.endsWith('(') && afterVar.startsWith(')')) {
      // Single parameter
      const newLine = line.replace(functionRegex, `$1$2`);
      lines[lineIndex] = newLine;
    } else if (beforeVar.endsWith(', ')) {
      // Parameter preceded by another parameter
      const newLine = line.replace(new RegExp(`${beforeVar}${varName}${afterVar}`), `${beforeVar.slice(0, -2)}${afterVar}`);
      lines[lineIndex] = newLine;
    } else if (afterVar.startsWith(', ')) {
      // Parameter followed by another parameter
      const newLine = line.replace(new RegExp(`${beforeVar}${varName}${afterVar}`), `${beforeVar}${afterVar.slice(2)}`);
      lines[lineIndex] = newLine;
    } else {
      // Parameter in the middle of other parameters
      const newLine = line.replace(new RegExp(`${beforeVar}${varName}, `), beforeVar);
      lines[lineIndex] = newLine;
    }
    
    return true;
  }
  
  return false;
}

// Handle variable declarations (e.g., const foo = 42)
function handleVariableDeclaration(lines, lineIndex, varName) {
  const line = lines[lineIndex];
  
  // Simple variable declaration
  const varDeclarationRegex = new RegExp(`(const|let|var)\\s+${varName}\\s*=.*?;?$`);
  if (varDeclarationRegex.test(line)) {
    // Remove the entire line
    lines.splice(lineIndex, 1);
    return true;
  }
  
  // Multiple variable declaration (e.g., const foo = 1, bar = 2)
  const multiVarRegex = new RegExp(`(const|let|var)\\s+([^=]+,\\s*)?${varName}\\s*=\\s*[^,;]+(,\\s*|;?$)`);
  const multiMatch = line.match(multiVarRegex);
  
  if (multiMatch) {
    if (multiMatch[2] && multiMatch[3] === ', ') {
      // Variable in the middle: const a = 1, foo = 2, b = 3
      const newLine = line.replace(new RegExp(`${multiMatch[2]}${varName}\\s*=\\s*[^,;]+,\\s*`), multiMatch[2]);
      lines[lineIndex] = newLine;
    } else if (!multiMatch[2] && multiMatch[3] === ', ') {
      // Variable at the start: const foo = 1, b = 2
      const newLine = line.replace(new RegExp(`${varName}\\s*=\\s*[^,;]+,\\s*`), '');
      lines[lineIndex] = newLine;
    } else if (multiMatch[2]) {
      // Variable at the end: const a = 1, foo = 2
      const newLine = line.replace(new RegExp(`,\\s*${varName}\\s*=\\s*[^,;]+;?$`), ';');
      lines[lineIndex] = newLine;
    } else {
      // Only variable: const foo = 1
      lines.splice(lineIndex, 1);
    }
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log('Running ESLint to find unused variables...');
  const results = getLintResults();
  
  if (!results || !results.length) {
    console.log('No ESLint results found or no issues detected.');
    return;
  }
  
  console.log('Extracting unused variable issues...');
  const issuesByFile = getUnusedVarIssues(results);
  
  const totalIssues = Object.values(issuesByFile).reduce((sum, issues) => sum + issues.length, 0);
  if (totalIssues === 0) {
    console.log('No unused variable issues found.');
    return;
  }
  
  console.log(`Found ${totalIssues} unused variable issues in ${Object.keys(issuesByFile).length} files.`);
  
  console.log('Removing unused variables from code...');
  const fixedCount = removeUnusedVars(issuesByFile);
  
  console.log(`Fixed unused variables in ${fixedCount} files.`);
  console.log('Run "npm run lint" to check for remaining issues.');
  console.log('Note: Some complex cases may require manual review.');
}

main();