import React from 'react';
import { EnhancedDataGrid, EnhancedColumnConfig } from './DataGrid/EnhancedDataGrid';
import { employees } from './data/mockData';

// Define column configurations
const columns: EnhancedColumnConfig[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 70,
    fieldConfig: {
      type: 'number',
    },
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
    editable: true,
    fieldConfig: {
      type: 'string',
      validation: {
        required: 'Name is required',
      },
    },
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
    editable: true,
    fieldConfig: {
      type: 'string',
      validation: {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      },
    },
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
    editable: true,
    fieldConfig: {
      type: 'number',
      validation: {
        min: { value: 0, message: 'Age must be positive' },
        max: { value: 120, message: 'Age must be less than 120' },
      },
    },
  },
  {
    field: 'birthday',
    headerName: 'Birthday',
    width: 150,
    editable: true,
    fieldConfig: {
      type: 'date',
    },
  },
  {
    field: 'active',
    headerName: 'Active',
    width: 100,
    editable: true,
    fieldConfig: {
      type: 'boolean',
    },
  },
  {
    field: 'departmentId',
    headerName: 'Department',
    width: 150,
    editable: true,
    fieldConfig: {
      type: 'select',
      options: [
        { value: 1, label: 'Engineering' },
        { value: 2, label: 'Marketing' },
        { value: 3, label: 'Sales' },
        { value: 4, label: 'Finance' },
        { value: 5, label: 'Human Resources' },
        { value: 6, label: 'Research & Development' },
        { value: 7, label: 'Customer Support' },
        { value: 8, label: 'Operations' },
        { value: 9, label: 'Legal' },
        { value: 10, label: 'Product Management' },
      ],
    },
  },
];

export const UnifiedToolbarDataGridDemo: React.FC = () => {
  // State for selection model
  const [selectionModel, setSelectionModel] = React.useState<any[]>([]);
  
  // Debug: Log selection model changes
  React.useEffect(() => {
    console.log('UnifiedToolbarDataGridDemo - selectionModel:', selectionModel);
  }, [selectionModel]);
  
  // Handle save changes
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Changes saved:', changes);
  };

  return (
    <div className="p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">Unified Toolbar Data Grid Demo</h1>
      <div className="h-[calc(100vh-120px)]">
        <EnhancedDataGrid
          columns={columns}
          rows={employees}
          onSave={handleSave}
          checkboxSelection
          autoHeight={false}
          canEditRows={true}
          canAddRows={false}
          canSelectRows={true}
          dataUrl="/api/employees"
          selectionModel={selectionModel}
          onSelectionModelChange={setSelectionModel}
        />
      </div>
    </div>
  );
};