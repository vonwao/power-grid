import React, { useState, useEffect } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper, Button, Typography, Box, Alert } from '@mui/material';
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';
import { EnhancedColumnConfig } from '../components/DataGrid/EnhancedDataGridGraphQL';
// Import the verification function directly to avoid CommonJS/ESM issues

// GraphQL query using Relay-style pagination (same as mtm-history.tsx)
const GET_MTM_HISTORY = gql`
  query MtmHistory(
    $first: Int
    $after: String
    $filter: String
    $sort: String
  ) {
    mtmHistory(first: $first, after: $after, filter: $filter, sort: $sort) {
      edges {
        cursor
        node {
          accounting_mtm_history_id
          adj_description 
          commodity
          deal_volume
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Define columns (same as mtm-history.tsx)
const mtmHistoryColumns: EnhancedColumnConfig[] = [
  {
    field: 'accounting_mtm_history_id',
    headerName: 'ID',
    width: 120,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'adj_description',
    headerName: 'Description',
    width: 200,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'commodity',
    headerName: 'Commodity',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'deal_volume',
    headerName: 'Deal Volume',
    width: 150,
    fieldConfig: { type: 'number' as const },
  },
];

// Sample data for client-side fallback
const sampleMTMHistory = [
  {
    id: 'MTM-1',
    accounting_mtm_history_id: 'MTM-1',
    adj_description: 'Sample Adjustment 1',
    commodity: 'Oil',
    deal_volume: 100.5,
  },
  {
    id: 'MTM-2',
    accounting_mtm_history_id: 'MTM-2',
    adj_description: 'Sample Adjustment 2',
    commodity: 'Gas',
    deal_volume: 200.75,
  },
];

// Interface for verification results
interface VerificationResult {
  success: boolean;
  errors: string[];
  expectedItems: any[];
}

export default function PaginationTestPage() {
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [useGraphQLFetching, setUseGraphQLFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentRows, setCurrentRows] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };

  // Handler for page changes
  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
  };

  // Handler for rows changes
  const handleRowsChange = (rows: any[]) => {
    console.log('Rows changed:', rows.length);
    setCurrentRows(rows);
  };

  // Function to verify the current page against expected data
  const verifyCurrentPage = () => {
    // Load the verification function dynamically
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Load the pagination test data
      const testDataPath = path.join(process.cwd(), 'data/pagination-test-data.json');
      const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
      
      // Get the expected data for this page
      const expectedPageData = testData.pages[currentPage];
      
      if (!expectedPageData) {
        setVerificationResult({
          success: false,
          errors: [`No expected data found for page ${currentPage}`],
          expectedItems: [],
        });
        return;
      }
      
      // Compare the items
      const errors = [];
      
      // Check item count
      if (currentRows.length !== expectedPageData.items.length) {
        errors.push(`Item count mismatch: expected ${expectedPageData.items.length}, got ${currentRows.length}`);
      }
      
      // Check each item
      for (let i = 0; i < Math.min(currentRows.length, expectedPageData.items.length); i++) {
        const actualItem = currentRows[i];
        const expectedItem = expectedPageData.items[i];
        
        if (actualItem.accounting_mtm_history_id !== expectedItem.accounting_mtm_history_id) {
          errors.push(`Item ${i} ID mismatch: expected ${expectedItem.accounting_mtm_history_id}, got ${actualItem.accounting_mtm_history_id}`);
        }
        
        if (actualItem.commodity !== expectedItem.commodity) {
          errors.push(`Item ${i} commodity mismatch: expected ${expectedItem.commodity}, got ${actualItem.commodity}`);
        }
        
        if (actualItem.deal_volume !== expectedItem.deal_volume) {
          errors.push(`Item ${i} deal_volume mismatch: expected ${expectedItem.deal_volume}, got ${actualItem.deal_volume}`);
        }
      }
      
      setVerificationResult({
        success: errors.length === 0,
        errors,
        expectedItems: expectedPageData.items,
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        errors: [`Error verifying pagination results: ${error}`],
        expectedItems: [],
      });
    }
  };

  // Reset verification result when page changes
  useEffect(() => {
    setVerificationResult(null);
  }, [currentPage]);

  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Pagination Test with Relay Cursor Pagination</h1>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useGraphQLFetching}
            onChange={(e) => setUseGraphQLFetching(e.target.checked)}
            className="mr-2"
          />
          Use GraphQL Fetching
        </label>
      </div>

      <Box className="mb-4">
        <Typography variant="h6" gutterBottom>
          Current Page: {currentPage}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={verifyCurrentPage}
          className="mb-2"
        >
          Verify Current Page
        </Button>

        {verificationResult && (
          <Alert 
            severity={verificationResult.success ? "success" : "error"}
            className="mt-2"
          >
            {verificationResult.success 
              ? "Verification successful! Current page matches expected data." 
              : `Verification failed with ${verificationResult.errors.length} errors`}
            
            {verificationResult.errors.length > 0 && (
              <ul className="mt-2">
                {verificationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}
      </Box>
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={mtmHistoryColumns}
          rows={sampleMTMHistory} // Used as fallback when not using GraphQL
          
          // GraphQL options
          useGraphQL={useGraphQLFetching}
          query={GET_MTM_HISTORY}
          paginationStyle="cursor" // Use cursor-based pagination
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={false}
          canAddRows={false}
          canSelectRows={true}
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}

          // Custom props for testing
          onPageChange={handlePageChange}
          onRowsChange={handleRowsChange}
        />
      </Paper>
    </div>
  );
}