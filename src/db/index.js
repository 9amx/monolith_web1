import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use DATABASE_URL if available, otherwise use a dummy connection for build time
// At runtime, DATABASE_URL will be set and used
const databaseUrl = process.env.DATABASE_URL || 'postgres://dummy:dummy@dummy/dummy';
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
