// Load environment variables from .env.local first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment variables:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? SUPABASE_URL : 'MISSING'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'Present (Key hidden)' : 'MISSING'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables. Check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const testReportId = crypto.randomUUID();
const testDocId = crypto.randomUUID();

async function testSupabase() {
  try {
    // Test basic connection
    console.log('\nTesting basic Supabase connection...');
    const { data, error } = await supabase.from('reports').select('count');
    
    if (error) {
      if (error.code === '42P01') {
        console.error('Error: The "reports" table does not exist. You need to run the SQL setup script.');
      } else {
        console.error('Error connecting to Supabase:', error.message);
      }
      return;
    }
    
    console.log('Connected to Supabase successfully!');
    
    // Test inserting a report
    console.log('\nTesting report creation...');
    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        id: testReportId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating test report:', insertError.message);
      return;
    }
    
    console.log(`Successfully created test report with ID: ${testReportId}`);
    
    // Test inserting a document
    console.log('\nTesting document creation...');
    const { error: docError } = await supabase
      .from('report_documents')
      .insert({
        id: testDocId,
        report_id: testReportId,
        document_name: 'test-document.txt',
        document_type: 'text/plain',
        document_size: 100,
        text_content: 'This is test content for our document',
        created_at: new Date().toISOString()
      });
    
    if (docError) {
      console.error('Error creating test document:', docError.message);
      
      // Clean up the report even if document creation failed
      await supabase.from('reports').delete().eq('id', testReportId);
      return;
    }
    
    console.log(`Successfully created test document with ID: ${testDocId}`);
    
    // Test retrieving the document
    console.log('\nTesting document retrieval...');
    const { data: docs, error: retrieveError } = await supabase
      .from('report_documents')
      .select('*')
      .eq('report_id', testReportId);
    
    if (retrieveError) {
      console.error('Error retrieving documents:', retrieveError.message);
    } else {
      console.log(`Retrieved ${docs.length} documents for report ID ${testReportId}`);
    }
    
    // Clean up
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', testReportId);
    
    if (deleteError) {
      console.error('Error cleaning up test data:', deleteError.message);
    } else {
      console.log('Successfully cleaned up test data');
    }
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Unexpected error during Supabase test:', error);
  }
}

testSupabase(); 