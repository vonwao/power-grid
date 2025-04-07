import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import Link from 'next/link';

const DEMOS = [
  {
    title: 'Interactive Playground',
    description: 'Build your own custom toolbar using our headless hooks. Try different configurations and see the results in real-time.',
    path: '/playground',
    type: 'featured'
  },
  {
    title: 'Basic Toolbar',
    description: 'Simple implementation of the DataGrid toolbar with essential features.',
    path: '/demos/basic-toolbar',
    type: 'example'
  },
  {
    title: 'Advanced Toolbar',
    description: 'Full-featured toolbar implementation with all available options.',
    path: '/demos/advanced-toolbar',
    type: 'example'
  },
  {
    title: 'CSV Import',
    description: 'Example of DataGrid with CSV import functionality.',
    path: '/demos/csv-import',
    type: 'example'
  },
  {
    title: 'GraphQL Integration',
    description: 'DataGrid connected to a GraphQL backend.',
    path: '/demos/graphql',
    type: 'integration'
  }
];

export default function DemosPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        DataGrid Demos
      </Typography>

      <Typography variant="body1" paragraph>
        Explore different implementations and use cases of our DataGrid component.
        Start with the interactive playground to build your own custom toolbar,
        or check out our pre-built examples.
      </Typography>

      <Grid container spacing={3}>
        {DEMOS.map((demo) => (
          <Grid item xs={12} md={6} lg={4} key={demo.path}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(demo.type === 'featured' && {
                  border: '2px solid primary.main'
                })
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {demo.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {demo.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Link href={demo.path} passHref>
                  <Button size="small" color="primary">
                    View Demo
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
