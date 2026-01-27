import pg from 'pg';

const { Pool } = pg;
// we use a global pool to prevent creating new pool on every reload for dev 
let pool;

if(!global.pgPool) {
    global.pgPool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false } //ssl connection required
    });
}

pool = global.pgPool;

export async function query(text, params) {
    return pool.query(text, params);
}

export async function testConnection() {
  const res = await pool.query("SELECT now() AS now");
  return res.rows[0];
}
