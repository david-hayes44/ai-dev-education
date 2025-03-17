import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/lib/auth';

interface FirebaseConversation {
  id: string;
  title: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirebaseMessage {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  isAI: boolean;
  createdAt: Timestamp;
  attachments?: FirebaseAttachment[];
}

interface FirebaseAttachment {
  id: string;
  path: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface MigrationProgress {
  total: {
    conversations: number;
    messages: number;
    attachments: number;
  };
  migrated: {
    conversations: number;
    messages: number;
    attachments: number;
  };
  failed: {
    conversations: number;
    messages: number;
    attachments: number;
  };
  currentItem: string;
}

/**
 * Migrates all conversations and messages for a specific user
 */
export async function migrateUserData(
  user: AuthUser,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationProgress> {
  // Initialize progress
  const progress: MigrationProgress = {
    total: { conversations: 0, messages: 0, attachments: 0 },
    migrated: { conversations: 0, messages: 0, attachments: 0 },
    failed: { conversations: 0, messages: 0, attachments: 0 },
    currentItem: '',
  };

  try {
    // Get all conversations for the user from Firebase
    const conversationsRef = collection(firebaseDb, 'conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'asc')
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    progress.total.conversations = conversationsSnapshot.size;
    
    if (onProgress) {
      onProgress({ ...progress, currentItem: 'Counting messages...' });
    }
    
    // Count messages and attachments
    for (const docSnapshot of conversationsSnapshot.docs) {
      const conversationData = docSnapshot.data() as FirebaseConversation;
      
      // Count messages
      const messagesRef = collection(firebaseDb, 'messages');
      const messagesQuery = query(
        messagesRef,
        where('conversationId', '==', conversationData.id),
        orderBy('createdAt', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      progress.total.messages += messagesSnapshot.size;
      
      // Count attachments
      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data() as FirebaseMessage;
        if (messageData.attachments) {
          progress.total.attachments += messageData.attachments.length;
        }
      }
    }
    
    if (onProgress) {
      onProgress({ 
        ...progress, 
        currentItem: `Found ${progress.total.conversations} conversations, ${progress.total.messages} messages, and ${progress.total.attachments} attachments` 
      });
    }
    
    // Process each conversation
    for (const docSnapshot of conversationsSnapshot.docs) {
      const firebaseConversation = docSnapshot.data() as FirebaseConversation & { id: string };
      const firebaseId = docSnapshot.id;
      
      if (onProgress) {
        onProgress({ 
          ...progress, 
          currentItem: `Migrating conversation: ${firebaseConversation.title || firebaseId}` 
        });
      }
      
      try {
        // Insert conversation into Supabase
        const { data: supabaseConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            id: firebaseId, // Use the same ID for easier mapping
            title: firebaseConversation.title,
            created_by: user.id,
            created_at: firebaseConversation.createdAt.toDate().toISOString(),
            updated_at: firebaseConversation.updatedAt.toDate().toISOString()
          })
          .select()
          .single();
        
        if (conversationError) {
          console.error('Error migrating conversation:', conversationError);
          progress.failed.conversations++;
          continue;
        }
        
        progress.migrated.conversations++;
        
        // Get messages for this conversation
        const messagesRef = collection(firebaseDb, 'messages');
        const messagesQuery = query(
          messagesRef,
          where('conversationId', '==', firebaseId),
          orderBy('createdAt', 'asc')
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        
        // Process each message
        for (const messageDoc of messagesSnapshot.docs) {
          const firebaseMessage = messageDoc.data() as FirebaseMessage;
          const messageFirebaseId = messageDoc.id;
          
          if (onProgress) {
            onProgress({ 
              ...progress, 
              currentItem: `Migrating message in conversation: ${firebaseConversation.title || firebaseId}` 
            });
          }
          
          try {
            // Insert message into Supabase
            const { data: supabaseMessage, error: messageError } = await supabase
              .from('messages')
              .insert({
                id: messageFirebaseId, // Use the same ID for easier mapping
                conversation_id: firebaseId,
                user_id: firebaseMessage.userId,
                content: firebaseMessage.content,
                is_ai: firebaseMessage.isAI,
                created_at: firebaseMessage.createdAt.toDate().toISOString(),
                updated_at: firebaseMessage.createdAt.toDate().toISOString() // Firebase may not have updatedAt for messages
              })
              .select()
              .single();
            
            if (messageError) {
              console.error('Error migrating message:', messageError);
              progress.failed.messages++;
              continue;
            }
            
            progress.migrated.messages++;
            
            // Process attachments if any
            if (firebaseMessage.attachments && firebaseMessage.attachments.length > 0) {
              for (const attachment of firebaseMessage.attachments) {
                if (onProgress) {
                  onProgress({ 
                    ...progress, 
                    currentItem: `Migrating attachment: ${attachment.name}` 
                  });
                }
                
                try {
                  // Insert attachment into Supabase
                  const { data: attachmentData, error: attachmentError } = await supabase
                    .from('file_attachments')
                    .insert({
                      id: attachment.id, // Use the same ID for easier mapping
                      message_id: messageFirebaseId,
                      file_path: attachment.path,
                      file_name: attachment.name,
                      file_type: attachment.type,
                      file_size: attachment.size,
                      file_url: attachment.url
                    })
                    .select()
                    .single();
                  
                  if (attachmentError) {
                    console.error('Error migrating attachment:', attachmentError);
                    progress.failed.attachments++;
                    continue;
                  }
                  
                  progress.migrated.attachments++;
                } catch (error) {
                  console.error('Error processing attachment:', error);
                  progress.failed.attachments++;
                }
              }
            }
          } catch (error) {
            console.error('Error processing message:', error);
            progress.failed.messages++;
          }
        }
      } catch (error) {
        console.error('Error processing conversation:', error);
        progress.failed.conversations++;
      }
    }
    
    if (onProgress) {
      onProgress({ 
        ...progress, 
        currentItem: 'Migration completed' 
      });
    }
    
    return progress;
  } catch (error) {
    console.error('Migration error:', error);
    if (onProgress) {
      onProgress({ 
        ...progress, 
        currentItem: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
    throw error;
  }
} 