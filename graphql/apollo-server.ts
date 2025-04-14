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

// Start the server
export const startServer = async () => {
  await apolloServer.start();
  return apolloServer;
};