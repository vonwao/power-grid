import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { ToolbarDataGridDemo } from '../components/DataGrid/components/toolbar/ToolbarDataGridDemo';

export default function ToolbarDemoPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DataGrid Toolbar Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This demo showcases the new modular DataGrid toolbar components.
      </Typography>
      <Box sx={{ my: 4 }}>
        <ToolbarDataGridDemo />
      </Box>
    </Container>
  );
}
