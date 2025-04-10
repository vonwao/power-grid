import React, { useState, useCallback } from 'react';
import { Paper, Box, Typography, Alert, Snackbar, Tabs, Tab } from '@mui/material';
import { EnhancedDataGridGraphQL, EnhancedColumnConfig } from '../../demos/graphql/components/EnhancedDataGridGraphQL';
import { useDataGridToolbar } from '../../components/DataGrid/hooks/toolbar/useDataGridToolbar';
import { useGraphQLData } from '../../components/DataGrid/hooks/useGraphQLData';
import { useSelectionModel } from '../../components/DataGrid/hooks/useSelectionModel';
import type { Employee, EmployeeInput, GraphQLQueryOptions, GraphQLMutationOptions } from '../../demos/graphql/types';
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
      parse: (value: string | number | null) => typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) : value
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
  const [useGraphQL, setUseGraphQL] = useState(true);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [level, setLevel] = useState(1);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Use GraphQL data hook
  const { 
    data: { employees: rows } = { employees: initialRows },
    loading,
    error,
    mutate
  } = useGraphQLData<{ employees: Employee[] }>({
    query: /* GraphQL */ `
      query GetEmployees {
        employees {
          id
          firstName
          lastName
          email
          age
          status
          department
          salary
        }
      }
    `,
    variables: {},
    enabled: useGraphQL,
    fallbackData: initialRows
  });



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
  const handleSave = useCallback(async ({ edits, additions }: { edits: Employee[], additions: Omit<Employee, 'id'>[] }) => {
    try {
      if (useGraphQL) {
        // GraphQL mutations for edits
        for (const edit of edits) {
          await mutate({
            mutation: /* GraphQL */ `
              mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
                updateEmployee(id: $id, input: $input) {
                  id
                  firstName
                  lastName
                  email
                  age
                  status
                  department
                  salary
                }
              }
            `,
            variables: {
              id: edit.id,
              input: {
                firstName: edit.firstName,
                lastName: edit.lastName,
                email: edit.email,
                age: edit.age,
                status: edit.status,
                department: edit.department,
                salary: edit.salary
              } as unknown as EmployeeInput
            },
            optimisticResponse: {
              updateEmployee: edit
            }
          });
        }

        // GraphQL mutations for additions
        for (const addition of additions) {
          await mutate({
            mutation: /* GraphQL */ `
              mutation CreateEmployee($input: EmployeeInput!) {
                createEmployee(input: $input) {
                  id
                  firstName
                  lastName
                  email
                  age
                  status
                  department
                  salary
                }
              }
            `,
            variables: {
              input: {
                firstName: addition.firstName,
                lastName: addition.lastName,
                email: addition.email,
                age: addition.age,
                status: addition.status,
                department: addition.department,
                salary: addition.salary
              } as unknown as EmployeeInput
            }
          });
        }
      } else {
        // Local state updates
        const updatedRows = [...rows];
        
        edits.forEach(edit => {
          const index = updatedRows.findIndex(row => row.id === edit.id);
          if (index !== -1) {
            updatedRows[index] = edit;
          }
        });

        additions.forEach(addition => {
          updatedRows.push({
            ...addition,
            id: Math.max(...updatedRows.map(r => r.id)) + 1
          });
        });
      }

      setSnackbar({
        open: true,
        message: 'Changes saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Save error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save changes',
        severity: 'error'
      });
    }
  }, [useGraphQL, mutate, rows]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
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

          <EnhancedDataGridGraphQL
            columns={columns}
            rows={rows}
            onSave={handleSave}
            validateRow={validateRow}
            loading={loading}
            checkboxSelection
            disableSelectionOnClick
            selectionModel={selectionModel}
            onSelectionModelChange={setSelectionModel}
            canEditRows
            canAddRows
            autoHeight
            density="standard"
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            useGraphQL={useGraphQL}
          />
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
