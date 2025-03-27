import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Box, Button, Container, Typography, Card, CardContent, CardActions } from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';

export default function Home() {
  return (
    <>
      <Head>
        <title>Data Grid Implementations</title>
        <meta name="description" content="Demo application showcasing MUI X Data Grid and ag-Grid implementations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Data Grid Implementations
        </Typography>
        
        <Typography variant="h6" paragraph align="center" color="text.secondary" sx={{ mb: 6 }}>
          Explore different implementations of data grids with shared form integration, validation, and server-side capabilities
        </Typography>
        
        <MuiGrid container spacing={4} justifyContent="center">
          <MuiGrid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Original Implementation
                </Typography>
                <Typography paragraph>
                  The original implementation using MUI X Data Grid with form integration and validation.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Features: Inline editing, validation, form integration
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/original-demo" passHref>
                  <Button size="small" color="primary">
                    View Demo
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </MuiGrid>
          
          <MuiGrid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Dual Implementation
                </Typography>
                <Typography paragraph>
                  Compare MUI X Data Grid and ag-Grid implementations with the same core functionality.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Features: Switch between implementations, server-side operations, multi-row selection
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/grid-demo" passHref>
                  <Button size="small" color="primary" variant="contained">
                    View Demo
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </MuiGrid>
        </MuiGrid>
      </Container>
    </>
  );
}
