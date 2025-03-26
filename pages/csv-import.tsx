import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Box, Button } from '@mui/material';
import CSVImportDataGridDemo from '../components/CSVImportDataGridDemo';

export default function CSVImportPage() {
  return (
    <>
      <Head>
        <title>CSV Import - MUI X Grid Demo</title>
        <meta name="description" content="CSV Import feature for MUI X Data Grid" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box className="fixed top-4 left-4 z-10">
        <Link href="/" passHref>
          <Button variant="outlined" color="primary">
            Back to Main Demo
          </Button>
        </Link>
      </Box>
      
      <CSVImportDataGridDemo />
    </>
  );
}