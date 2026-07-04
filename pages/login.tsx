import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-indigo-600">VocabTrainer</a>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Login</h1>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition" type="submit">Login</button>
          <p className="text-sm text-gray-500 text-center mt-4">Don't have an account? <a href="/register" className="text-indigo-600 font-medium hover:underline">Register</a></p>
        </form>
      </div>
    </div>
  );
}
