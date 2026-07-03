import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { initCronJob } from '../lib/cron.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

// Initialize background cron jobs when the database connection is set up
if (process.env.NODE_ENV !== 'test') {
  initCronJob();
}

