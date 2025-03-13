/**
 * Fix Layout Script
 * 
 * This script removes redundant MainLayout and FloatingChat components from page files
 * to prevent duplicate headers and layouts.
 * 
 * To run: node scripts/fix-layout.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Helper function to modify a file
function fixFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip files that don't import MainLayout
    if (!content.includes('import { MainLayout }') && !content.includes('import {MainLayout}')) {
      console.log(`Skipping (no MainLayout import): ${filePath}`);
      return;
    }

    // Check if the file has a MainLayout wrapper
    if (content.includes('<MainLayout>') && content.includes('</MainLayout>')) {
      console.log(`Fixing layout in: ${filePath}`);

      // Remove MainLayout wrapper
      let modified = content;
      modified = modified.replace(/<MainLayout>\s*/g, '');
      modified = modified.replace(/\s*<\/MainLayout>/g, '');

      // Remove FloatingChat component if present
      if (modified.includes('<FloatingChat />')) {
        modified = modified.replace(/<FloatingChat\s*\/>\s*/g, '');
      }

      // Update container classes if needed
      modified = modified.replace(
        /<div className="container py-12">/g, 
        '<div className="container mx-auto px-6 sm:px-8 py-12">'
      );

      // Remove the import statements for MainLayout and FloatingChat
      modified = modified.replace(/import { MainLayout } from "@\/components\/layout\/main-layout";\s*/g, '');
      modified = modified.replace(/import { MainLayout } from "@\/components\/layout\/main-layout"\s*/g, '');
      modified = modified.replace(/import { FloatingChat } from "@\/components\/chat\/floating-chat";\s*/g, '');
      modified = modified.replace(/import { FloatingChat } from "@\/components\/chat\/floating-chat"\s*/g, '');
      
      // Clean up multiple blank lines
      modified = modified.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Write the modified content back to the file
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`Skipping (no MainLayout tags): ${filePath}`);
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
        fixFile(filePath);
      } catch (error) {
        console.error(`Error with ${filePath}:`, error);
      }
    }

    console.log('Layout fix completed!');
  } catch (error) {
    console.error('Error running script:', error);
  }
}

// Run the main function
main(); 