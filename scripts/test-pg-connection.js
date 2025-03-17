import pg from 'pg';
const { Client } = pg;

// Connection string with properly encoded special characters
const connectionString = "postgresql://postgres.mbabelguxbendvcawgnu:Fourth_22025%23%40%21@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify";

async function testConnection() {
  console.log('Testing direct PostgreSQL connection...');
  console.log('Connection string (sanitized):', connectionString.replace(/:[^:]*@/, ':***@'));
  
  const client = new Client({
    connectionString,
  });
  
  try {
    await client.connect();
    console.log('Connection successful!');
    
    const result = await client.query('SELECT current_timestamp as time, current_database() as database');
    console.log('Query result:', result.rows[0]);
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 10
    `);
    
    console.log('Tables:', tablesResult.rows);
    
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error('Error closing connection:', e);
    }
  }
}

testConnection(); 