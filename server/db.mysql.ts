import type { DB, UniversityStats, UserRow } from './db.js';
import { createPool } from 'mysql2/promise';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

function getMysqlConfig() {
    const url = process.env.DB_URL;
    if (url) return url;
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_DATABASE || 'appdb';
    return { host, port, user, password, database } as const;
}

const cfg = getMysqlConfig();
const pool = typeof cfg === 'string' ? createPool(cfg) : createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    connectionLimit: 10,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function init() {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
                                                           id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        university VARCHAR(255) NULL,
        avatarUrl TEXT NULL,
        bannerUrl TEXT NULL,
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        score INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

const ready = init();

export const db: DB = {
    async ping() {
        await ready;
        await pool.query('SELECT 1');
    },
    async createUser(u: UserRow): Promise<UserRow> {
        await ready;
        await pool.execute(
            `INSERT INTO users (id, name, email, password, university, avatarUrl, bannerUrl, role, score)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name=VALUES(name), university=VALUES(university), avatarUrl=VALUES(avatarUrl), bannerUrl=VALUES(bannerUrl), role=VALUES(role)`,
            [u.id, u.name, u.email, u.password ?? null, u.university ?? null, u.avatarUrl ?? null, u.bannerUrl ?? null, u.role, u.score ?? 0]
        );
        return (await this.getUserById(u.id))!;
    },
    async getUserByEmail(email: string): Promise<UserRow | undefined> {
        await ready;
        const [rows] = (await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])) as [RowDataPacket[]];
        return (rows[0] as unknown) as UserRow | undefined;
    },
    async getUserById(id: string): Promise<UserRow | undefined> {
        await ready;
        const [rows] = (await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])) as [RowDataPacket[]];
        return (rows[0] as unknown) as UserRow | undefined;
    },
    async incrementScore(id: string, delta: number): Promise<UserRow | undefined> {
        await ready;
        const [res] = (await pool.execute('UPDATE users SET score = score + ? WHERE id = ?', [delta, id])) as [ResultSetHeader];
        if (!res.affectedRows) return undefined;
        return this.getUserById(id);
    },
    async updateUser(u: Partial<UserRow> & { id: string }): Promise<UserRow | undefined> {
        await ready;
        await pool.execute(
            'UPDATE users SET name=?, university=?, avatarUrl=?, bannerUrl=?, role=? WHERE id=?',
            [u.name ?? null, u.university ?? null, u.avatarUrl ?? null, u.bannerUrl ?? null, u.role ?? 'user', u.id]
        );
        return this.getUserById(u.id);
    },
    async getTopUsers(limit = 10) {
        await ready;
        const [rows] = (await pool.query(
            'SELECT id, name, score, avatarUrl FROM users WHERE score > 0 ORDER BY score DESC, created_at ASC LIMIT ?',
            [limit]
        )) as [RowDataPacket[]];
        return rows.map((r: RowDataPacket) => ({
            id: String(r.id),
            name: String(r.name),
            score: Number(r.score),
            avatarUrl: r.avatarUrl ?? null,
        }));
    },
    async getUniversityLeaderboard(): Promise<UniversityStats[]> {
        await ready;
        const [rows] = (await pool.query(
            `SELECT university, SUM(score) AS totalScore, COUNT(*) as userCount
       FROM users WHERE university IS NOT NULL AND score > 0 GROUP BY university ORDER BY totalScore DESC`
        )) as [RowDataPacket[]];
        return rows.map((r: RowDataPacket) => ({
            university: String(r.university),
            totalScore: Number(r.totalScore || 0),
            userCount: Number(r.userCount || 0),
            averageScore: r.userCount ? Math.round(Number(r.totalScore || 0) / Number(r.userCount)) : 0,
        }));
    },
};