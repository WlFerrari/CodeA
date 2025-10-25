import { useEffect } from 'react';
import { api } from '@/lib/api';

type LocalUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  university?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  role?: 'user' | 'admin';
  score?: number;
};

// On app start, try to persist all locally stored users to the backend DB.
export default function BulkSync() {
  useEffect(() => {
    (async () => {
      try {
        const health = await api.health();
        if (!health?.ok) return;
        const raw = localStorage.getItem('academic_users');
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return;
        const users = parsed as LocalUser[];
        const payload = users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password ?? null,
          university: u.university ?? null,
          avatarUrl: u.avatarUrl ?? null,
          bannerUrl: u.bannerUrl ?? null,
          role: u.role ?? 'user',
          score: u.score ?? 0,
        }));
        await api.bulkUpsert(payload);
      } catch {
        // ignore network/backend errors; app can run offline
      }
    })();
  }, []);
  return null;
}
