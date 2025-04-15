const fs = require('fs');
const path = require('path');

// Define the files that are relevant to the "Too many re-renders" issue
const relevantFiles = [
  // Main files with the issue
  'pages/mtm-history.tsx',
  'components/DataGrid/EnhancedDataGridGraphQL.tsx',
  
  // Context providers that might be causing re-renders
  'components/DataGrid/context/GridModeContext.tsx',
  'components/DataGrid/context/GridFormContext.tsx',
  
  // Hooks that might be causing re-renders
  'components/DataGrid/hooks/useSelectionModel.ts',
  'components/DataGrid/hooks/useRelayGraphQLData.ts',
  
  // Components involved in the rendering cycle
  'components/DataGrid/renderers/CellRenderer.tsx',
  'components/DataGrid/renderers/EditCellRenderer.tsx',
  'components/DataGrid/components/ValidationIndicator.tsx',
  'components/DataGrid/components/CellEditHandler.tsx',
  'components/DataGrid/components/UnifiedDataGridToolbar.tsx'
];

// Function to read a file and format its content
function readAndFormatFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Format the file content with a header
    return `
==========================================================================
FILE: ${filePath}
==========================================================================

${content}

`;
  } catch (error) {
    return `
==========================================================================
FILE: ${filePath}
==========================================================================

ERROR: Could not read file: ${error.message}

`;
  }
}

// Function to count tokens (rough estimate)
function countTokens(text) {
  // A very rough estimate: split by whitespace and count
  return text.split(/\s+/).length;
}

// Main function to combine files
function combineFiles() {
  let combinedContent = `
COMBINED CONTEXT FOR DEBUGGING "Too many re-renders" ISSUE
==========================================================================

This file contains the combined content of all relevant files related to the
"Too many re-renders" issue in the mtm-history.tsx page and EnhancedDataGridGraphQL component.

The issue occurs when using the EnhancedDataGridGraphQL component with the following error:
"Error: Too many re-renders. React limits the number of renders to prevent an infinite loop."

Files included:
${relevantFiles.map(file => `- ${file}`).join('\n')}

==========================================================================

`;

  // Process each file
  for (const file of relevantFiles) {
    const filePath = path.join(process.cwd(), file);
    const formattedContent = readAndFormatFile(filePath);
    combinedContent += formattedContent;
  }

  // Add analysis section
  combinedContent += `
==========================================================================
ANALYSIS OF POTENTIAL CAUSES
==========================================================================

1. Selection Model Management:
   - The useSelectionModel hook in EnhancedDataGridGraphQL might be causing a loop
   - The selectionModel prop is passed to the DataGrid component and also managed internally
   - The onSelectionModelChange handler might be triggering re-renders

2. Context Provider Nesting:
   - Multiple nested context providers (GridFormProvider, GridModeProvider) might be causing cascading updates
   - Each provider might be re-rendering when their values change

3. State Updates During Render:
   - There might be state updates happening during the render phase
   - Check for setState calls that aren't in event handlers or useEffect

4. Prop Changes Triggering Re-renders:
   - The useGraphQL prop toggling might be causing component remounts
   - The selectionModel prop changes might be causing re-renders

5. Effect Dependencies:
   - Some useEffect hooks might have missing or incorrect dependencies
   - This could cause them to run too frequently and update state

==========================================================================
TOKEN COUNT ESTIMATE
==========================================================================

Approximate number of tokens: ${countTokens(combinedContent)}
`;

  // Write the combined content to a file
  const outputPath = path.join(process.cwd(), 'combined_context.txt');
  fs.writeFileSync(outputPath, combinedContent, 'utf8');
  
  console.log(`Combined context written to ${outputPath}`);
  console.log(`Approximate token count: ${countTokens(combinedContent)}`);
}

// Execute the main function
combineFiles();