import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridCellModesModel,
  GridCellModes,
  GridCellEditStopReasons,
  GridRenderEditCellParams,
  useGridApiRef,
} from '@mui/x-data-grid';
import { 
  Autocomplete, 
  TextField, 
  Checkbox, 
  FormControlLabel,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { employees, departments, Employee, getDepartmentLabel } from './data/mockData';

// Custom department cell editor component
function DepartmentEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, api } = props;
  
  const handleChange = (event: any, newValue: { id: number, label: string } | null) => {
    api.setEditCellValue({ id, field, value: newValue?.id || null });
    console.log('Department changed:', { 
      rowId: id, 
      field, 
      oldValue: value, 
      newValue: newValue?.id || null,
      departmentName: newValue?.label || null
    });
  };

  return (
    <Autocomplete
      autoFocus
      disablePortal
      id={`department-select-${id}`}
      options={departments}
      getOptionLabel={(option) => option.label}
      value={departments.find(dept => dept.id === value) || null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
      sx={{ width: '100%' }}
    />
  );
}

export default function DataGridDemo() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Employee[]>(employees);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  // Handle cell double-click to enter edit mode
  const handleCellDoubleClick = useCallback((params: any) => {
    const { id, field } = params;
    
    // Skip editing for non-editable fields
    if (field === 'id') return;
    
    setCellModesModel((prevModel) => ({
      ...prevModel,
      [id]: {
        ...prevModel[id],
        [field]: { mode: GridCellModes.Edit },
      },
    }));
    
    console.log('Cell edit started:', { 
      rowId: id, 
      field: field, 
      value: params.value,
      rowData: rows.find(row => row.id === id)
    });
  }, [rows]);

  // Handle cell edit start
  const handleCellEditStart = useCallback((params: any) => {
    console.log('Cell edit started:', { 
      rowId: params.id, 
      field: params.field, 
      value: params.value,
      rowData: rows.find(row => row.id === params.id)
    });
  }, [rows]);

  // Handle cell edit stop
  const handleCellEditStop = useCallback((params: any, event: any) => {
    const { id, field, reason } = params;
    
    setCellModesModel((prevModel) => ({
      ...prevModel,
      [id]: {
        ...prevModel[id],
        [field]: { mode: GridCellModes.View },
      },
    }));
    
    if (reason === GridCellEditStopReasons.cellFocusOut) {
      console.log('Cell edit completed (focus out):', { 
        rowId: id, 
        field: field,
        reason: reason
      });
    }
  }, []);

  // Handle row update
  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const updatedRow = { ...newRow } as Employee;
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      console.log('Row updated:', { 
        rowId: newRow.id, 
        newData: updatedRow,
        fieldType: {
          name: 'text',
          age: 'number',
          birthday: 'date',
          active: 'boolean',
          departmentId: 'select/autocomplete'
        }
      });
      return updatedRow;
    },
    [rows]
  );

  // Column definitions with different data types
  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70, 
      editable: false 
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 180, 
      editable: true,
      type: 'string'
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100, 
      editable: true,
      type: 'number'
    },
    { 
      field: 'birthday', 
      headerName: 'Birthday', 
      width: 150, 
      editable: true,
      type: 'date',
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 120, 
      editable: true,
      type: 'boolean',
      renderCell: (params: any) => {
        return <Checkbox checked={params.value} disabled />;
      }
    },
    { 
      field: 'departmentId', 
      headerName: 'Department', 
      width: 220, 
      editable: true,
      valueFormatter: (params: any) => getDepartmentLabel(params.value as number),
      renderCell: (params: any) => {
        return <span>{getDepartmentLabel(params.value as number)}</span>;
      },
      renderEditCell: (params) => <DepartmentEditCell {...params} />,
    },
  ];

  return (
    <div className="w-full p-6">
      <Paper elevation={3} className="p-6 mb-6">
        <Typography variant="h4" className="mb-4 text-center sm:text-left">
          MUI X Data Grid Demo with Inline Editing
        </Typography>
        <Typography variant="body1" className="mb-6 text-center sm:text-left">
          This demo showcases an editable data grid with various field types: text, number, date, boolean, and select with autocomplete.
        </Typography>
        
        <Box className="bg-gray-50 p-4 mb-6 rounded-md">
          <Typography variant="subtitle1" className="font-bold mb-2">
            Instructions:
          </Typography>
          <ul className="list-disc pl-5 space-y-1">
            <li>Double-click on any cell (except ID) to edit its value</li>
            <li>Press Enter or click outside to save changes</li>
            <li>Check the browser console to see logged events</li>
          </ul>
        </Box>
      </Paper>

      <Paper elevation={3} className="h-[500px] w-full">
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          onCellDoubleClick={handleCellDoubleClick}
          onCellEditStart={handleCellEditStart}
          onCellEditStop={handleCellEditStop}
          processRowUpdate={processRowUpdate}
          cellModesModel={cellModesModel}
          editMode="cell"
          isCellEditable={(params) => params.field !== 'id'}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
        />
      </Paper>
    </div>
  );
}
