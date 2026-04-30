import { PoolOptions } from 'mysql2/promise';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

function requireEnvInt(name: string): number {
  const raw = requireEnv(name);
  const value = parseInt(raw, 10);
  if (isNaN(value)) {
    throw new Error(`Environment variable ${name} must be an integer, got ${raw}`);
  }
  return value;
}

export const DB_CONFIG: PoolOptions = {
  host: requireEnv('DB_SERVER'),
  port: requireEnvInt('DB_PORT'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_DATABASE'),
  connectTimeout: requireEnvInt('DB_CONNECTION_TIMEOUT'),
};
