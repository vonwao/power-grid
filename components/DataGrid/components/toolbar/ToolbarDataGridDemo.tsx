import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DataGridToolbar } from './DataGridToolbar';
import { FilterValues } from '../GlobalFilterDialog';
import { GridModeProvider } from '../../context/GridModeContext';
import { GridFormProvider } from '../../context/GridFormContext';
import { EnhancedColumnConfig } from '../../EnhancedDataGridGraphQL';

// Sample data
const rows = [
  { id: 1, firstName: 'John', lastName: 'Doe', age: 35, department: 'Engineering' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28, department: 'Marketing' },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 42, department: 'Finance' },
  { id: 4, firstName: 'Alice', lastName: 'Williams', age: 31, department: 'Engineering' },
  { id: 5, firstName: 'Charlie', lastName: 'Brown', age: 39, department: 'HR' },
];

// Column definitions with EnhancedColumnConfig type
const columns: EnhancedColumnConfig[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70,
    fieldConfig: { type: 'number' }
  },
  { 
    field: 'firstName', 
    headerName: 'First Name', 
    width: 130, 
    editable: true,
    fieldConfig: { type: 'string' }
  },
  { 
    field: 'lastName', 
    headerName: 'Last Name', 
    width: 130, 
    editable: true,
    fieldConfig: { type: 'string' }
  },
  { 
    field: 'age', 
    headerName: 'Age', 
    type: 'number', 
    width: 90, 
    editable: true,
    fieldConfig: { type: 'number' }
  },
  { 
    field: 'department', 
    headerName: 'Department', 
    width: 160, 
    editable: true,
    fieldConfig: { type: 'string' }
  },
];

export const ToolbarDataGridDemo: React.FC = () => {
  // State for tracking editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Handlers for toolbar actions
  const handleSave = () => {
    console.log('Saving changes...');
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    console.log('Canceling changes...');
    setIsEditing(false);
  };
  
  const handleAddRow = () => {
    console.log('Adding new row...');
    setIsEditing(true);
  };
  
  const handleFilter = (filters: FilterValues) => {
    console.log('Filtering with:', filters);
  };
  
  const handleExport = () => {
    console.log('Exporting data...');
  };
  
  const handleUpload = () => {
    console.log('Uploading data...');
  };
  
  const handleHelp = () => {
    console.log('Opening help dialog...');
  };
  
  // Mock functions for GridModeProvider
  const mockAddRow = () => {
    console.log('Adding row from context');
    setIsEditing(true);
  };
  
  const mockSaveChanges = () => {
    console.log('Saving changes from context');
    setIsEditing(false);
  };
  
  const mockCancelChanges = () => {
    console.log('Canceling changes from context');
    setIsEditing(false);
  };
  
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Paper elevation={2}>
        {/* Wrap with necessary context providers */}
        <GridFormProvider
          columns={columns}
          initialRows={rows}
          onSave={() => console.log('Form saved')}
        >
          <GridModeProvider
            totalRows={rows.length}
            initialMode={isEditing ? 'edit' : 'none'}
            saveChanges={mockSaveChanges}
            cancelChanges={mockCancelChanges}
            addRow={mockAddRow}
            hasValidationErrors={false}
            isRowEditing={() => isEditing}
            isRowDirty={() => isEditing}
            selectionModel={selectedRows}
            onSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection as number[]);
            }}
          >
            {/* Using the new modular toolbar */}
            <DataGridToolbar
              // Left section props
              hideAddButton={false}
              hideSaveButton={!isEditing}
              hideCancelButton={!isEditing}
              hideEditingStatus={!isEditing}
              hideValidationStatus={false}
              hideSelectionStatus={selectedRows.length === 0}
              
              // Right section props
              onFilter={handleFilter}
              onExport={handleExport}
              onUpload={handleUpload}
              onHelp={handleHelp}
              hideFilterButton={false}
              hideExportButton={false}
              hideUploadButton={false}
              hideHelpButton={false}
            />
        
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              disableRowSelectionOnClick={false}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection as number[]);
              }}
            />
          </GridModeProvider>
        </GridFormProvider>
      </Paper>
    </Box>
  );
};
