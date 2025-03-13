/**
 * Script to fix all unused imports across the project
 * 
 * This script reads the build warnings and removes unused imports from all files.
 * Run with: node scripts/fix-all-unused-imports.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of files and their unused imports
const unusedImportsMap = {
  './app/building-servers/page.tsx': ['Shield', 'Cloud'],
  './app/page.tsx': ['Image'],
  './app/playground/page.tsx': ['Download', 'Settings', 'Tabs', 'TabsContent', 'TabsList', 'TabsTrigger'],
  './app/resources/knowledge-base/cursor-rules/page.tsx': ['Tag', 'BookOpen'],
  './app/servers/implementation/firebase/page.tsx': ['Tabs', 'TabsContent', 'TabsList', 'TabsTrigger', 'Server', 'Info'],
  './app/servers/implementation/nodejs/page.tsx': ['Tabs', 'TabsContent', 'TabsList', 'TabsTrigger', 'Server', 'Info'],
  './app/servers/implementation/page.tsx': ['Database', 'Shield'],
  './app/servers/implementation/python/page.tsx': ['Tabs', 'TabsContent', 'TabsList', 'TabsTrigger', 'Server', 'Info', 'AlertTriangle'],
  './app/tools/cursor/core-features/page.tsx': ['Image', 'Code', 'Search'],
  './app/tools/cursor/page.tsx': ['Image', 'Code'],
  './app/tools/cursor/project-rules/page.tsx': ['Image', 'CardFooter', 'FileCode', 'Code'],
  './app/tools/cursor/setup/page.tsx': ['Image', 'CardFooter', 'Download'],
  './components/chat/chat-container.tsx': ['MessageType'],
  './components/chat/chat-message.tsx': ['error'],
  './components/chat/chat.tsx': ['useChat'],
  './components/chat/user-preferences.tsx': ['Cpu', 'Zap', 'MessageSquare', 'availableModels'],
  './components/layout/header.tsx': ['Puzzle', 'Server', 'MessageCircle'],
  './components/layout/mobile-nav.tsx': ['React'],
  './components/navigation/Sidebar.tsx': ['Globe', 'Puzzle', 'PanelLeft', 'PanelRight', 'Layers', 'Lightbulb', 'LayoutGrid'],
  './components/ui/command.tsx': ['loop', 'e'],
  './lib/chat-service.ts': ['ChatMessage', 'sendChatCompletion']
};

/**
 * Fix imports in a file
 * @param {string} filePath - Path to the file
 * @param {string[]} unusedImports - List of unused imports to remove
 * @returns {boolean} - Whether changes were made
 */
function fixImports(filePath, unusedImports) {
  // Convert relative path to absolute path
  const absolutePath = path.resolve(filePath.replace(/^\.\//, ''));
  
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${absolutePath}`);
    return false;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');
  const originalContent = content;
  let changed = false;

  // Create a regex pattern for each unused import
  for (const importName of unusedImports) {
    // Different patterns to match various import styles
    const patterns = [
      // For named imports like: import { X } from "..."
      new RegExp(`\\s*${importName}\\s*,?\\s*`, 'g'),
      // For named imports at the end like: import { ..., X } from "..."
      new RegExp(`\\s*,\\s*${importName}\\s*`, 'g'),
      // For single imports like: import X from "..."
      new RegExp(`^\\s*import\\s+${importName}\\s+from\\s+["'][^"']+["']\\s*;?\\s*$`, 'gm')
    ];

    // Apply each pattern
    for (const pattern of patterns) {
      const newContent = content.replace(pattern, (match, offset) => {
        // Check if this is part of a named import block
        const beforeMatch = content.substring(0, offset).trim();
        if (beforeMatch.endsWith('{') || match.includes(',')) {
          changed = true;
          return match.includes(',') ? '' : ' ';
        }
        return match;
      });

      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }
  }

  // Clean up empty import statements like: import { } from "..."
  content = content.replace(/import\s*{\s*}\s*from\s*["'][^"']+["']\s*;?/g, '');
  
  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(absolutePath, content);
    console.log(`Fixed imports in ${filePath}`);
    return true;
  } else {
    console.log(`No changes needed for ${filePath}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  let totalFixed = 0;

  for (const [filePath, unusedImports] of Object.entries(unusedImportsMap)) {
    if (fixImports(filePath, unusedImports)) {
      totalFixed++;
    }
  }

  console.log(`\nCompleted! Fixed imports in ${totalFixed} files.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 