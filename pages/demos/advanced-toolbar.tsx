import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { AdvancedToolbarDemo } from '../../components/DataGrid/demos/AdvancedToolbarDemo';

export default function AdvancedToolbarDemoPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Advanced Toolbar Demo
      </Typography>

      <Typography variant="body1" paragraph>
        This demo showcases a full-featured DataGrid toolbar with editing capabilities,
        row selection, filtering, and export functionality. The toolbar uses our headless
        hooks to provide a rich user experience while maintaining flexibility in the UI.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <AdvancedToolbarDemo />
      </Box>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated
        </Typography>
        <ul className="list-disc pl-6 space-y-2">
          <li>Row addition and editing with validation</li>
          <li>Multi-row selection with clear functionality</li>
          <li>Data filtering capabilities</li>
          <li>Export functionality</li>
          <li>Status indicators for editing and validation</li>
          <li>Responsive design with modern styling</li>
        </ul>
      </Paper>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Details
        </Typography>
        <Typography variant="body2" component="div">
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
{`// Hook setup
const {
  addRow,
  saveChanges,
  cancelChanges,
  isEditing,
  editingRowCount,
  hasValidationErrors,
  selectionModel,
  // ... other props
} = useDataGridToolbar({
  enableFiltering: true,
  enableExport: true
});`}
          </pre>
        </Typography>
      </Paper>
    </Container>
  );
}
