import React from 'react';
import GraphQLDataGridDemo from '../components/GraphQLDataGridDemo';

export default function GraphQLGridPage() {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">GraphQL Data Grid</h1>
      <p className="mb-4">
        This example demonstrates using Apollo Client and GraphQL to fetch data for the grid.
        The data is fetched from a GraphQL API endpoint with pagination, sorting, and filtering.
      </p>
      <div className="flex-grow">
        <GraphQLDataGridDemo />
      </div>
    </div>
  );
}