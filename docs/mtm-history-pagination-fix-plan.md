# MTM History Pagination Fix Plan

## Issue

We're encountering a "Too many re-renders" error when using GraphQL fetching with the `EnhancedDataGridGraphQL` component. The error occurs specifically when:

1. The GraphQL fetching is enabled (`useGraphQLFetching` is set to `true`)
2. The component is using Relay-style cursor-based pagination (`paginationStyle="cursor"`)

The root cause appears to be related to how the DynamoDB backend requires a key condition for queries, but our GraphQL integration isn't properly handling this requirement.

## Error Details

The specific error from DynamoDB is:

```
"Either the KeyConditions or KeyConditionExpression parameter must be specified in the request."
```

This is a common requirement for DynamoDB queries, which need a partition key (and optionally a sort key) to be specified in the query.

## Solution Approaches

### 1. Client-Side Workaround (Immediate Fix)

The simplest workaround is to use client-side data instead of GraphQL fetching. This works because the sample data is already available in the component.

```tsx
// In pages/mtm-history.tsx
const [useGraphQLFetching, setUseGraphQLFetching] = useState(false); // Start with client-side data
```

### 2. Backend Fix (Proper Solution)

The proper solution is to modify the backend to handle the DynamoDB key condition requirement:

1. **Modify the GraphQL resolver**: Update the `mtm-history.ts` resolver to handle the case when no filter is provided by using a default filter or by not enforcing the key condition requirement in development/testing environments.

2. **Add a default filter**: When using GraphQL fetching, always provide a default filter that includes the necessary key condition:

```tsx
// In pages/mtm-history.tsx
variables={{
  filter: JSON.stringify({
    commodity: "Oil" // This is just an example, adjust as needed for your DynamoDB key
  })
}}
```

3. **Fix the Apollo Server setup**: Ensure the Apollo Server is properly handling multiple requests by tracking its state:

```typescript
// In graphql/apollo-server.ts
let serverStarted = false;

export const startServer = async () => {
  if (!serverStarted) {
    await apolloServer.start();
    serverStarted = true;
  }
  return apolloServer;
};
```

### 3. Optimize the useRelayGraphQLData Hook

The `useRelayGraphQLData` hook might be causing re-renders due to how it handles variables and dependencies:

1. Simplify variable creation to avoid recreating objects on every render
2. Use separate `useEffect` hooks for pagination and filtering/sorting
3. Use stable references for variables in the `useEffect` hooks

## Implementation Plan

1. Start with the client-side workaround to get the component working
2. Implement the backend fixes to properly handle the DynamoDB key condition
3. Optimize the `useRelayGraphQLData` hook to avoid unnecessary re-renders
4. Test with GraphQL fetching enabled

## Testing

After implementing the fixes, test the following scenarios:

1. Client-side data (useGraphQLFetching = false)
2. GraphQL fetching with default filter (useGraphQLFetching = true)
3. GraphQL fetching with user-provided filter
4. Pagination, sorting, and filtering with both client-side and server-side data

## Long-term Recommendations

1. Add proper error handling in the GraphQL resolvers
2. Add validation for required parameters in the GraphQL schema
3. Consider using a more robust approach for DynamoDB integration, such as the AWS AppSync DynamoDB resolver
4. Add comprehensive logging to help diagnose similar issues in the future