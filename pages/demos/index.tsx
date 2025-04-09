import React from 'react';
import { Container, Typography } from '@mui/material';
import { DemoLoader } from './DemoLoader';

export default function DemosPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        EnhancedDataGrid Demos
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Explore different features and use cases of the EnhancedDataGrid component
      </Typography>
      
      <DemoLoader />


    </Container>
  );
}
