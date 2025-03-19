import React from 'react';
import Head from 'next/head';
import DataGridDemo from '../components/DataGridDemo';

export default function Home() {
  return (
    <>
      <Head>
        <title>MUI X Grid Demo</title>
        <meta name="description" content="Demo application showcasing MUI X Data Grid v7 with inline editing and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <DataGridDemo />
    </>
  );
}
