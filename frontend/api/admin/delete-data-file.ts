import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../_lib/auth';
import { deleteFile } from '../_lib/github';

const DATA_DIR = 'frontend/public/data';
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Deletes a country's university data file — used when deleting a country entirely. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!verifyAdminToken(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { slug } = (req.body ?? {}) as { slug?: string };
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    res.status(400).json({ error: 'Invalid or missing slug' });
    return;
  }

  try {
    await deleteFile(`${DATA_DIR}/${slug}-universities.json`, `admin: delete ${slug} data file`);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete' });
  }
}
