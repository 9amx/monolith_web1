import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Asew3aNGRt0O@ep-withered-lake-ahwpwdd0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  const result = await sql`SELECT email, role, has_dashboard_access FROM users WHERE email='olialkonok2@gmail.com'`;
  console.log('User:', result);
}
run().catch(console.error);
