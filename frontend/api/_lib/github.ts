/**
 * Minimal GitHub Contents API client used to commit admin edits directly
 * to the repo (which then triggers a normal Vercel deploy). No database —
 * git is the database. Requires GITHUB_TOKEN (repo write scope),
 * GITHUB_OWNER, GITHUB_REPO as Vercel env vars; GITHUB_BRANCH defaults to
 * "main".
 */

const GITHUB_API = 'https://api.github.com';

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function repoConfig() {
  return {
    owner: env('GITHUB_OWNER'),
    repo: env('GITHUB_REPO'),
    branch: process.env.GITHUB_BRANCH || 'main',
    token: env('GITHUB_TOKEN'),
  };
}

async function githubRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const { token } = repoConfig();
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body}`);
  }
  return res;
}

/** Returns the file's current sha if it exists, or null if it doesn't (404). */
export async function getFileSha(filePath: string): Promise<string | null> {
  const { owner, repo, branch } = repoConfig();
  const res = await githubRequest(`/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`);
  if (res.status === 404) return null;
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

/** Creates or updates a file via the Contents API — a real commit to the configured branch. */
export async function putFile(filePath: string, content: string, message: string): Promise<void> {
  const { owner, repo, branch } = repoConfig();
  const sha = await getFileSha(filePath);

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
  };
  if (sha) body['sha'] = sha;

  const res = await githubRequest(`/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to commit ${filePath}: ${res.status} ${await res.text()}`);
  }
}

/** Deletes a file via the Contents API. No-ops if the file doesn't exist. */
export async function deleteFile(filePath: string, message: string): Promise<void> {
  const { owner, repo, branch } = repoConfig();
  const sha = await getFileSha(filePath);
  if (!sha) return;

  const res = await githubRequest(`/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete ${filePath}: ${res.status} ${await res.text()}`);
  }
}
