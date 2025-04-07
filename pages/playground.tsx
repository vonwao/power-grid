import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
} from '@mui/material';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { useDataGridToolbar } from '../components/DataGrid/hooks/toolbar/useDataGridToolbar';

// Demo presets that users can start with
const DEMO_PRESETS = {
  basic: `
function BasicToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editingRowCount
  } = useDataGridToolbar();

  return (
    <div className="flex gap-2 p-2">
      <button onClick={addRow}>Add New</button>
      {isEditing && (
        <>
          <span>Editing {editingRowCount} rows</span>
          <button onClick={saveChanges}>Save</button>
          <button onClick={cancelChanges}>Cancel</button>
        </>
      )}
    </div>
  );
}
  `,
  advanced: `
function AdvancedToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editingRowCount,
    hasValidationErrors,
    selectionModel,
    handleExport
  } = useDataGridToolbar({
    enableExport: true
  });

  return (
    <div className="flex justify-between p-2">
      <div className="flex gap-2">
        <button 
          onClick={addRow}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Add New
        </button>
        {isEditing && (
          <>
            <span>Editing {editingRowCount} rows</span>
            <button 
              onClick={saveChanges}
              disabled={hasValidationErrors}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button onClick={cancelChanges}>Cancel</button>
          </>
        )}
      </div>
      <div className="flex gap-2">
        {selectionModel.length > 0 && (
          <span>Selected: {selectionModel.length}</span>
        )}
        <button onClick={handleExport}>Export</button>
      </div>
    </div>
  );
}
  `
};

const scope = {
  useDataGridToolbar,
  // Add other necessary components/hooks here
};

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [code, setCode] = useState(DEMO_PRESETS[activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setCode(DEMO_PRESETS[newValue]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DataGrid Toolbar Playground
      </Typography>
      
      <Typography variant="body1" paragraph>
        Build your own custom toolbar using our headless hooks. Start with a preset and modify it, or create your own from scratch.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Basic Example" value="basic" />
        <Tab label="Advanced Example" value="advanced" />
      </Tabs>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Editor
            </Typography>
            <LiveProvider code={code} scope={scope} noInline>
              <LiveEditor 
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  padding: 8
                }}
              />
              <LiveError />
            </LiveProvider>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <LivePreview />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Available Props and Methods
        </Typography>
        <Typography variant="body2" component="pre" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          {`
useDataGridToolbar({
  enableFiltering?: boolean;
  enableExport?: boolean;
}) => {
  // Left section
  addRow: () => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  isEditing: boolean;
  editingRowCount: number;
  hasValidationErrors: boolean;
  canAdd: boolean;
  canSave: boolean;
  canCancel: boolean;

  // Right section
  selectionModel: Array<string | number>;
  hasSelection: boolean;
  clearSelection: () => void;
  handleFilter: () => void;
  handleExport: () => void;
}
          `.trim()}
        </Typography>
      </Box>
    </Container>
  );
}
