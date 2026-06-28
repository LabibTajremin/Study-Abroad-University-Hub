import jwt from 'jsonwebtoken';

/**
 * Admin auth: a stateless signed token (no database/session store). The
 * server signs a token with ADMIN_JWT_SECRET (a Vercel env var, never sent
 * to the browser) after verifying ADMIN_USERNAME/ADMIN_PASSWORD; the client
 * stores the token and sends it back as a Bearer header on every admin
 * write request. Without the secret, a token can't be forged.
 */

interface AdminTokenPayload {
  admin: true;
}

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not configured');
  }
  return secret;
}

export function signAdminToken(): string {
  return jwt.sign({ admin: true } satisfies AdminTokenPayload, getSecret(), { expiresIn: '8h' });
}

export function verifyAdminToken(authHeader: string | string[] | undefined): boolean {
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, getSecret()) as AdminTokenPayload;
    return payload.admin === true;
  } catch {
    return false;
  }
}
