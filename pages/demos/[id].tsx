import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { BasicDemo } from '../../demos/basic/BasicDemo';

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

const demos = {
  basic: BasicDemo,
  // Add other demos here as they're implemented
};

export default function DemoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [metadata, setMetadata] = useState<DemoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDemoMetadata = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        const response = await fetch(`/demos/${id}/demo.json`);
        if (!response.ok) {
          throw new Error(`Failed to load demo metadata for ${id}`);
        }
        const data = await response.json();
        setMetadata(data);
      } catch (e) {
        console.error('Error loading demo metadata:', e);
        setError('Failed to load demo metadata');
      } finally {
        setLoading(false);
      }
    };

    loadDemoMetadata();
  }, [id]);

  if (!id || typeof id !== 'string') {
    return <Typography>Invalid demo ID</Typography>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !metadata) {
    return <Typography color="error">{error || 'Demo not found'}</Typography>;
  }

  const DemoComponent = demos[id as keyof typeof demos];
  if (!DemoComponent) {
    return <Typography>Demo {id} not implemented yet</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {metadata.title}
      </Typography>
      <Typography color="textSecondary" paragraph>
        {metadata.description}
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <DemoComponent />
      </Box>
    </Container>
  );
}
