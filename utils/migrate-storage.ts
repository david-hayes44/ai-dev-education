import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { storage as firebaseStorage } from '@/lib/firebase';

// Initialize Firebase storage - no longer needed since we import directly
// const firebaseStorage = getStorage(firebase);

/**
 * Downloads a file from a URL and converts it to a File object
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  const type = response.headers.get('content-type') || '';
  
  return new File([blob], filename, { type });
}

/**
 * Migrates files from a specific Firebase storage path to Supabase
 */
export async function migrateStorageFolder(
  firebasePath: string, 
  supabasePath: string,
  onProgress?: (current: number, total: number) => void
) {
  // List all files in the Firebase path
  const firebaseRef = ref(firebaseStorage, firebasePath);
  const firebaseResult = await listAll(firebaseRef);
  
  const total = firebaseResult.items.length;
  let processed = 0;
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  };

  // Process each file
  for (const item of firebaseResult.items) {
    try {
      const filename = item.name;
      const firebaseUrl = await getDownloadURL(item);
      
      // Convert the URL to a File object
      const file = await urlToFile(firebaseUrl, filename);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(`${supabasePath}/${filename}`, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) {
        console.error(`Failed to upload ${filename}:`, error);
        results.failed++;
      } else {
        results.success++;
      }
    } catch (error) {
      console.error(`Error processing ${item.name}:`, error);
      results.failed++;
    }
    
    processed++;
    if (onProgress) {
      onProgress(processed, total);
    }
  }
  
  // Handle subdirectories recursively
  for (const folder of firebaseResult.prefixes) {
    const folderName = folder.name;
    const subResults = await migrateStorageFolder(
      `${firebasePath}/${folderName}`,
      `${supabasePath}/${folderName}`,
      onProgress
    );
    
    // Combine results
    results.success += subResults.success;
    results.failed += subResults.failed;
    results.skipped += subResults.skipped;
  }
  
  return results;
}

/**
 * Migrates all files from Firebase storage to Supabase
 */
export async function migrateAllStorage(
  onProgress?: (current: number, total: number, path: string) => void
) {
  // List all root folders in Firebase
  const firebaseRef = ref(firebaseStorage);
  const rootResult = await listAll(firebaseRef);
  
  const totalFolders = rootResult.prefixes.length;
  let processedFolders = 0;
  const totalResults = {
    success: 0,
    failed: 0,
    skipped: 0,
  };
  
  // Process each root folder
  for (const folder of rootResult.prefixes) {
    const folderName = folder.name;
    
    if (onProgress) {
      onProgress(processedFolders, totalFolders, folderName);
    }
    
    const folderResults = await migrateStorageFolder(
      folderName,
      folderName,
      (current, total) => {
        if (onProgress) {
          onProgress(
            processedFolders + (current / total), 
            totalFolders,
            `${folderName} (${current}/${total})`
          );
        }
      }
    );
    
    // Combine results
    totalResults.success += folderResults.success;
    totalResults.failed += folderResults.failed;
    totalResults.skipped += folderResults.skipped;
    
    processedFolders++;
  }
  
  return totalResults;
} 