import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

// PostgreSQL connection parameters
const connectionParams = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false }
};

// Check if any connection parameters are missing
const missingParams = Object.entries(connectionParams)
  .filter(([key, value]) => !value && key !== 'ssl')
  .map(([key]) => key);

if (missingParams.length > 0) {
  console.error(`Missing PostgreSQL connection parameters: ${missingParams.join(', ')}`);
  console.error('Check your .env.local file and ensure all required parameters are set.');
  process.exit(1);
}

// Read SQL file
const sqlFilePath = path.join(__dirname, '..', 'sql', 'create-storage-buckets.sql');
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`SQL file read successfully: ${sqlFilePath}`);
} catch (error) {
  console.error(`Error reading SQL file: ${error.message}`);
  process.exit(1);
}

// Create PostgreSQL client
const client = new Client(connectionParams);

async function createBuckets() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully to PostgreSQL');

    console.log('Executing SQL to create storage buckets...');
    const result = await client.query(sqlContent);
    console.log('SQL executed successfully');
    
    // Display results of bucket creation
    const createBucketResults = result.filter(r => r.rows && r.rows.length > 0 && r.rows[0].create_storage_bucket);
    createBucketResults.forEach(r => {
      console.log(`- ${r.rows[0].create_storage_bucket}`);
    });

    console.log('\nStorage buckets and policies created successfully');
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
    console.log('PostgreSQL connection closed');
  }
}

createBuckets(); 