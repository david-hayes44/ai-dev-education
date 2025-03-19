import pg from 'pg';
const { Client } = pg;

// Database connection configuration with encoded password
const password = encodeURIComponent('Fourth_2025#@!');
const connectionString = `postgresql://postgres:${password}@db.mbabelguxbendvcawgnu.supabase.co:5432/postgres`;

async function testConnection() {
  console.log('Testing database connection...');
  
  const client = new Client({
    connectionString
  });
  
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    
    console.log('Connection test successful!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

testConnection().catch(console.error); 