import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { getUserId } from '../../../lib/auth';
import type { VocabSet, Word } from '../../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const { id } = req.query;

  const set = db.prepare(`
    SELECT s.*, u.username
    FROM vocab_sets s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(id) as (VocabSet & { username: string }) | undefined;
  if (!set) return res.status(404).json({ error: 'Set not found' });

  if (req.method === 'GET') {
    const words = db.prepare('SELECT id, source, target FROM words WHERE set_id = ?').all(id) as Word[];
    return res.json({ ...set, words });
  }

  if (req.method === 'DELETE') {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Login required' });
    if (set.user_id !== userId) return res.status(403).json({ error: 'Not your set' });

    db.prepare('DELETE FROM vocab_sets WHERE id = ?').run(id);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
