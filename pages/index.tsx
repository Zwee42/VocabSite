import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { User, VocabSet } from '../lib/types';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/sets').then(r => r.json()),
    ]).then(([u, s]) => {
      setUser(u);
      setSets(s);
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
          {user ? (
            <>
              <span className="text-sm text-gray-500">{user.username}</span>
              <a href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Dashboard</a>
              <button onClick={() => fetch('/api/auth/logout').then(() => router.push('/'))} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Login</a>
              <a href="/register" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">Register</a>
            </>
          )}
        </div>
      </nav>

      <header className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Master Your Vocabulary</h1>
          <p className="text-indigo-200 text-lg mb-6">Create word sets in any language and practice with flashcards.</p>
          {!user && (
            <a href="/register" className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
              Get Started Free
            </a>
          )}
          {user && (
            <a href="/sets/new" className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
              + Create New Set
            </a>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {sets.length > 0 ? `Browse ${sets.length} vocabulary set${sets.length > 1 ? 's' : ''}` : 'No vocabulary sets yet'}
        </h2>

        {sets.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Be the first to create a set!</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {sets.map(set => (
            <div key={set.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{set.name}</h3>
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-3">
                    {set.times_trained} train{set.times_trained !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {set.source_lang} &rarr; {set.target_lang}
                  <span className="mx-2">&middot;</span>
                  by {set.username}
                </p>
                <div className="flex gap-2">
                  <a href={`/sets/${set.id}`} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">View</a>
                  <a href={`/sets/${set.id}/train`} className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">Train</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
