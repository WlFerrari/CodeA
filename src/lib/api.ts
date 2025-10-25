export type LeaderboardUser = { id: string; name: string; score: number; avatarUrl?: string; rank?: number };
export type UniversityRanking = { university: string; totalScore: number; userCount: number; averageScore: number; rank?: number };

const API_BASE = import.meta.env.VITE_API_URL || '';

async function http<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  health: () => http<{ ok: boolean }>(`/api/health`).catch(() => ({ ok: false } as any)),
  upsertUser: (user: any) => http(`/api/users/upsert`, { method: 'POST', body: JSON.stringify(user) }),
  bulkUpsert: (users: any[]) => http(`/api/users/bulk-upsert`, { method: 'POST', body: JSON.stringify(users) }),
  incrementScore: (id: string, delta: number) => http(`/api/users/${id}/score`, { method: 'POST', body: JSON.stringify({ delta }) }),
  incrementScoreByEmail: (email: string, delta: number) => http(`/api/users/by-email/${encodeURIComponent(email)}/score`, { method: 'POST', body: JSON.stringify({ delta }) }),
  getLeaderboard: (limit = 10) => http<{ users: LeaderboardUser[] }>(`/api/leaderboard?limit=${limit}`),
  getUniversityLeaderboard: () => http<{ universities: UniversityRanking[] }>(`/api/leaderboard/universities`),
};
