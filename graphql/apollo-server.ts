import { ApolloServer } from 'apollo-server-micro';
import { mergedTypeDefs } from './schema';
import { resolvers } from './resolvers';

// Create Apollo Server instance
export const apolloServer = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers,
  // Enable introspection in development
  introspection: process.env.NODE_ENV !== 'production',
});

// Track server state
let serverStarted = false;

// Start the server (only if not already started)
export const startServer = async () => {
  if (!serverStarted) {
    await apolloServer.start();
    serverStarted = true;
  }
  return apolloServer;
};