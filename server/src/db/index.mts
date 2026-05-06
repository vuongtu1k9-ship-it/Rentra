import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.mts'

const isProd = process.env.NODE_ENV === 'production';
const connectionString = isProd
    ? process.env.DATABASE_URL
    : (process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL);

// Dùng driver chuẩn (TCP) để có thể tương thích với cả 2 loại: Local Postgres và Neon Cloud
const client = postgres(connectionString, isProd ? { ssl: 'require' } : {});
const db = drizzle(client, { schema });

export { db, client }
