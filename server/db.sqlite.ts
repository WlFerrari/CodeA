import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DB, UniversityStats, UserRow } from './db.js';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'app.db');
const sqlite = new Database(dbFile);
sqlite.pragma('journal_mode = WAL');

sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
                                         id TEXT PRIMARY KEY,
                                         name TEXT NOT NULL,
                                         email TEXT NOT NULL UNIQUE,
                                         password TEXT,
                                         university TEXT,
                                         avatarUrl TEXT,
                                         bannerUrl TEXT,
                                         role TEXT NOT NULL DEFAULT 'user',
                                         score INTEGER NOT NULL DEFAULT 0,
                                         created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
`);

const insertUserStmt = sqlite.prepare(
    `INSERT INTO users (id, name, email, password, university, avatarUrl, bannerUrl, role, score)
     VALUES (@id, @name, @email, @password, @university, @avatarUrl, @bannerUrl, @role, COALESCE(@score, 0))`
);
const updateUserScoreStmt = sqlite.prepare(
    `UPDATE users SET score = score + @delta WHERE id = @id`
);
const findByEmailStmt = sqlite.prepare(`SELECT * FROM users WHERE email = ?`);
const findByIdStmt = sqlite.prepare(`SELECT * FROM users WHERE id = ?`);
const updateUserStmt = sqlite.prepare(
    `UPDATE users SET name=@name, university=@university, avatarUrl=@avatarUrl, bannerUrl=@bannerUrl, role=@role WHERE id=@id`
);
const topUsersStmt = sqlite.prepare(
    `SELECT id, name, score, avatarUrl FROM users WHERE score > 0 ORDER BY score DESC, created_at ASC LIMIT ?`
);
const universitiesStmt = sqlite.prepare(
    `SELECT university as university, SUM(score) as totalScore, COUNT(*) as userCount
     FROM users WHERE university IS NOT NULL AND score > 0
     GROUP BY university
     ORDER BY totalScore DESC`
);

type TopRow = Pick<UserRow, 'id'|'name'|'score'|'avatarUrl'>;

type UnivAggRow = { university: string | null; totalScore: number; userCount: number };

export const db: DB = {
    async ping() {
        sqlite.prepare('select 1').get();
    },
    async createUser(u: UserRow): Promise<UserRow> {
        insertUserStmt.run(u);
        return (await this.getUserById(u.id))!;
    },
    async getUserByEmail(email: string) {
        const row = findByEmailStmt.get(email);
        return row as UserRow | undefined;
    },
    async getUserById(id: string) {
        const row = findByIdStmt.get(id);
        return row as UserRow | undefined;
    },
    async incrementScore(id: string, delta: number) {
        const info = updateUserScoreStmt.run({ id, delta });
        if (info.changes === 0) return undefined;
        return this.getUserById(id);
    },
    async updateUser(u: Partial<UserRow> & { id: string }) {
        const payload = {
            id: u.id,
            name: u.name ?? null,
            university: u.university ?? null,
            avatarUrl: u.avatarUrl ?? null,
            bannerUrl: u.bannerUrl ?? null,
            role: u.role ?? 'user',
        } as Record<string, unknown>;
        updateUserStmt.run(payload);
        return this.getUserById(u.id);
    },
    async getTopUsers(limit = 10) {
        const rows = topUsersStmt.all(limit) as unknown as TopRow[];
        return rows;
    },
    async getUniversityLeaderboard(): Promise<UniversityStats[]> {
        const rows = universitiesStmt.all() as unknown as UnivAggRow[];
        return rows.map((r) => ({
            university: String(r.university ?? ''),
            totalScore: Number(r.totalScore || 0),
            userCount: Number(r.userCount || 0),
            averageScore: r.userCount ? Math.round(Number(r.totalScore || 0) / Number(r.userCount)) : 0,
        }));
    },
};