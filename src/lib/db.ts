import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pool: Pool };

// On Vercel each function instance is short-lived. Keep pool size at 1 to avoid
// exhausting Neon's connection limit across concurrent cold-start instances.
// In local dev, max:5 gives better parallel query throughput.
const POOL_MAX = process.env.NODE_ENV === 'production' ? 1 : 5;

export const pool = globalForPg.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Only cache pool on globalThis in dev (Next.js hot-reload guard).
// In production, each invocation gets its own short-lived pool.
if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
