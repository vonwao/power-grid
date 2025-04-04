import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

// Track server status
let apolloServerHandler: any = null;

// Create and get Apollo Server instance
export const getApolloServer = async () => {
  // Create a new server instance if it doesn't exist
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable introspection in development
    introspection: process.env.NODE_ENV !== 'production',
  });

  // Start the server if it hasn't been started
  if (!apolloServerHandler) {
    await server.start();
    apolloServerHandler = server.createHandler({ path: '/api/graphql' });
  }

  return { server, handler: apolloServerHandler };
};