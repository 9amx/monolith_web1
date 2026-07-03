import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { initCronJob } from '../lib/cron.js';

const sql = neon(process.env.DATABASE_URL || 'postgres://dummy:dummy@dummy/dummy');
export const db = drizzle(sql, { schema });

// Initialize background cron jobs when the database connection is set up
if (process.env.NODE_ENV !== 'test') {
  initCronJob();
}
