import React, { useState, useEffect } from 'react';
import { Box, Container, Button, FormControlLabel, Switch, Typography, Paper } from '@mui/material';
import Link from 'next/link';
import { EnhancedDataGrid } from '../components/DataGrid/EnhancedDataGrid';
import { generateEmployees } from '../utils/dataGenerator';
import { departments } from '../components/data/mockData';

/**
 * Page that displays the original grid implementation demo
 */
export default function OriginalDemoPage() {
  const [selectionModel, setSelectionModel] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Generate sample data on mount
  useEffect(() => {
    // Generate 100 employees for client-side demo
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Link href="/" passHref>
          <Button variant="outlined" color="primary">
            Back to Home
          </Button>
        </Link>
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Original Implementation Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo showcases the original implementation with the backported features:
          server-side data loading, pagination, and row selection.
        </Typography>
      </Paper>
      
      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <EnhancedDataGrid
          columns={columns}
          rows={employees}
          onSave={handleSave}
          validateRow={validateEmployeeRow}
          dataUrl="/api/employees"
          pageSize={25}
          rowHeight={30}
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
        />
      </Box>
    </Container>
  );
}