import { NextApiRequest, NextApiResponse } from 'next';
import { startServer } from '../../graphql/apollo-server';

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// GraphQL API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.status(200).end();
    return;
  }
  
  try {
    // Start Apollo Server
    const server = await startServer();
    
    // Create handler
    const handler = server.createHandler({ path: '/api/graphql' });
    
    // Run the handler
    await handler(req, res);
  } catch (error) {
    console.error('GraphQL API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}