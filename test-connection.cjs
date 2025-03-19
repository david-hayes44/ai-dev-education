const { Client } = require('pg');

// Database connection configuration with encoded password
const password = encodeURIComponent('Fourth_2025#@!');
// Try different connection string format
const connectionString = `postgresql://postgres:${password}@db.mbabelguxbendvcawgnu.supabase.co:6543/postgres?ssl=true`;

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Using connection string:', connectionString.replace(password, '******'));
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    
    // Test if our tables exist
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:', tablesRes.rows.map(r => r.table_name));
    
    // Try to create our tables if they don't exist
    console.log('Creating chat_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        title TEXT NOT NULL,
        topic TEXT,
        category TEXT,
        model TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);
    
    console.log('Creating chat_messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
        metadata JSONB DEFAULT '{}'::jsonb,
        attachments JSONB DEFAULT '[]'::jsonb
      )
    `);
    
    // Verify table creation
    const verifyRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_sessions', 'chat_messages')
    `);
    
    console.log('Created tables:', verifyRes.rows.map(r => r.table_name));
    console.log('Connection test successful!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    try {
      await client.end();
    } catch (err) {
      // Ignore errors on closing
    }
    console.log('Connection closed.');
  }
}

testConnection().catch(err => {
  console.error('Unhandled error:', err);
}); 