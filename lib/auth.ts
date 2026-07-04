import type { NextApiRequest, NextApiResponse } from 'next';

const SESSION_COOKIE = 'vocab_session';

function parseCookies(str: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!str) return cookies;
  str.split(';').forEach(pair => {
    const [key, ...rest] = pair.split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('=').trim());
  });
  return cookies;
}

export function createSession(res: NextApiResponse, userId: number): void {
  const cookie = `${SESSION_COOKIE}=${userId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  res.setHeader('Set-Cookie', cookie);
}

export function getUserId(req: NextApiRequest): number | null {
  const cookies = parseCookies(req.headers.cookie || '');
  const val = cookies[SESSION_COOKIE];
  return val ? parseInt(val, 10) : null;
}

type ApiHandler = (req: NextApiRequest & { userId?: number }, res: NextApiResponse) => void | Promise<void>;

export function requireAuth(handler: ApiHandler): ApiHandler {
  return (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    req.userId = userId;
    return handler(req, res);
  };
}
