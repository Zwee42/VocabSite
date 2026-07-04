import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { getUserId } from '../../../lib/auth';
import type { User } from '../../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserId(req);
  if (!userId) return res.json(null);

  const db = getDb();
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as User | undefined;
  res.json(user || null);
}
