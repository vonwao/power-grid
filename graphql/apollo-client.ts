import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Create Apollo Client instance
export const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: '/api/graphql', // GraphQL endpoint
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

// Create a singleton instance
let apolloClient: ApolloClient<any> | null = null;

// Initialize Apollo Client
export function initializeApollo(initialState: any = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore(
      typeof initialState === 'object'
        ? { ...existingCache, ...(initialState as any) }
        : existingCache
    );
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}