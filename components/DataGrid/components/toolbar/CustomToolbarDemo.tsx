import React from 'react';
import { useDataGridToolbar } from '../../hooks/toolbar/useDataGridToolbar';

export function CustomToolbarDemo() {
  const {
    // Left section props
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editingRowCount,
    hasValidationErrors,
    canAdd,
    canSave,
    canCancel,

    // Right section props
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
    <div className="flex justify-between items-center p-2 border-b">
      <div className="flex items-center space-x-2">
        <button 
          onClick={addRow}
          disabled={!canAdd}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Add New
        </button>
        
        {isEditing && (
          <>
            <span className="text-gray-600">
              Editing {editingRowCount} row{editingRowCount !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={saveChanges} 
              disabled={!canSave}
              className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Save
            </button>
            <button 
              onClick={cancelChanges}
              disabled={!canCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {hasSelection && (
          <>
            <span className="text-gray-600">
              Selected: {selectionModel.length} row{selectionModel.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={clearSelection}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Clear Selection
            </button>
          </>
        )}
        {enableFiltering && (
          <button 
            onClick={handleFilter}
            className="px-3 py-1 bg-purple-500 text-white rounded"
          >
            Filter
          </button>
        )}
        {enableExport && (
          <button 
            onClick={handleExport}
            className="px-3 py-1 bg-indigo-500 text-white rounded"
          >
            Export
          </button>
        )}
      </div>
    </div>
  );
}
