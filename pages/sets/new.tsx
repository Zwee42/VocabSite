import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { User } from '../../lib/types';

export default function NewSet() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [sourceLang, setSourceLang] = useState('Arabic');
  const [targetLang, setTargetLang] = useState('English');
  const [wordCount, setWordCount] = useState(5);
  const [words, setWords] = useState<{ source: string; target: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      const arr = [];
      for (let i = 0; i < 5; i++) arr.push({ source: '', target: '' });
      setWords(arr);
    });
  }, []);

  function handleCountChange(val: string) {
    const c = Math.max(1, Math.min(100, parseInt(val) || 1));
    setWordCount(c);
    setWords(prev => {
      const copy = [...prev];
      while (copy.length < c) copy.push({ source: '', target: '' });
      return copy.slice(0, c);
    });
  }

  function updateWord(i: number, field: 'source' | 'target', value: string) {
    setWords(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    const filtered = words.filter(w => w.source.trim() && w.target.trim());
    if (filtered.length === 0) { setError('Add at least one word'); return; }

    const res = await fetch('/api/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, source_lang: sourceLang, target_lang: targetLang, words: filtered }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/sets/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-lg font-bold text-indigo-600">VocabTrainer</a>
          <span className="flex-1" />
          <span className="text-sm text-gray-500">{user.username}</span>
          <a href="/dashboard" className="text-sm font-medium text-indigo-600">Dashboard</a>
          <button onClick={() => fetch('/api/auth/logout').then(() => router.push('/'))} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">New Vocabulary Set</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Set Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Week 1 words" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Language</label>
              <input value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
              <input value={targetLang} onChange={e => setTargetLang(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Words</label>
          <input type="number" min="1" value={wordCount} onChange={e => handleCountChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-w-[120px]" />

          <h3 className="text-base font-semibold text-gray-800 mb-3">Words</h3>
          {words.map((w, i) => (
            <div key={i} className="flex gap-3 mb-2">
              <input value={w.source} onChange={e => updateWord(i, 'source', e.target.value)} placeholder={`${sourceLang} word`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <input value={w.target} onChange={e => updateWord(i, 'target', e.target.value)} placeholder={`${targetLang} translation`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <button className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition" type="submit">Create Set</button>
        </form>
      </div>
    </div>
  );
}
