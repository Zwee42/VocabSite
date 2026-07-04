import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { User, VocabSet } from '../../lib/types';

export default function ViewSet() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [setData, setSetData] = useState<VocabSet | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/sets/${id}`).then(r => r.json()),
    ]).then(([u, data]) => {
      if (data.error) { router.push('/'); return; }
      setUser(u);
      setSetData(data);
      setLoaded(true);
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this set?')) return;
    const res = await fetch(`/api/sets/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard');
    else alert('You must be the owner to delete this set.');
  }

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  );

  const isOwner = user && setData && user.id === setData.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-lg font-bold text-indigo-600">VocabTrainer</a>
          <span className="flex-1" />
          {user ? (
            <>
              <span className="text-sm text-gray-500">{user.username}</span>
              <a href="/dashboard" className="text-sm font-medium text-indigo-600">Dashboard</a>
              <button onClick={() => fetch('/api/auth/logout').then(() => router.push('/'))} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
            </>
          ) : (
            <a href="/login" className="text-sm font-medium text-indigo-600">Login</a>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{setData!.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {setData!.source_lang} &rarr; {setData!.target_lang}
              <span className="mx-2">&middot;</span>
              by {setData!.username}
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
            Trained {setData!.times_trained} time{setData!.times_trained !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left text-sm font-semibold text-gray-600 px-4 py-3 w-1/2">{setData!.source_lang}</th>
                <th className="text-left text-sm font-semibold text-gray-600 px-4 py-3 w-1/2">{setData!.target_lang}</th>
              </tr>
            </thead>
            <tbody>
              {setData!.words!.map((w, i) => (
                <tr key={w.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 text-gray-800 font-medium">{w.source}</td>
                  <td className="px-4 py-3 text-gray-600">{w.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-3">
          <a href={`/sets/${id}/train`} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Start Training</a>
          {isOwner && (
            <button onClick={handleDelete} className="bg-red-50 text-red-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
