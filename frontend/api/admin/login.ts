import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signAdminToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    res.status(500).json({ error: 'Admin credentials are not configured on the server (ADMIN_USERNAME/ADMIN_PASSWORD).' });
    return;
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  try {
    res.status(200).json({ token: signAdminToken() });
  } catch {
    res.status(500).json({ error: 'Server is missing ADMIN_JWT_SECRET configuration.' });
  }
}
