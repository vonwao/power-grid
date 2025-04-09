import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, Tabs, Tab, Typography, Alert, Snackbar } from '@mui/material';
import { useDataGridToolbar } from '../../components/DataGrid/hooks/toolbar/useDataGridToolbar';
import { DataGridProvider } from '../../components/DataGrid/context/DataGridProvider';
import { EnhancedDataGrid, EnhancedColumnConfig } from '../../components/DataGrid/EnhancedDataGrid';
import { ValidationHelpers } from '../../components/DataGrid/context/GridFormContext';

// Sample data with more fields for the kitchen sink demo
const initialRows = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', age: 35, status: 'active', department: 'Engineering', salary: 85000 },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', age: 28, status: 'inactive', department: 'Marketing', salary: 75000 },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', age: 42, status: 'active', department: 'Sales', salary: 95000 },
];

// Comprehensive column definitions with all available features
const columns: EnhancedColumnConfig[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90,
    fieldConfig: {
      type: 'number',
      validation: {
        required: true
      }
    }
  },
  { 
    field: 'firstName', 
    headerName: 'First Name', 
    width: 130,
    editable: true,
    fieldConfig: {
      type: 'string',
      validation: {
        required: true,
        minLength: { value: 2, message: 'Name must be at least 2 characters' },
        maxLength: { value: 50, message: 'Name must be at most 50 characters' }
      }
    }
  },
  { 
    field: 'lastName', 
    headerName: 'Last Name', 
    width: 130,
    editable: true,
    fieldConfig: {
      type: 'string',
      validation: {
        required: true,
        minLength: { value: 2, message: 'Name must be at least 2 characters' },
        maxLength: { value: 50, message: 'Name must be at most 50 characters' }
      }
    }
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
    editable: true,
    fieldConfig: {
      type: 'string',
      validation: {
        required: true,
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address'
        }
      }
    }
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 90,
    editable: true,
    fieldConfig: {
      type: 'number',
      validation: {
        required: true,
        min: { value: 18, message: 'Must be at least 18' },
        max: { value: 100, message: 'Must be under 100' }
      }
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    editable: true,
    fieldConfig: {
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ],
      validation: {
        required: true
      }
    }
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
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'HR', label: 'HR' }
      ],
      validation: {
        required: true
      }
    }
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 130,
    editable: true,
    fieldConfig: {
      type: 'number',
      validation: {
        required: true,
        min: { value: 30000, message: 'Minimum salary is 30,000' },
        max: { value: 500000, message: 'Maximum salary is 500,000' }
      },
      format: (value) => value ? \`\$\${value.toLocaleString()}\` : '',
      parse: (value) => typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) : value
    }
  }
];

interface KitchenSinkState {
  rows: typeof initialRows;
  loading: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  };
}

export function KitchenSinkDemo() {
  const [state, setState] = useState<KitchenSinkState>({
    rows: initialRows,
    loading: false,
    error: null,
    snackbar: {
      open: false,
      message: '',
      severity: 'info'
    }
  });

  // Simulated GraphQL-style data fetching
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setState(prev => ({ 
        ...prev, 
        rows: initialRows,
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load data',
        loading: false,
        snackbar: {
          open: true,
          message: 'Failed to load data. Please try again.',
          severity: 'error'
        }
      }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle row validation
  const validateRow = useCallback(async (values: any, helpers: ValidationHelpers) => {
    const errors: Record<string, string> = {};
    
    // Custom validation logic
    if (values.age < 25 && values.salary > 100000) {
      errors.salary = 'Employees under 25 cannot have a salary over 100,000';
    }

    return errors;
  }, []);

  // Handle save
  const handleSave = useCallback(async ({ edits, additions }: { edits: any[], additions: any[] }) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state optimistically
      setState(prev => {
        const updatedRows = [...prev.rows];
        
        // Apply edits
        edits.forEach(edit => {
          const index = updatedRows.findIndex(row => row.id === edit.id);
          if (index !== -1) {
            updatedRows[index] = edit;
          }
        });

        // Add new rows
        additions.forEach(addition => {
          updatedRows.push({
            ...addition,
            id: Math.max(...updatedRows.map(r => r.id)) + 1
          });
        });

        return {
          ...prev,
          rows: updatedRows,
          loading: false,
          snackbar: {
            open: true,
            message: 'Changes saved successfully',
            severity: 'success'
          }
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: 'Failed to save changes',
          severity: 'error'
        }
      }));
    }
  }, []);

  const handleCloseSnackbar = () => {
    setState(prev => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false }
    }));
  };

  if (state.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {state.error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Kitchen Sink Demo
          </Typography>
          <Typography color="textSecondary" paragraph>
            This demo showcases all available features of the EnhancedDataGrid component.
          </Typography>

          <DataGridProvider
            columns={columns}
            rows={state.rows}
            onSave={handleSave}
            validateRow={validateRow}
          >
            <EnhancedDataGrid
              rows={state.rows}
              columns={columns}
              loading={state.loading}
              checkboxSelection
              disableSelectionOnClick
              canEditRows
              canAddRows
              autoHeight
              density="standard"
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </DataGridProvider>
        </Box>
      </Paper>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={state.snackbar.severity}
          sx={{ width: '100%' }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
