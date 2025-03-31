import { NextApiRequest, NextApiResponse } from 'next';
import { employeesApiHandler } from '../../api/mockGridApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return employeesApiHandler(req, res);
}