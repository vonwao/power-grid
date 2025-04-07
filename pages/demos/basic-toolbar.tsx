import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useDataGridToolbar } from '../../components/DataGrid/hooks/toolbar/useDataGridToolbar';

// Sample data
const rows = [
  { id: 1, firstName: 'John', lastName: 'Doe', age: 35 },
  { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28 },
];

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'First Name', width: 130, editable: true },
  { field: 'lastName', headerName: 'Last Name', width: 130, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', width: 90, editable: true },
];

function BasicToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editingRowCount,
    canAdd,
    canSave,
    canCancel,
  } = useDataGridToolbar();

  return (
    <Box className="flex items-center space-x-3 p-3 border-b bg-gray-50">
      <button 
        onClick={addRow}
        disabled={!canAdd}
        className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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
            className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            Save
          </button>
          <button 
            onClick={cancelChanges}
            disabled={!canCancel}
            className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      )}
    </Box>
  );
}

export default function BasicToolbarDemoPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Basic Toolbar Demo
      </Typography>

      <Typography variant="body1" paragraph>
        This demo shows a simple implementation of the DataGrid toolbar with essential editing features.
        It demonstrates the core functionality without additional features like filtering or export.
      </Typography>

      <Paper elevation={2}>
        <BasicToolbar />
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated
        </Typography>
        <ul className="list-disc pl-6 space-y-2">
          <li>Basic row addition and editing</li>
          <li>Simple status indicators</li>
          <li>Minimal UI with essential controls</li>
        </ul>
      </Paper>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Details
        </Typography>
        <Typography variant="body2" component="div">
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
{`// Basic hook setup
const {
  addRow,
  saveChanges,
  cancelChanges,
  isEditing,
  editingRowCount,
} = useDataGridToolbar();`}
          </pre>
        </Typography>
      </Paper>
    </Container>
  );
}
