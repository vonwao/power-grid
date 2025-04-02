import React, { useState } from 'react';
import { Box } from '@mui/material';
import { EnhancedDataGrid } from './DataGrid';
import { employees, departments } from './data/mockData';

export default function EnhancedDataGridDemo() {
  /**
   * State Management:
   * - serverSide: Controls whether data is fetched from server or used locally
   *   When true, the dataUrl prop is set to '/api/employees'
   *   When false, the local 'employees' array is used directly
   * - selectionModel: Tracks which rows are currently selected
   *   This is passed to the grid and updated when selection changes
   */
  const [serverSide, setServerSide] = useState(true);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);
  
  /**
   * Column Definitions:
   * Each column has configuration for:
   * - display (field, headerName, width)
   * - editability (editable)
   * - data type and validation (fieldConfig)
   *
   * The fieldConfig object defines:
   * - type: The data type (string, number, date, boolean, select)
   * - validation: Rules for validating user input
   * - options: For select fields, the available choices
   */
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

  /**
   * Row-Level Validation:
   * This function validates the entire row after individual field validation.
   * It's used for cross-field validation rules that can't be expressed
   * in individual field validation.
   *
   * In this example:
   * - If an employee is in the Engineering department (id: 1)
   * - They must be at least 21 years old
   * - This is a business rule that spans multiple fields
   *
   * @param values - All values for the current row being validated
   * @returns An object with field names as keys and error messages as values
   */
  const validateEmployeeRow = (values: any) => {
    const errors: Record<string, string> = {};
    
    // Engineering department requires employees to be at least 21
    if (values.departmentId === 1 && values.age < 21) {
      errors.age = 'Engineering department requires age 21+';
    }
    
    return errors;
  };

  /**
   * Save Handler:
   * Called when changes are saved in the grid.
   *
   * @param changes - Object containing:
   *   - edits: Array of modified existing rows
   *   - additions: Array of newly added rows
   *
   * In a real application, this would:
   * 1. Send the changes to an API endpoint
   * 2. Handle success/failure responses
   * 3. Update local state accordingly
   */
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // In production: Send to API, handle responses, update state
  };
  
  // Note: The following handlers are defined but not currently used.
  // They would be connected to toolbar buttons in a complete implementation.

  /**
   * Component Rendering:
   * The EnhancedDataGrid component is configured with:
   *
   * 1. Data Configuration:
   *    - columns: Column definitions with validation rules
   *    - rows: Data to display (from mockData)
   *    - validateRow: Cross-field validation function
   *
   * 2. Server Integration:
   *    - dataUrl: When serverSide is true, data is fetched from this endpoint
   *      Otherwise, client-side data (employees array) is used
   *
   * 3. Selection Configuration:
   *    - checkboxSelection: Enables row selection checkboxes
   *    - selectionModel: Currently selected rows
   *    - onSelectionModelChange: Updates selection state when user selects rows
   *
   * 4. Grid Capabilities:
   *    - canAddRows: Set to false to hide the Add button in the toolbar
   *      This prevents users from adding new rows to the grid
   *
   * 5. UI Configuration:
   *    - rowHeight: Compact row height for dense data display
   *    - pageSize: Number of rows per page
   */
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <div>Enhanced Grid Demo</div>
      <EnhancedDataGrid
        // Data configuration
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
        
        // Grid capabilities
        canAddRows={false} // Explicitly disable the Add button
        
        // UI options
        rowHeight={30}
        pageSize={25}
      />
    </Box>
  );
}