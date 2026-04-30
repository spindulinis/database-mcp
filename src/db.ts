import sql from 'mssql';
import { DB_CONFIG } from './config.js';

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    pool = await sql.connect(DB_CONFIG);
  }
  return pool;
}