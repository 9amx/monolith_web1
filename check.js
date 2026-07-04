require('dotenv').config({path: '.env.local'});
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function check() {
  const r = await db.execute(`SELECT * FROM users WHERE email LIKE '%minzu%'`);
  console.log(r.rows);
}
check().catch(console.error);
