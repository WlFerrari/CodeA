// DB factory: chooses implementation based on env
export type UserRow = {
    id: string;
    name: string;
    email: string;
    password?: string | null;
    university?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    role: 'user' | 'admin';
    score: number;
    created_at?: string;
};

export type UniversityStats = {
    university: string;
    totalScore: number;
    userCount: number;
    averageScore: number;
};

export interface DB {
    ping(): Promise<void> | void;
    createUser(u: UserRow): Promise<UserRow>;
    getUserByEmail(email: string): Promise<UserRow | undefined>;
    getUserById(id: string): Promise<UserRow | undefined>;
    incrementScore(id: string, delta: number): Promise<UserRow | undefined>;
    updateUser(u: Partial<UserRow> & { id: string }): Promise<UserRow | undefined>;
    getTopUsers(limit?: number): Promise<Array<Pick<UserRow, 'id'|'name'|'score'|'avatarUrl'>>>;
    getUniversityLeaderboard(): Promise<UniversityStats[]>;
}

let impl: DB;

const client = (process.env.DB_CLIENT || '').toLowerCase();
if (client === 'mysql' || (process.env.DB_URL || '').startsWith('mysql://')) {
    const { db } = await import('./db.mysql.js');
    impl = db as DB;
} else {
    const { db } = await import('./db.sqlite.js');
    impl = db as DB;
}

export const db = impl;
export const { createUser, getUserByEmail, getUserById, incrementScore, updateUser, getTopUsers } = db;
export const { getUniversityLeaderboard } = db;