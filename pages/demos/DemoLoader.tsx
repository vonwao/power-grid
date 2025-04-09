import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import Link from 'next/link';

interface DemoMetadata {
  id: string;
  title: string;
  description: string;
  features: Array<{
    id: string;
    title: string;
    description: string;
    level: number;
  }>;
  order: number;
  tags: string[];
}

export function DemoLoader() {
  const [demos, setDemos] = useState<DemoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDemos = async () => {
      try {
        // In a real app, we'd use a more robust method to discover demos
        // List all demo directories
        const response = await fetch('/api/demos');
        if (!response.ok) {
          throw new Error('Failed to fetch demo list');
        }
        const { demos: demoDirs } = await response.json();
        
        // Map each directory to its demo.json path
        const demoModules = demoDirs.map(dir => `/demos/${dir}/demo.json`);

        const demoData = await Promise.all(
          demoModules.map(async (path) => {
            try {
              const response = await fetch(path);
              if (!response.ok) {
                throw new Error(`Failed to load ${path}`);
              }
              return await response.json();
            } catch (e) {
              console.warn(`Failed to load demo at ${path}:`, e);
              return null;
            }
          })
        );

        const validDemos = demoData
          .filter((demo): demo is DemoMetadata => demo !== null)
          .sort((a, b) => a.order - b.order);

        setDemos(validDemos);
      } catch (e) {
        setError('Failed to load demos');
        console.error('Error loading demos:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDemos();
  }, []);

  if (loading) {
    return <Typography>Loading demos...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {demos.map((demo) => (
          <Grid item xs={12} sm={6} md={4} key={demo.id}>
            <Link href={`/demos/${demo.id}`} style={{ textDecoration: 'none' }}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {demo.title}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {demo.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {demo.tags.map((tag) => (
                      <Typography
                        key={tag}
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        {tag}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
