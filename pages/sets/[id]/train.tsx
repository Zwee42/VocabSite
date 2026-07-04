import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import type { User, VocabSet, Word } from '../../../lib/types';
import { getSettings, saveSettings, type TrainerSettings } from '../../../lib/settings';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function Train() {
  const router = useRouter();
  const { id } = router.query;
  const inputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [setData, setSetData] = useState<VocabSet | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [shuffled, setShuffled] = useState<Word[]>([]);
  const [completed, setCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TrainerSettings>({ reverse: false, typing: false });

  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    if (!id) return;
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/sets/${id}`).then(r => r.json()),
    ]).then(([u, data]) => {
      if (data.error) { router.push('/'); return; }
      setUser(u);
      setSetData(data);
      const s = [...data.words].sort(() => Math.random() - 0.5);
      setShuffled(s);
      setLoaded(true);
    });
  }, [id]);

  const current = shuffled[index];
  const prompt = settings.reverse ? current?.target : current?.source;
  const expected = settings.reverse ? current?.source : current?.target;

  function advance() {
    setShowAnswer(false);
    setTyped('');
    setResult(null);
    if (index < shuffled.length - 1) {
      setIndex(i => i + 1);
    } else {
      fetch(`/api/sets/${id}/train`, { method: 'POST' }).then(() => setCompleted(true));
    }
  }

  function handleReveal() {
    if (settings.typing) return;
    setShowAnswer(true);
  }

  function handleTypingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    const correct = normalize(typed) === normalize(expected || '');
    setResult(correct ? 'correct' : 'incorrect');
    setShowAnswer(true);
  }

  function handleNext() {
    if (settings.typing && result === 'incorrect' && normalize(typed) !== normalize(expected || '')) {
      advance();
      return;
    }
    advance();
  }

  function toggleSetting(key: keyof TrainerSettings) {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveSettings(next);
      return next;
    });
    setShowAnswer(false);
    setTyped('');
    setResult(null);
  }

  useEffect(() => {
    if (settings.typing && !showAnswer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [settings.typing, showAnswer, index]);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  );

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-sm border p-10">
            <div className="text-5xl mb-4">&#127881;</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Training Complete!</h1>
            <p className="text-gray-500 mb-6">You reviewed all {shuffled.length} word{shuffled.length !== 1 ? 's' : ''}.</p>
            <div className="flex flex-col gap-3">
              <a href={`/sets/${id}/train`} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Train Again</a>
              <a href={`/sets/${id}`} className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">View Set</a>
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-lg font-bold text-indigo-600">VocabTrainer</a>
          <span className="flex-1" />
          {user && <span className="text-sm text-gray-500">{user.username}</span>}
          {user ? (
            <a href="/dashboard" className="text-sm font-medium text-indigo-600">Dashboard</a>
          ) : (
            <a href="/login" className="text-sm font-medium text-indigo-600">Login</a>
          )}
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">{setData!.name}</p>
            <p className="text-xs text-gray-400">
              {settings.reverse
                ? `${setData!.target_lang} &rarr; ${setData!.source_lang}`
                : `${setData!.source_lang} &rarr; ${setData!.target_lang}`}
              {settings.typing && <span className="ml-2 text-indigo-500 font-medium">typing</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full">
              {index + 1} / {shuffled.length}
            </span>
            <button
              onClick={() => setShowSettings(o => !o)}
              className="text-gray-400 hover:text-gray-600 transition p-1"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="absolute right-4 top-20 z-10 bg-white rounded-xl shadow-lg border p-4 w-64">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Training Settings</h3>
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reverse}
                onChange={() => toggleSetting('reverse')}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Reverse</span>
                <p className="text-xs text-gray-400">Show translation, guess the word</p>
              </div>
            </label>
            <label className="flex items-center gap-3 py-2 cursor-pointer border-t border-gray-100 mt-1 pt-3">
              <input
                type="checkbox"
                checked={settings.typing}
                onChange={() => toggleSetting('typing')}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Typing</span>
                <p className="text-xs text-gray-400">Type the answer instead of tap-to-reveal</p>
              </div>
            </label>
          </div>
        )}

        {settings.typing ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 min-h-[240px] flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-800 mb-6 text-center">{prompt}</div>

            {!showAnswer ? (
              <form onSubmit={handleTypingSubmit} className="w-full max-w-sm">
                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  placeholder="Type your answer..."
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="mt-3 w-full bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Check
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className={`text-2xl font-semibold mb-4 ${result === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                  {result === 'correct' ? 'Correct!' : 'Incorrect'}
                </div>
                <div className="text-xl text-gray-700 mb-1">
                  {settings.reverse ? setData!.target_lang : setData!.source_lang}: <span className="font-bold">{prompt}</span>
                </div>
                <div className="text-lg text-indigo-600 font-semibold mb-6">
                  {settings.reverse ? setData!.source_lang : setData!.target_lang}: {expected}
                </div>
                <button
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  onClick={handleNext}
                >
                  {index < shuffled.length - 1 ? 'Next Word' : 'Finish'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              className="bg-white rounded-2xl shadow-sm border p-12 text-center cursor-pointer select-none hover:shadow-md transition-shadow min-h-[240px] flex flex-col items-center justify-center"
              onClick={handleReveal}
            >
              <div className="text-4xl font-bold text-gray-800 mb-6">{prompt}</div>
              {showAnswer && (
                <div className="text-3xl text-indigo-600 font-semibold animate-fadeIn">{expected}</div>
              )}
              {!showAnswer && (
                <p className="text-gray-400 text-sm">Tap to reveal translation</p>
              )}
            </div>

            {showAnswer && (
              <div className="mt-6 text-center">
                <button
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  onClick={advance}
                >
                  {index < shuffled.length - 1 ? 'Next Word' : 'Finish'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
