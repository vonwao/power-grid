import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  useGridApiRef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridCallbackDetails,
} from '@mui/x-data-grid';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { ValidationOptions } from '../types/form'; // Corrected path
import { CellRenderer } from './DataGrid/renderers/CellRenderer';
import { EditCellRenderer } from './DataGrid/renderers/EditCellRenderer';
import { GridFormProvider, useGridForm, ValidationHelpers } from './DataGrid/context/GridFormContext';
import { CellEditHandler } from './DataGrid/components';
import { SelectFieldType } from './DataGrid/fieldTypes/SelectField';
import { useGridNavigation, useSelectionModel } from './DataGrid/hooks';
import { GridModeProvider, useGridMode, GridMode } from './DataGrid/context/GridModeContext';
import { employees as mockEmployees, Employee } from './data/mockData'; // Corrected import name and using mock data alias
import { EnhancedColumnConfig, FieldConfig } from './DataGrid/EnhancedDataGridGraphQL'; // Reusing types

// Import the new toolbar components directly from their files
import { DataGridToolbar } from './DataGrid/components/toolbar/DataGridToolbar';
import { DataGridToolbarLeft } from './DataGrid/components/toolbar/DataGridToolbarLeft';
import { DataGridToolbarRight } from './DataGrid/components/toolbar/DataGridToolbarRight';
import { AddRowButton } from './DataGrid/components/toolbar/buttons/AddRowButton'; // Example: Using individual buttons for customization
import { FilterButton } from './DataGrid/components/toolbar/buttons/FilterButton'; // Example: Using individual buttons for customization

// Basic column configuration for the demo
const columnsConfig: EnhancedColumnConfig<Employee>[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 150, 
    editable: true, 
    fieldConfig: { type: 'string', validation: { required: 'Name is required' } } 
  },
  { 
    field: 'department', 
    headerName: 'Department', 
    width: 150, 
    editable: true, 
    fieldConfig: { 
      type: 'select', 
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Marketing', label: 'Marketing' },
      ] 
    } 
  },
  { 
    field: 'email', 
    headerName: 'Email', 
    width: 200, 
    editable: true, 
    fieldConfig: { type: 'string', validation: { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } } } 
  },
  { 
    field: 'hireDate', 
    headerName: 'Hire Date', 
    width: 120, 
    editable: true, 
    fieldConfig: { type: 'date' } 
  },
  { 
    field: 'isActive', 
    headerName: 'Active', 
    width: 80, 
    editable: true, 
    fieldConfig: { type: 'boolean' } 
  },
];

