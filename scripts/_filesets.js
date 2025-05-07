module.exports = {
    "x": [
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
    ],
    "auth-components": [
      "src/auth",                 // All auth directory files
      "src/auth/**",             // All auth files recursively
      "pages/login.tsx",         // Specific file
      "pages/signup.tsx"         // Another specific file
    ],
    "api-routes": [
      "pages/api/**",            // All API routes
      "lib/graphql",             // GraphQL directory
      "lib/database/models"      // Database models directory
    ],
    "specific-feature": [
      "src/features/dashboard/**", // Recursive pattern
      "src/components/charts",     // Directory
      "lib/utils.ts"              // Specific file
    ]
  };