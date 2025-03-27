import React from 'react';
import { Box, Container, Button } from '@mui/material';
import Link from 'next/link';
import EnhancedDataGridDemo from '../components/EnhancedDataGridDemo';

/**
 * Page that displays the original EnhancedDataGrid demo
 */
export default function OriginalDemoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <Link href="/" passHref>
          <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
            Back to Home
          </Button>
        </Link>
        <Link href="/grid-demo" passHref>
          <Button variant="contained" color="primary">
            Try Dual Implementation
          </Button>
        </Link>
      </Box>
      
      <Box sx={{ height: 'calc(100vh - 64px)' }}>
        <EnhancedDataGridDemo />
      </Box>
    </Container>
  );
}