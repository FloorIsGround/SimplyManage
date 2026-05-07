// Event interface for type safety
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
}

// Get events for /events endpoint
export async function getEvents(): Promise<Event[]> {
  const res = await pool.query("SELECT id, title, description, date, location, start_time AS startTime, end_time AS endTime FROM events ORDER BY date, start_time");
  return res.rows.map((event: any) => ({
    ...event,
    date: event.date instanceof Date ? event.date.toISOString().split("T")[0] : event.date,
    startTime: event.startTime,
    endTime: event.endTime
  }));
}

// Get libraries with hours for /hourslocations endpoint
export async function getHoursLocations(): Promise<any[]> {
  // Join libraries and hours in one query
  const res = await pool.query(`
    SELECT l.id, l.name, l.address, l.phone_number,
    h.day, h.open, h.close
    FROM library l
    LEFT JOIN library_hours h ON l.id = h.library_id
    ORDER BY l.id, h.id
  `);

  // Group results by library
  const librariesMap: { [key: number]: any } = {};
  for (const row of res.rows) {
    if (!librariesMap[row.id]) {
      librariesMap[row.id] = {
        id: row.id,
        name: row.name,
        address: row.address,
        phoneNumber: row.phone_number,
        hours: []
      };
    }
    if (row.day) {
      librariesMap[row.id].hours.push({
        day: row.day,
        open: row.open,
        close: row.close
      });
    }
  }
  return Object.values(librariesMap);
}

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
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

//export const pool = g.pgPool!;
const pool = g.pgPool!;

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<{ now: string }> {
  const res = await pool.query<{ now: string }>("SELECT now() AS now");
  return res.rows[0];
}

export async function getFaqs(): Promise<Faq[]> {
  const res = await pool.query<Faq>("SELECT * FROM faqs");
  return res.rows;
}