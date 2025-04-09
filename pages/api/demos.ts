import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const publicDemosPath = path.join(process.cwd(), 'public', 'demos');
    const demos = fs.readdirSync(publicDemosPath)
      .filter(file => fs.statSync(path.join(publicDemosPath, file)).isDirectory());

    res.status(200).json({ demos });
  } catch (error) {
    console.error('Error reading demos directory:', error);
    res.status(500).json({ error: 'Failed to list demos' });
  }
}
