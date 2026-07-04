import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { getUserId, requireAuth } from '../../../lib/auth';
import type { VocabSet } from '../../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    const sets = db.prepare(`
      SELECT s.*, u.username
      FROM vocab_sets s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
    `).all() as VocabSet[];
    return res.json(sets);
  }

  if (req.method === 'POST') {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Login required to create sets' });

    const { name, source_lang, target_lang, words } = req.body;
    if (!name || !words || !words.length) {
      return res.status(400).json({ error: 'Name and words required' });
    }

    const insertSet = db.prepare('INSERT INTO vocab_sets (user_id, name, source_lang, target_lang) VALUES (?, ?, ?, ?)');
    const insertWord = db.prepare('INSERT INTO words (set_id, source, target) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
      const result = insertSet.run(userId, name, source_lang || 'Arabic', target_lang || 'English');
      const setId = result.lastInsertRowid as number;
      for (const w of words) {
        insertWord.run(setId, w.source, w.target);
      }
      return setId;
    });

    const setId = transaction();
    return res.json({ id: setId, name });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
