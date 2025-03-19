import React from 'react';
import { 
  EnhancedDataGrid, 
  StringFieldType, 
  NumberFieldType,
  DateFieldType,
  BooleanFieldType,
  SelectFieldType,
  PatternRule,
  MinRule,
  MaxRule
} from './DataGrid';
import { employees, departments } from './data/mockData';

export default function EnhancedDataGridDemo() {
  // Create field type instances
  const stringField = new StringFieldType();
  const numberField = new NumberFieldType();
  const dateField = new DateFieldType();
  const booleanField = new BooleanFieldType();
  
  // Create a select field for departments
  const departmentField = new SelectFieldType({
    options: departments,
    labelKey: 'label',
    valueKey: 'id'
  });
  
  // Column definitions
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70, 
      fieldType: numberField,
      editable: false 
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 180, 
      fieldType: stringField,
      required: true, // Special case for required fields
      validationRules: [
        new PatternRule(/^[A-Za-z\s]+$/, 'Name must contain only letters')
      ],
      editable: true
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100, 
      fieldType: numberField,
      required: true,
      validationRules: [
        new MinRule(18, 'Age must be at least 18'),
        new MaxRule(100, 'Age must be at most 100')
      ],
      editable: true
    },
    { 
      field: 'birthday', 
      headerName: 'Birthday', 
      width: 150, 
      fieldType: dateField,
      editable: true
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 120, 
      fieldType: booleanField,
      editable: true
    },
    { 
      field: 'departmentId', 
      headerName: 'Department', 
      width: 220, 
      fieldType: departmentField,
      required: true,
      editable: true
    },
  ];

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
    />
  );
}
