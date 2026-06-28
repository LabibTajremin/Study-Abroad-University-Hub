import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../_lib/auth';
import { putFile } from '../_lib/github';

const DATA_DIR = 'frontend/public/data';
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Saves the full updated university list for one country — commits directly to the repo. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!verifyAdminToken(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { slug, universities } = (req.body ?? {}) as { slug?: string; universities?: unknown };
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    res.status(400).json({ error: 'Invalid or missing slug' });
    return;
  }
  if (!Array.isArray(universities)) {
    res.status(400).json({ error: 'universities must be an array' });
    return;
  }

  try {
    await putFile(
      `${DATA_DIR}/${slug}-universities.json`,
      JSON.stringify(universities, null, 2),
      `admin: update ${slug} universities (${universities.length} records)`
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save' });
  }
}
