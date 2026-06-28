import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken } from '../_lib/auth';
import { putFile } from '../_lib/github';

const CONFIG_PATH = 'frontend/public/data/countries-config.json';

interface CountriesConfigPayload {
  regionGroups: unknown[];
  sidebarTree: unknown[];
  countryThemes: Record<string, unknown>;
}

/** Saves the full country taxonomy config — used by add/edit/delete-country flows. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!verifyAdminToken(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { config } = (req.body ?? {}) as { config?: CountriesConfigPayload };
  if (
    !config ||
    typeof config !== 'object' ||
    !Array.isArray(config.regionGroups) ||
    !Array.isArray(config.sidebarTree) ||
    typeof config.countryThemes !== 'object'
  ) {
    res.status(400).json({ error: 'Invalid country config payload' });
    return;
  }

  try {
    await putFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'admin: update country config');
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save' });
  }
}
