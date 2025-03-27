import React from 'react';
import { Box, Container, Button } from '@mui/material';
import Link from 'next/link';
import GridImplementationDemo from '../components/GridImplementationDemo';

/**
 * Page that displays the grid implementation demo
 */
export default function GridDemoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Link href="/" passHref>
          <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
            Back to Home
          </Button>
        </Link>
        <Link href="/original-demo" passHref>
          <Button variant="contained" color="primary">
            Original Implementation
          </Button>
        </Link>
      </Box>
      
      <Box sx={{ height: 'calc(100vh - 64px)' }}>
        <GridImplementationDemo />
      </Box>
    </Container>
  );
}