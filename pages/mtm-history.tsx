import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';
import { EnhancedColumnConfig } from '../components/DataGrid/EnhancedDataGridGraphQL';

// GraphQL query using Relay-style pagination
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

// Define columns
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

export default function MTMHistoryPage() {
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [useGraphQLFetching, setUseGraphQLFetching] = useState(true); 
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };
  
  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">MTM History with Relay Pagination</h1>
      
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
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={mtmHistoryColumns}
          rows={sampleMTMHistory} // Used as fallback when not using GraphQL
          
          // GraphQL options
          useGraphQL={useGraphQLFetching}
          query={GET_MTM_HISTORY}
          // No need to pass variables, let the hook handle it
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
        />
      </Paper>
    </div>
  );
}