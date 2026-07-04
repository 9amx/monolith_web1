require('dotenv').config({path: '.env.local'});
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function check() {
  const email1 = 'minzu.bd.123@gmail.com';
  const email2 = 'minzu.bd.123gmail.com';

  const r1 = await db.execute(\SELECT * FROM users WHERE email = '\'\);
  if (r1.rows.length > 0) {
    console.log('Found with @gmail.com!');
    await db.execute(\UPDATE users SET role = 'Admin', has_dashboard_access = true WHERE email = '\'\);
    console.log('Updated to Admin.');
  } else {
    const r2 = await db.execute(\SELECT * FROM users WHERE email = '\'\);
    if (r2.rows.length > 0) {
      console.log('Found without @!');
      await db.execute(\UPDATE users SET role = 'Admin', has_dashboard_access = true WHERE email = '\'\);
      console.log('Updated to Admin.');
    } else {
      console.log('User not found in DB.');
    }
  }
}
check().catch(console.error);
