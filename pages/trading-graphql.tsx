import React, { useCallback, useState, useRef } from 'react';
import {
  GridRowId,
  useGridApiRef,
} from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';
import { TradingActionButtons } from '../components/TradingActionButtons';
import { GridMode } from '../components/DataGrid/context/GridModeContext';
import { ValidationHelpers } from '../components/DataGrid/context/GridFormContext';
import { tradingColumns } from '../components/data/tradingColumns';
import { tradingData } from '../components/data/tradingData';

export default function TradingGraphQLPage() {
  const apiRef = useGridApiRef();
  
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [useGraphQLFetching, setUseGraphQLFetching] = useState(false);
  
  // Create a ref to track the last known edit mode
  const lastKnownEditModeRef = useRef(false);

  // Row-level validation for trade data
  const validateTradeRow = (values: any, helpers: ValidationHelpers) => {
    const errors: Record<string, string> = {};
    // Add validation logic as needed
    return errors;
  };

  // Handle save function (e.g., send updates to backend)
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Submit changes to API
  };

  // Handle mode changes via callback
  const handleModeChange = useCallback((newMode: GridMode) => {
    const isEditOrAddMode = newMode === 'edit' || newMode === 'add';
    setIsInEditMode(isEditOrAddMode);
  }, []);
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };
  
  // Handlers for action buttons
  const handleFilter = () => {
    console.log('Filter clicked');
    // Implement filter functionality
  };
  
  const handleExport = async () => {
    console.log('Export clicked');
    
    // Get the selected rows based on selectionModel
    const selectedRows = selectionModel.length > 0
      ? tradingData.filter(row => selectionModel.includes(row.id as GridRowId))
      : tradingData; // If no rows selected, export all rows
    
    // Log the selected rows to the console
    console.log('Rows to export:', selectedRows);
    
    // Simulate async operation
    return new Promise(resolve => setTimeout(resolve, 1000));
  };
  
  const handleUpload = () => {
    console.log('Upload clicked');
    // Implement upload functionality
  };
  
  const handleHelp = () => {
    console.log('Help clicked');
    // Implement help functionality
  };


  // Create custom action buttons component to pass to the grid
  const customActionButtons = (
    <TradingActionButtons
      isInEditMode={isInEditMode}
      selectionModel={selectionModel}
      onFilter={handleFilter}
      onExport={handleExport}
      onUpload={handleUpload}
      onHelp={handleHelp}
    />
  );

  return (
    <div className="h-full w-full flex flex-col">
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={tradingColumns}
          rows={tradingData}
          onSave={handleSave}
          validateRow={validateTradeRow}
          
          // GraphQL options
          useGraphQL={useGraphQLFetching}
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={true}
          canAddRows={false}
          canSelectRows={true}
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          
          // Custom components
          customActionButtons={customActionButtons}
        />
      </Paper>
    </div>
  );
}