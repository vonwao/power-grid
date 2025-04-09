import React, { useState } from 'react';
import { Paper, Box, Tabs, Tab, Typography } from '@mui/material';
import { useDataGridToolbar } from '../../components/DataGrid/hooks/toolbar/useDataGridToolbar';
import { DataGridProvider } from '../../components/DataGrid/context/DataGridProvider';
import { EnhancedDataGrid, EnhancedColumnConfig } from '../../components/DataGrid/EnhancedDataGrid';
import demoConfig from './demo.json';

// Sample data
const rows = [
  { id: 1, firstName: 'John', lastName: 'Doe', age: 35, status: 'active' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28, status: 'inactive' },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 42, status: 'active' },
];

// Progressive column definitions
const baseColumns: EnhancedColumnConfig[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90,
    fieldConfig: {
      type: 'number'
    }
  },
  { 
    field: 'firstName', 
    headerName: 'First Name', 
    width: 130,
    fieldConfig: {
      type: 'string'
    }
  },
  { 
    field: 'lastName', 
    headerName: 'Last Name', 
    width: 130,
    fieldConfig: {
      type: 'string'
    }
  },
];

const editableColumns: EnhancedColumnConfig[] = baseColumns.map(col => ({
  ...col,
  editable: true,
}));

const validatedColumns: EnhancedColumnConfig[] = editableColumns.map(col => ({
  ...col,
  fieldConfig: {
    ...col.fieldConfig,
    validation: {
      required: true
    }
  }
}));

const advancedColumns: EnhancedColumnConfig[] = [
  ...validatedColumns,
  {
    field: 'age',
    headerName: 'Age',
    width: 90,
    editable: true,
    fieldConfig: {
      type: 'number',
      validation: {
        min: { value: 0, message: 'Age must be positive' },
        max: { value: 120, message: 'Age must be less than 120' }
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
        { value: 'inactive', label: 'Inactive' }
      ],
      validation: {
        required: true
      }
    }
  }
];

interface FeatureLevel {
  columns: EnhancedColumnConfig[];
  enableEditing: boolean;
  enableValidation: boolean;
  enableToolbar: boolean;
  enableCustomRendering: boolean;
}

const featureLevels: Record<number, FeatureLevel> = {
  1: { columns: baseColumns, enableEditing: false, enableValidation: false, enableToolbar: false, enableCustomRendering: false },
  2: { columns: editableColumns, enableEditing: true, enableValidation: false, enableToolbar: false, enableCustomRendering: false },
  3: { columns: validatedColumns, enableEditing: true, enableValidation: true, enableToolbar: false, enableCustomRendering: false },
  4: { columns: advancedColumns, enableEditing: true, enableValidation: true, enableToolbar: true, enableCustomRendering: false },
  5: { columns: advancedColumns, enableEditing: true, enableValidation: true, enableToolbar: true, enableCustomRendering: true }
};

export function BasicDemo() {
  const [level, setLevel] = useState(1);
  const currentFeatures = featureLevels[level];
  const { features } = demoConfig;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={level - 1}
            onChange={(_, newValue) => setLevel(newValue + 1)}
            aria-label="feature levels"
          >
            {features.map((feature, index) => (
              <Tab 
                key={feature.id}
                label={feature.title}
                id={`tab-${index}`}
                aria-controls={`tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {features[level - 1].description}
          </Typography>

          <DataGridProvider
            columns={currentFeatures.columns}
            rows={rows}
            onSave={() => {}}
          >
            <EnhancedDataGrid
              rows={rows}
              columns={currentFeatures.columns}
              checkboxSelection
              disableSelectionOnClick
              canEditRows={currentFeatures.enableEditing}
              canAddRows={currentFeatures.enableEditing}
              disableToolbar={!currentFeatures.enableToolbar}
            />
          </DataGridProvider>
        </Box>
      </Paper>
    </Box>
  );
}

