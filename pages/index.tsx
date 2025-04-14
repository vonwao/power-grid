import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material';

export default function Home() {
  return (
    <>
      <Head>
        <title>MUI X Grid Demo</title>
        <meta name="description" content="Demo application showcasing MUI X Data Grid v7 with inline editing and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box className="container mx-auto p-4">
        <Typography variant="h3" component="h1" gutterBottom>
          Data Grid Demos
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  REST API Grid
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Traditional REST API implementation for data fetching with pagination, sorting, and filtering.
                </Typography>
                <Link href="/" passHref>
                  <Button variant="contained" component="a">View Demo</Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  GraphQL Grid
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Modern GraphQL implementation using Apollo Client for data fetching with pagination, sorting, and filtering.
                </Typography>
                <Link href="/graphql-grid" passHref>
                  <Button variant="contained" component="a" color="primary">View Demo</Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  MTM History with Relay Pagination
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  GraphQL implementation using Relay-style cursor-based pagination for efficient data fetching.
                </Typography>
                <Link href="/mtm-history" passHref>
                  <Button variant="contained" component="a" color="secondary">View Demo</Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Unified Toolbar
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Enhanced grid with a unified toolbar for better user experience.
                </Typography>
                <Link href="/unified-toolbar" passHref>
                  <Button variant="contained" component="a">View Demo</Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
