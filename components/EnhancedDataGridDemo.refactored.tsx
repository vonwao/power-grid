import React from 'react';
import { EnhancedDataGrid } from './DataGrid';
import { employees, departments } from './data/mockData';

export default function EnhancedDataGridDemo() {
  // Column definitions with our custom validation schema format
  // that mirrors react-hook-form's format for familiarity
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
            message: 'Name must contain only letters'
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

  // Handle save
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Send to API, etc.
  };

  return (
    <EnhancedDataGrid
      columns={columns}
      rows={employees}
      onSave={handleSave}
      validateRow={validateEmployeeRow}
    />
  );
}
