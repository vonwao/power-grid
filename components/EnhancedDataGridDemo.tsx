import React, { useState } from 'react';
import { Box, Typography, FormControlLabel, Switch, Chip } from '@mui/material';
import { EnhancedDataGrid } from './DataGrid';
import { DataGridToolbar } from './DataGridToolbar';
import { employees, departments } from './data/mockData';

export default function EnhancedDataGridDemo() {
  // State for server-side mode and selection
  const [serverSide, setServerSide] = useState(false);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);
  // Column definitions with React Hook Form field configs
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      editable: false,
      fieldConfig: {
        type: 'number' as const
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      editable: true,
      fieldConfig: {
        type: 'string' as const,
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        }
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      editable: true,
      fieldConfig: {
        type: 'string' as const,
        validation: {
          required: 'Name is required',
          pattern: {
            value: /^[A-Za-z\s]+$/,
            message: 'Name must contain only letters and spaces'
          },
          validate: (value: string) => {
            if (value && value.length < 3) {
              return 'Name must be at least 3 characters long';
            }
            if (value && value.length > 50) {
              return 'Name must be at most 50 characters long';
            }
            return true;
          }
        }
      }
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100,
      editable: true,
      fieldConfig: {
        type: 'number' as const,
        validation: {
          required: 'Age is required',
          min: {
            value: 18,
            message: 'Age must be at least 18'
          },
          max: {
            value: 100,
            message: 'Age must be at most 100'
          }
        }
      }
    },
    { 
      field: 'birthday', 
      headerName: 'Birthday', 
      width: 150,
      editable: true,
      fieldConfig: {
        type: 'date' as const
      }
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 120,
      editable: true,
      fieldConfig: {
        type: 'boolean' as const
      }
    },
    { 
      field: 'departmentId', 
      headerName: 'Department', 
      width: 220,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: departments.map(dept => ({
          value: dept.id,
          label: dept.label
        })),
        validation: {
          required: 'Department is required'
        }
      }
    },
  ];

  // Row-level validation example
  const validateEmployeeRow = (values: any) => {
    const errors: Record<string, string> = {};
    
    // Example: If department is Engineering (id: 1), age must be at least 21
    if (values.departmentId === 1 && values.age < 21) {
      errors.age = 'Engineering department requires age 21+';
    }
    
    return errors;
  };

  // Handle toolbar actions
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Send to API, etc.
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const handleHelp = () => {
    console.log('Help clicked');
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2
      }}>
        <Box>
          <Typography variant="h6" component="div">
            Employee Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={serverSide}
                  onChange={(e) => setServerSide(e.target.checked)}
                  size="small"
                />
              }
              label="Server-side data"
            />
            
            {selectionModel.length > 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                  Selected:
                </Typography>
                <Chip
                  label={`${selectionModel.length} rows`}
                  onDelete={() => setSelectionModel([])}
                  size="small"
                />
              </Box>
            )}
          </Box>
        </Box>
        <DataGridToolbar
          onSave={() => handleSave({ edits: [], additions: [] })}
          onFilter={handleFilter}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onUpload={handleUpload}
          onHelp={handleHelp}
        />
      </Box>
      <EnhancedDataGrid
        columns={columns}
        rows={employees}
        onSave={handleSave}
        validateRow={validateEmployeeRow}
        // Server-side options
        dataUrl={serverSide ? '/api/employees' : undefined}
        // Selection options
        checkboxSelection={true}
        selectionModel={selectionModel}
        onSelectionModelChange={setSelectionModel}
        // UI options
        rowHeight={30}
        pageSize={25}
      />
    </Box>
  );
}