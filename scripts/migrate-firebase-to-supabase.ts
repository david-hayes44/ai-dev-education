/**
 * Migration script to transfer data from Firebase to Supabase
 * This script connects to both Firebase and Supabase and transfers data
 */

import { db, storage } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { FileAttachment } from '../lib/chat-service';
import type { Stream } from 'stream';

// Configuration
const TEMP_DIRECTORY = path.join(__dirname, 'temp-files');
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to true to test without actually migrating

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIRECTORY)) {
  fs.mkdirSync(TEMP_DIRECTORY, { recursive: true });
}

// Main migration function
async function migrateData() {
  try {
    console.log('Starting migration from Firebase to Supabase...');
    
    if (DRY_RUN) {
      console.log('DRY RUN MODE: No data will be modified');
    }
    
    // Step 1: Migrate chat sessions
    console.log('Step 1: Migrating chat sessions...');
    const sessions = await migrateSessions();
    console.log(`Migrated ${sessions.length} sessions`);
    
    // Step 2: Migrate chat messages for each session
    console.log('Step 2: Migrating chat messages...');
    let totalMessages = 0;
    for (const session of sessions) {
      const messageCount = await migrateSessionMessages(session.id, session.supabaseId);
      totalMessages += messageCount;
      console.log(`  - Session ${session.title}: ${messageCount} messages`);
    }
    console.log(`Migrated ${totalMessages} messages`);
    
    // Step 3: Migrate file attachments
    console.log('Step 3: Migrating file attachments...');
    const attachmentsCount = await migrateFileAttachments();
    console.log(`Migrated ${attachmentsCount} file attachments`);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Clean up temp directory
    fs.rmdirSync(TEMP_DIRECTORY, { recursive: true });
  }
}

// Migrate chat sessions from Firebase to Supabase
async function migrateSessions() {
  const sessionsCollection = collection(db, 'sessions');
  const sessionsSnapshot = await getDocs(sessionsCollection);
  
  const sessions = [];
  
  for (const doc of sessionsSnapshot.docs) {
    const sessionData = doc.data();
    const supabaseSessionId = uuidv4();
    
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('sessions')
        .insert({
          id: supabaseSessionId,
          title: sessionData.title || 'Untitled Session',
          created_at: new Date(sessionData.createdAt || Date.now()).toISOString(),
          updated_at: new Date(sessionData.updatedAt || Date.now()).toISOString(),
          topic: sessionData.topic,
          category: sessionData.category,
          model: sessionData.model
        });
      
      if (error) {
        console.error(`Error migrating session ${doc.id}:`, error);
        continue;
      }
    }
    
    sessions.push({
      id: doc.id,
      supabaseId: supabaseSessionId,
      title: sessionData.title || 'Untitled Session'
    });
  }
  
  return sessions;
}

// Migrate messages for a specific session
async function migrateSessionMessages(firebaseSessionId: string, supabaseSessionId: string) {
  const messagesCollection = collection(db, `sessions/${firebaseSessionId}/messages`);
  const messagesSnapshot = await getDocs(messagesCollection);
  
  const messageIdMap = new Map(); // To store mapping between Firebase and Supabase IDs
  
  let count = 0;
  for (const doc of messagesSnapshot.docs) {
    const messageData = doc.data();
    const supabaseMessageId = uuidv4();
    
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: supabaseMessageId,
          session_id: supabaseSessionId,
          role: messageData.role || 'user',
          content: messageData.content || '',
          created_at: new Date(messageData.timestamp || Date.now()).toISOString(),
          metadata: messageData.metadata || null,
          is_streaming: false
        });
      
      if (error) {
        console.error(`Error migrating message ${doc.id}:`, error);
        continue;
      }
    }
    
    messageIdMap.set(doc.id, supabaseMessageId);
    count++;
    
    // Migrate attachments for this message
    if (messageData.attachments && Array.isArray(messageData.attachments)) {
      for (const attachment of messageData.attachments) {
        await migrateAttachment(attachment, supabaseMessageId);
      }
    }
  }
  
  return count;
}

// Migrate a single attachment from a message
async function migrateAttachment(attachment: FileAttachment, supabaseMessageId: string) {
  if (!attachment || !attachment.url) {
    return;
  }
  
  try {
    // Generate new ID for Supabase
    const attachmentId = uuidv4();
    
    // Download the file from Firebase URL
    const tempFilePath = path.join(TEMP_DIRECTORY, attachment.name || 'file');
    const response = await axios.get(attachment.url, { 
      responseType: 'stream' 
    });
    
    // Save to temporary file
    const writer = fs.createWriteStream(tempFilePath);
    (response.data as Stream).pipe(writer);
    
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (err) => reject(err));
    });
    
    if (!DRY_RUN) {
      // Upload to Supabase
      const fileBuffer = fs.readFileSync(tempFilePath);
      const filePath = `chat-attachments/${supabaseMessageId}/${attachmentId}-${attachment.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, fileBuffer, {
          contentType: attachment.type,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Error uploading file to Supabase:', uploadError);
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);
      
      // Create attachment record
      const { error: attachmentError } = await supabase
        .from('attachments')
        .insert({
          id: attachmentId,
          message_id: supabaseMessageId,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          url: publicUrl,
          content: attachment.content,
          storage_ref: filePath,
          created_at: new Date().toISOString()
        });
      
      if (attachmentError) {
        console.error('Error creating attachment record in Supabase:', attachmentError);
      }
    }
    
    // Clean up
    fs.unlinkSync(tempFilePath);
    
  } catch (error) {
    console.error('Error migrating attachment:', error);
  }
}

// Migrate all file attachments from Firebase Storage to Supabase Storage
async function migrateFileAttachments() {
  // This migration might be complex and very specific to how files are stored
  // Here we're assuming files are in a chat-attachments folder in Firebase Storage
  
  const filesRef = ref(storage, 'chat-attachments');
  let count = 0;
  
  try {
    const filesList = await listAll(filesRef);
    
    for (const item of filesList.items) {
      const url = await getDownloadURL(item);
      const filename = item.name;
      
      try {
        // Download the file
        const tempFilePath = path.join(TEMP_DIRECTORY, filename);
        const response = await axios.get(url, { 
          responseType: 'stream' 
        });
        
        // Save to temporary file
        const writer = fs.createWriteStream(tempFilePath);
        (response.data as Stream).pipe(writer);
        
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', (err) => reject(err));
        });
        
        if (!DRY_RUN) {
          // Upload to Supabase
          const fileBuffer = fs.readFileSync(tempFilePath);
          const filePath = `chat-attachments/migrated/${filename}`;
          
          const { error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, fileBuffer);
          
          if (error) {
            console.error(`Error uploading file ${filename} to Supabase:`, error);
          } else {
            count++;
          }
        } else {
          count++;
        }
        
        // Clean up
        fs.unlinkSync(tempFilePath);
        
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
      }
    }
    
    // Process subdirectories if needed
    for (const folder of filesList.prefixes) {
      // Recursively process folders if needed
      // This is a simplified example, you might need a more complex approach
      console.log(`Skipping folder ${folder.name} - not implemented in this script`);
    }
    
  } catch (error) {
    console.error('Error listing files in Firebase Storage:', error);
  }
  
  return count;
}

// Run the migration
if (require.main === module) {
  migrateData().catch(console.error);
} 