export function ToolbarDataGridDemo() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Employee[]>(mockEmployees.slice(0, 10)); // Use a slice of mock data
  const totalRows = rows.length; // Client-side total

  // Selection model hook
  const { selectionModel, onSelectionModelChange: handleSelectionModelChange } = useSelectionModel({});

  // Navigation hook
  const handleNavigate = useCallback((id: GridRowId, field: string) => {
    try {
      const cellMode = apiRef.current.getCellMode(id, field);
      if (cellMode === 'view') {
        apiRef.current.startCellEditMode({ id, field });
      }
    } catch (error) { console.error('Error navigating to cell:', error); }
  }, [apiRef]);
  const { handleKeyDown } = useGridNavigation({ api: apiRef.current, columns: columnsConfig, rows, onNavigate: handleNavigate });

  // Create SelectFieldType instances
  columnsConfig.forEach(column => {
    if (column.fieldConfig?.type === 'select' && !column.fieldType) {
      column.fieldType = new SelectFieldType({
        options: column.fieldConfig.options || [],
        valueKey: 'value',
        labelKey: 'label'
      });
    }
  });

  // Convert to MUI X Data Grid columns
  const gridColumns: GridColDef[] = columnsConfig.map(column => ({
    ...column,
    renderCell: (params) => <CellRendererWrapper params={params} column={column} />,
    renderEditCell: (params) => <EditCellRenderer params={params} column={column} />,
  }));

  const isCompact = false; // Example: Standard density

  // Save handler
  const handleSave = useCallback((changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Apply changes to local state (simplified)
    let updatedRows = [...rows];
    changes.edits.forEach(edit => {
      const index = updatedRows.findIndex(row => row.id === edit.id);
      if (index !== -1) {
        updatedRows[index] = { ...updatedRows[index], ...edit.changes };
      }
    });
    changes.additions.forEach(addition => {
      updatedRows.push({ ...addition.data, id: `new-${Date.now()}` }); // Assign temporary ID
    });
    setRows(updatedRows);
    alert('Changes saved! (Check console)');
  }, [rows]);

  // Filter handler (placeholder)
  const handleFilter = useCallback((filters: any) => {
    console.log('Applying filters:', filters);
    alert('Filter applied! (Check console)');
    // Add actual filtering logic here if needed for the demo
  }, []);

  // Export handler (placeholder)
  const handleExport = useCallback(() => {
    console.log('Exporting data...');
    alert('Export initiated! (Check console)');
  }, []);

  // Upload handler (placeholder)
  const handleUpload = useCallback(() => {
    console.log('Uploading data...');
    alert('Upload initiated! (Check console)');
  }, []);

  // Help handler (placeholder)
  const handleHelp = useCallback(() => {
    console.log('Opening help...');
    alert('Help opened! (Check console)');
  }, []);

  // Wrapper for DataGrid using GridModeContext
  const DataGridWithModeControl = () => {
    const { mode, setMode } = useGridMode();
    const isInEditOrAddMode = mode === 'edit' || mode === 'add';

    const handleCellClick = (params: any) => {
      if (mode === 'edit' && params.field !== '__check__' && params.field !== '__actions__') {
        const column = columnsConfig.find(col => col.field === params.field);
        if (column?.editable !== false) {
          try {
            const cellMode = apiRef.current.getCellMode(params.id, params.field);
            if (cellMode === 'view') {
              apiRef.current.startCellEditMode({ id: params.id, field: params.field });
            }
          } catch (error) { console.error('Error starting cell edit mode:', error); }
        }
      }
    };

    const handleCellDoubleClick = (params: any) => {
      if (mode === 'add' && !params.id.toString().startsWith('new-')) return;
      if (params.field === '__check__' || params.field === '__actions__') return;
      const column = columnsConfig.find(col => col.field === params.field);
      if (column?.editable !== false) {
        try {
          setMode('edit');
          const cellMode = apiRef.current.getCellMode(params.id, params.field);
          if (cellMode === 'view') {
            apiRef.current.startCellEditMode({ id: params.id, field: params.field });
          }
        } catch (error) { console.error('Error starting cell edit mode:', error); }
      }
    };

    return (
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={gridColumns}
        density="standard"
        disableRowSelectionOnClick={isInEditOrAddMode || true}
        loading={false} // No GraphQL loading here
        // Pagination (client-side)
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        pageSizeOptions={[5, 10, 25]}
        paginationMode="client"
        rowCount={totalRows}
        // Selection
        checkboxSelection={true} // Enable checkbox selection for demo
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionModelChange}
        isRowSelectable={() => !isInEditOrAddMode}
        // Editing
        editMode="cell"
        onCellClick={handleCellClick}
        onCellDoubleClick={handleCellDoubleClick}
        onCellKeyDown={handleKeyDown}
        slots={{ noRowsOverlay: () => <Typography p={2}>No rows</Typography> }}
        sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' }, height: '100%' }}
      />
    );
  };

  // Wrapper providing GridModeContext
  const GridModeWrapper = ({ children }: { children: React.ReactNode }) => {
    const { saveChanges, cancelChanges, addRow, hasValidationErrors, isRowEditing, isRowDirty } = useGridForm();
    return (
      <GridModeProvider
        totalRows={totalRows}
        initialMode="none"
        saveChanges={saveChanges}
        cancelChanges={cancelChanges}
        addRow={addRow}
        hasValidationErrors={hasValidationErrors}
        isRowEditing={isRowEditing}
        isRowDirty={isRowDirty}
        canEditRows={true}
        canAddRows={true}
        canSelectRows={true}
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionModelChange} // Corrected prop name
      >
        {children}
      </GridModeProvider>
    );
  };

  // Main component structure with Toolbar
  const GridWithToolbar = () => {
    const [showCustom, setShowCustom] = useState(false);

    // Example Custom Filter Button
    const MyCustomFilterButton = () => (
      <Button variant="outlined" size="small" onClick={() => alert('Custom Filter Clicked!')}>
        Custom Filter Btn
      </Button>
    );

    return (
      <GridModeWrapper>
        <div className="h-[600px] w-full flex flex-col">
          <Typography variant="h6" gutterBottom>Toolbar Demo</Typography>
          
          <Button onClick={() => setShowCustom(!showCustom)} sx={{ mb: 1 }}>
            {showCustom ? 'Show Standard Toolbar' : 'Show Custom Toolbar Example'}
          </Button>

          {/* --- Standard Toolbar Usage --- */}
          {!showCustom && (
            <DataGridToolbar
              // Right section props
              onFilter={handleFilter}
              onExport={handleExport}
              onUpload={handleUpload}
              onHelp={handleHelp}
              // Example: Hiding a button
              // hideHelpButton={true} 
            />
          )}

          {/* --- Customized Toolbar Usage Example --- */}
          {showCustom && (
            <DataGridToolbar
              // Example: Replace Left Section entirely
              leftSection={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
                  <Typography variant="caption">Custom Left:</Typography>
                  <AddRowButton /> 
                  {/* Add other custom elements or standard buttons */}
                </Stack>
              }
              // Example: Customize Right Section
              rightSection={
                <DataGridToolbarRight
                  onExport={handleExport} // Keep export
                  hideUploadButton={true} // Hide upload
                  hideHelpButton={true}   // Hide help
                  // Provide a custom filter button
                  customFilterButton={<MyCustomFilterButton />} 
                />
              }
            />
          )}

          <Paper elevation={0} className="flex-grow w-full overflow-auto">
            <CellEditHandler apiRef={apiRef} />
            <DataGridWithModeControl />
          </Paper>
        </div>
      </GridModeWrapper>
    );
  };
 
  return (
    <GridFormProvider
      columns={columnsConfig as EnhancedColumnConfig<any>[]} // Cast to handle generic type mismatch
      initialRows={rows}
      onSave={handleSave}
      // validateRow={validateRow} // Add row validation if needed
      isCompact={isCompact}
    >
      <GridWithToolbar />
    </GridFormProvider>
  );
}

// Wrapper for CellRenderer getting validation state from context
const CellRendererWrapper = ({ params, column }: { params: GridRenderCellParams, column: EnhancedColumnConfig }) => {
  const { isFieldDirty, getRowErrors, getFormMethods } = useGridForm();
  const isDirty = isFieldDirty(params.id, params.field);
  const errors = getRowErrors(params.id);
  const error = errors?.[params.field];
  const formMethods = getFormMethods(params.id);
  const formValue = formMethods ? formMethods.getValues()[params.field] : undefined;
  const updatedParams = { ...params, value: formValue !== undefined ? formValue : params.value };
  return <CellRenderer params={updatedParams} column={column} isDirty={isDirty} error={error} />;
};
