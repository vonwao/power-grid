import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Box } from '@mui/material';
import { useDataGridToolbar } from '../hooks/toolbar/useDataGridToolbar';

// Sample data
const rows = [
  { id: 1, firstName: 'John', lastName: 'Doe', age: 35 },
  { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28 },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 42 },
];

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'First Name', width: 130, editable: true },
  { field: 'lastName', headerName: 'Last Name', width: 130, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', width: 90, editable: true },
];

function AdvancedToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editingRowCount,
    hasValidationErrors,
    canAdd,
    canSave,
    canCancel,
    selectionModel,
    clearSelection,
    handleFilter,
    handleExport,
    hasSelection,
    enableFiltering,
    enableExport
  } = useDataGridToolbar({
    enableFiltering: true,
    enableExport: true
  });

  return (
    <Box className="flex justify-between items-center p-3 border-b bg-gray-50">
      <div className="flex items-center space-x-3">
        <button 
          onClick={addRow}
          disabled={!canAdd}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add New Row
        </button>
        
        {isEditing && (
          <>
            <span className="text-gray-600 bg-white px-3 py-1.5 rounded-md border">
              Editing {editingRowCount} row{editingRowCount !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={saveChanges}
              disabled={!canSave}
              className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
            <button 
              onClick={cancelChanges}
              disabled={!canCancel}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        )}

        {hasValidationErrors && (
          <span className="text-red-500 bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
            Please fix validation errors
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {hasSelection && (
          <>
            <span className="text-gray-600 bg-white px-3 py-1.5 rounded-md border">
              {selectionModel.length} row{selectionModel.length !== 1 ? 's' : ''} selected
            </span>
            <button 
              onClick={clearSelection}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </>
        )}

        {enableFiltering && (
          <button 
            onClick={handleFilter}
            className="px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Filter
          </button>
        )}

        {enableExport && (
          <button 
            onClick={handleExport}
            className="px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Export
          </button>
        )}
      </div>
    </Box>
  );
}

export function AdvancedToolbarDemo() {
  return (
    <Paper elevation={2}>
      <AdvancedToolbar />
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Paper>
  );
}
