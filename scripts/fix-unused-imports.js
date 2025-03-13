/**
 * Fix Unused Imports Script
 * 
 * This script removes unused imports for MainLayout and FloatingChat components
 * that were identified in the build warnings.
 * 
 * To run: node scripts/fix-unused-imports.js
 */

const fs = require('fs');
const { glob } = require('glob');

// Helper function to modify a file
function fixImports(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');

    let modified = content;

    // More robust patterns to remove the import statements
    modified = modified.replace(/import\s*{\s*MainLayout\s*}\s*from\s*["']@\/components\/layout\/main-layout["'][;\n]/g, '');
    modified = modified.replace(/import\s*{\s*FloatingChat\s*}\s*from\s*["']@\/components\/chat\/floating-chat["'][;\n]/g, '');
    
    // Try alternative patterns with semicolons
    if (modified === content) {
      modified = content;
      modified = modified.replace(/import { MainLayout } from "@\/components\/layout\/main-layout"[;\n]/g, '');
      modified = modified.replace(/import { FloatingChat } from "@\/components\/chat\/floating-chat"[;\n]/g, '');
    }

    // Try with exact matches to be safe
    if (modified === content) {
      modified = content;
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => 
        !line.includes('import { MainLayout }') && 
        !line.includes('import { FloatingChat }')
      );
      modified = filteredLines.join('\n');
    }
    
    // Clean up multiple blank lines
    modified = modified.replace(/\n\s*\n\s*\n/g, '\n\n');

    // If changes were made, write back to the file
    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
    } else {
      console.log(`No changes needed for: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function 
async function main() {
  try {
    // Find all TSX files in the app directory
    const files = await glob('app/**/*.tsx');
    console.log(`Found ${files.length} files to process`);

    // Process each file
    for (const filePath of files) {
      try {
        fixImports(filePath);
      } catch (error) {
        console.error(`Error with ${filePath}:`, error);
      }
    }

    console.log('Import fix completed!');
  } catch (error) {
    console.error('Error running script:', error);
  }
}

// Run the main function
main(); 