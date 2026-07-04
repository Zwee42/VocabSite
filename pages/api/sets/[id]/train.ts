import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import type { VocabSet } from '../../../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const db = getDb();
  const { id } = req.query;

  const set = db.prepare('SELECT * FROM vocab_sets WHERE id = ?').get(id) as VocabSet | undefined;
  if (!set) return res.status(404).json({ error: 'Set not found' });

  db.prepare('UPDATE vocab_sets SET times_trained = times_trained + 1 WHERE id = ?').run(id);
  res.json({ ok: true, times_trained: set.times_trained + 1 });
}
