import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, UserRow } from './db.js';
import * as crypto from 'node:crypto';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req: express.Request, res: express.Response) => {
    try {
        await db.ping();
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false });
    }
});

function toUserRow(input: unknown): UserRow {
    const data = input as Partial<UserRow>;
    return {
        id: String(data.id ?? crypto.randomUUID()),
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        password: data.password ?? null,
        university: data.university ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        role: (data.role === 'admin' ? 'admin' : 'user'),
        score: Number(data.score ?? 0),
    };
}

app.post('/api/users/upsert', async (req: express.Request, res: express.Response) => {
    const payload = toUserRow(req.body);
    if (!payload.email || !payload.name) return res.status(400).json({ error: 'name and email are required' });

    const existingByEmail = await db.getUserByEmail(payload.email);
    const existingById = payload.id ? await db.getUserById(payload.id) : undefined;

    try {
        if (!existingByEmail && !existingById) {
            const created = await db.createUser(payload);
            return res.status(201).json(created);
        }

        const target = existingByEmail ?? (existingById as UserRow);
        const updated = await db.updateUser({
            id: target.id,
            name: payload.name ?? target.name,
            university: payload.university ?? target.university,
            avatarUrl: payload.avatarUrl ?? target.avatarUrl,
            bannerUrl: payload.bannerUrl ?? target.bannerUrl,
            role: payload.role ?? target.role,
        });
        return res.json(updated);
    } catch (e: unknown) {
        const error = e as Error;
        return res.status(500).json({ error: error.message || 'upsert failed' });
    }
});

app.post('/api/users/bulk-upsert', async (req: express.Request, res: express.Response) => {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'array body required' });
    const results: UserRow[] = [];
    try {
        for (const raw of req.body) {
            const payload = toUserRow(raw);
            if (!payload.email || !payload.name) continue;
            const existingByEmail = await db.getUserByEmail(payload.email);
            const existingById = payload.id ? await db.getUserById(payload.id) : undefined;
            if (!existingByEmail && !existingById) {
                results.push(await db.createUser(payload));
            } else {
                const target = existingByEmail ?? (existingById as UserRow);
                const updated = await db.updateUser({
                    id: target.id,
                    name: payload.name ?? target.name,
                    university: payload.university ?? target.university,
                    avatarUrl: payload.avatarUrl ?? target.avatarUrl,
                    bannerUrl: payload.bannerUrl ?? target.bannerUrl,
                    role: payload.role ?? target.role,
                });
                if (updated) results.push(updated);
            }
        }
    } catch (e: unknown) {
        const error = e as Error;
        return res.status(500).json({ error: error.message || 'bulk upsert failed' });
    }
    res.json({ count: results.length, users: results });
});

app.post('/api/users/:id/score', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const delta = Number(req.body?.delta ?? 0);
    if (!id || !Number.isFinite(delta)) return res.status(400).json({ error: 'invalid id or delta' });
    const updated = await db.incrementScore(id, delta);
    if (!updated) return res.status(404).json({ error: 'user not found' });
    res.json(updated);
});

app.post('/api/users/by-email/:email/score', async (req: express.Request, res: express.Response) => {
    const email = decodeURIComponent(req.params.email || '').trim();
    const delta = Number(req.body?.delta ?? 0);
    if (!email || !Number.isFinite(delta)) return res.status(400).json({ error: 'invalid email or delta' });
    const found = await db.getUserByEmail(email);
    if (!found) return res.status(404).json({ error: 'user not found' });
    const updated = await db.incrementScore(found.id, delta);
    if (!updated) return res.status(404).json({ error: 'user not found' });
    res.json(updated);
});

app.get('/api/users/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const user = await db.getUserById(id);
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
});

app.get('/api/leaderboard', async (req: express.Request, res: express.Response) => {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 10)));
    const users = (await db.getTopUsers(limit)).map((u, idx) => ({ ...u, rank: idx + 1 }));
    res.json({ users });
});

app.get('/api/leaderboard/universities', async (_req: express.Request, res: express.Response) => {
    const rows = await db.getUniversityLeaderboard();
    const withRank = rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
    res.json({ universities: withRank });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientDir));
app.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
});