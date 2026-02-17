import { query } from '../lib/db';

export default async function handler(req: any, res: any) {
  try {
    const data = await query('SELECT * FROM posts');
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
