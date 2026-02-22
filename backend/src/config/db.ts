import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { Faq } from "../models/libraryInfo/faqs.js";

// Use a global pool to prevent creating a new pool on every reload (dev).
type GlobalWithPool = typeof globalThis & { pgPool?: Pool };

// look to .env for DB_SSL setting
const sslEnabled = String(process.env.DB_SSL || "").toLowerCase() === "true";

const g = globalThis as GlobalWithPool;

//create pool once
if (!g.pgPool) {
  g.pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD ?? ""),
    database: process.env.DB_NAME,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false // enable only if DB supports SSL
  });
}

const pool = g.pgPool!;

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function testConnection(): Promise<{ now: string }> {
  const res = await pool.query<{ now: string }>("SELECT now() AS now");
  return res.rows[0];
}

export async function getFaqs(): Promise<Faq[]> {
  const res = await pool.query<Faq>("SELECT * FROM faqs");
  return res.rows;
}
