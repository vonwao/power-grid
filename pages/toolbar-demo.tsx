import React from 'react';
import { ToolbarDataGridDemo } from '../components/ToolbarDataGridDemo';
import { Container, Typography } from '@mui/material';

const ToolbarDemoPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        DataGrid Toolbar Demo
      </Typography>
      <Typography paragraph>
        This page demonstrates the usage of the refactored DataGrid Toolbar components. 
        You can toggle between the standard toolbar and a customized example using the button below.
      </Typography>
      <ToolbarDataGridDemo />
    </Container>
  );
};

export default ToolbarDemoPage;
