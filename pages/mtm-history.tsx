import React, { useState, useRef, useCallback } from 'react';
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

// Placeholder GraphQL Mutations (Replace with actual mutations)
const UPDATE_MTM_HISTORY_ITEM = gql`
  mutation UpdateMtmHistoryItem($input: UpdateMtmHistoryItemInput!) {
    updateMtmHistoryItem(input: $input) {
      accounting_mtm_history_id # Or fields needed after update
    }
  }
`;

const CREATE_MTM_HISTORY_ITEM = gql`
  mutation CreateMtmHistoryItem($input: CreateMtmHistoryItemInput!) {
    createMtmHistoryItem(input: $input) {
      accounting_mtm_history_id # Or fields needed after creation
    }
  }
`;

const DELETE_MTM_HISTORY_ITEMS = gql`
  mutation DeleteMtmHistoryItems($ids: [ID!]!) {
    deleteMtmHistoryItems(ids: $ids) {
      success
      deletedCount
    }
  }
`;


// Define columns
const mtmHistoryColumns: EnhancedColumnConfig[] = [
  {
    field: 'accounting_mtm_history_id',
    headerName: 'ID',
    width: 120,
    fieldConfig: {
      type: 'string' as const,
      validation: {
        required: 'ID is required'
      }
    },
  },
  {
    field: 'adj_description',
    headerName: 'Description',
    width: 200,
    fieldConfig: {
      type: 'string' as const,
      validation: {
        required: 'Description is required'
      }
    },
  },
  {
    field: 'commodity',
    headerName: 'Commodity',
    width: 150,
    fieldConfig: {
      type: 'string' as const,
      validation: {
        required: 'Commodity is required'
      }
    },
  },
  {
    field: 'deal_volume',
    headerName: 'Deal Volume',
    width: 150,
    fieldConfig: {
      type: 'number' as const,
      validation: {
        required: 'Deal Volume is required',
        min: {
          value: 0,
          message: 'Deal Volume must be a positive number'
        }
      }
    },
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
  // Use a ref to store the refetch function to avoid re-renders
  const refetchDataRef = useRef<() => Promise<any>>(() => Promise.resolve({ data: null }));
  
  // Helper function to call the refetch function
  const refetchData = useCallback(() => {
    return refetchDataRef.current();
  }, []);
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };
  
  // Handler for grid functions initialization
  const handleGridFunctionsInit = (
    refetch: () => Promise<any>,
    resetCursors: () => void,
    pageInfo: any
  ) => {
    console.log('Grid functions initialized');
    refetchDataRef.current = refetch;
  };
  
  // Row-level validation function
  const validateMtmHistoryRow = (values: any, helpers: any) => {
    const errors: Record<string, string> = {};
    
    // Check if deal_volume is a positive number
    if (values.deal_volume !== undefined && values.deal_volume !== null) {
      if (isNaN(values.deal_volume) || values.deal_volume < 0) {
        errors.deal_volume = 'Deal Volume must be a positive number';
      }
    }
    
    // Additional custom validations can be added here
    
    return errors;
  };
  
  // Handler for saving changes (edits and additions)
  const handleSave = async (changes: { edits: any[]; additions: any[] }) => {
    console.log('Saving changes:', changes);

    // Placeholder logic - replace with actual mutation calls
    try {
      // Process edits
      for (const edit of changes.edits) {
        console.log('Updating item:', edit.id, edit);
        // Example: await updateItemMutation({ variables: { input: { id: edit.id, ...edit } } });
      }

      // Process additions
      for (const addition of changes.additions) {
        console.log('Creating item:', addition);
        // Example: await createItemMutation({ variables: { input: { ...addition } } });
      }

      // Refetch data after saving
      refetchData();

      alert('Changes saved (simulated). Check console.');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Check console.');
    }
  };

  // Handler for deleting selected rows
  const handleDelete = async (ids: GridRowId[]) => {
    console.log('Deleting rows with IDs:', ids);

    // Placeholder logic - replace with actual mutation call
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected row(s)? This action uses the handler passed to the grid, not the toolbar's built-in confirmation.`)) {
      return; // Early exit if user cancels
    }

    try {
      // Example: await deleteItemsMutation({ variables: { ids } });
      console.log(`Simulating deletion of ${ids.length} items.`);

      // Refetch data after deleting
      refetchData();

      alert(`${ids.length} row(s) deleted (simulated). Check console.`);
    } catch (error) {
      console.error('Error deleting rows:', error);
      alert('Error deleting rows. Check console.');
    }
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
          
          // Grid functions initialization
          onGridFunctionsInit={handleGridFunctionsInit}
          
          // Validation
          validateRow={validateMtmHistoryRow}
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={true}
          canAddRows={true}
          canSelectRows={true}
          canDeleteRows={true} // Enable deletion
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          
          // Save handler
          onSave={handleSave}
          // Delete handler
          onDelete={handleDelete}
         />
      </Paper>
    </div>
  );
}