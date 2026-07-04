require('dotenv').config({path: '.env.local'});
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  await db.execute(`UPDATE users SET role = 'Admin', has_dashboard_access = true WHERE email = 'minzu.bd.123@gmail.com'`);
  console.log("Updated minzu.bd.123@gmail.com to Admin");
}
main().catch(console.error);
