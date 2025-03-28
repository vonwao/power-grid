import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, FormControlLabel, Switch, Chip, Paper } from '@mui/material';
import { EnhancedDataGrid, GridImplementation } from './DataGrid';
import { generateEmployees } from '../utils/dataGenerator';
import { departments } from './data/mockData';

/**
 * Demo component that showcases both MUI X Grid and ag-Grid implementations
 */
export default function GridImplementationDemo() {
  const [implementation, setImplementation] = useState<GridImplementation>('mui');
  const [serverSide, setServerSide] = useState(false);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Generate sample data on mount
  useEffect(() => {
    // Generate 100 employees for client-side demo
    // (Server-side will use the full 10K dataset)
    setEmployees(generateEmployees(100));
  }, []);
  
  // Column definitions
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
  
  // Handle save
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // In a real app, you'd send these changes to your API
  };
  
  // Row-level validation
  const validateEmployeeRow = (values: any) => {
    const errors: Record<string, string> = {};
    
    // Example: If department is Engineering (id: 1), age must be at least 21
    if (values.departmentId === 1 && values.age < 21) {
      errors.age = 'Engineering department requires age 21+';
    }
    
    return errors;
  };
  
  // Handle selection change
  const handleSelectionChange = (newSelectionModel: any[]) => {
    setSelectionModel(newSelectionModel);
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        {/* <Typography variant="h6" gutterBottom>
          Enhanced Data Grid Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo showcases two different implementations of the EnhancedDataGrid component:
          MUI X Grid and ag-Grid. Both implementations share the same form integration, validation,
          and server-side capabilities.
        </Typography> */}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={implementation} 
            onChange={(_, newValue) => setImplementation(newValue)}
          >
            <Tab label="MUI X Grid" value="mui" />
            <Tab label="ag-Grid" value="ag-grid" />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={serverSide}
                onChange={(e) => setServerSide(e.target.checked)}
              />
            }
            label="Server-side operations"
          />
          
          <Typography variant="body2" color="text.secondary">
            {serverSide 
              ? 'Using server-side pagination, sorting, and filtering with 10,000 rows' 
              : 'Using client-side pagination, sorting, and filtering with 100 rows'}
          </Typography>
        </Box>
        
        {selectionModel.length > 0 && (
          <Box sx={{ mt: 1 }}>
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
      </Paper>
      
      <Box sx={{ flexGrow: 1 }}>
        <EnhancedDataGrid
          implementation={implementation}
          columns={columns}
          rows={serverSide ? [] : employees} // Empty for server-side
          onSave={handleSave}
          validateRow={validateEmployeeRow}
          serverSide={serverSide}
          dataUrl={serverSide ? '/api/employees' : undefined}
          pageSize={25}
          rowHeight={30}
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
        />
      </Box>
    </Box>
  );
}