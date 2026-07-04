import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { User, VocabSet } from '../lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      fetch('/api/sets').then(r => r.json()).then(all => {
        setSets(all.filter((s: VocabSet) => s.user_id === u.id));
      });
      setLoaded(true);
    });
  }, []);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-lg font-bold text-indigo-600">VocabTrainer</a>
          <span className="flex-1" />
          <span className="text-sm text-gray-500">{user!.username}</span>
          <a href="/dashboard" className="text-sm font-medium text-indigo-600">Dashboard</a>
          <button onClick={() => fetch('/api/auth/logout').then(() => router.push('/'))} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Sets</h1>
          <a href="/sets/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ New Set</a>
        </div>

        {sets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">You haven't created any sets yet.</p>
            <a href="/sets/new" className="text-indigo-600 font-medium hover:underline">Create your first set</a>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {sets.map(set => (
            <div key={set.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-800">{set.name}</h2>
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-3">
                    {set.times_trained} train{set.times_trained !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{set.source_lang} &rarr; {set.target_lang}</p>
                <div className="flex gap-2">
                  <a href={`/sets/${set.id}`} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">View</a>
                  <a href={`/sets/${set.id}/train`} className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">Train</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
