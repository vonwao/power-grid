import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Box, Button } from '@mui/material';
import EnhancedDataGridDemo from '../components/EnhancedDataGridDemo';

export default function Home() {
  return (
    <>
      <Head>
        <title>MUI X Grid Demo</title>
        <meta name="description" content="Demo application showcasing MUI X Data Grid v7 with inline editing and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box className="h-full flex-grow">
        <EnhancedDataGridDemo />
      </Box>
    </>
  );
}
