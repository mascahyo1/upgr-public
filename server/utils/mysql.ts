import mysql from 'mysql2/promise'
import { SCHEMA, BACKFILL_COLUMNS } from '../models/schema'

let _pool: mysql.Pool | null = null
let _schemaReady: Promise<void> | null = null

export function pool() {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DB || 'upgr_dev',
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    })
  }
  return _pool
}

export function ensureSchema() {
  if (!_schemaReady) {
    _schemaReady = (async () => {
      const conn = await pool().getConnection()
      try {
        for (const stmt of SCHEMA.split(';')) {
          const s = stmt.trim()
          if (s) await conn.query(s)
        }
        for (const sql of BACKFILL_COLUMNS) {
          try {
            await conn.query(sql)
          } catch (e: any) {
            if (e?.errno !== 1060) throw e
          }
        }
      } finally {
        conn.release()
      }
    })()
  }
  return _schemaReady
}

export async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  await ensureSchema()
  const [rows] = await pool().query(sql, params)
  return rows as T[]
}

export async function qOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params)
  return rows[0] ?? null
}

export async function tx<T>(work: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  await ensureSchema()
  const conn = await pool().getConnection()
  try {
    await conn.beginTransaction()
    const out = await work(conn)
    await conn.commit()
    return out
  } catch (e) {
    try { await conn.rollback() } catch {}
    throw e
  } finally {
    conn.release()
  }
}
