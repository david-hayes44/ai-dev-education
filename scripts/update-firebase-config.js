/**
 * This script helps to update Firebase configuration settings in the .env.local file
 * 
 * Usage:
 * 1. Run: node scripts/update-firebase-config.js
 * 2. Follow the prompts to enter your Firebase configuration values
 * 3. The script will update your .env.local file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Firebase config keys that we need
const requiredKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
];

// Helper to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log('\n=== Firebase Configuration Helper ===\n');
  console.log('This script will help you update your Firebase configuration in .env.local');
  console.log('You can find these values in your Firebase project settings > General > Your apps\n');

  // First, check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  let envExists = false;

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
    envExists = true;
    console.log('Found existing .env.local file\n');
  } catch (error) {
    console.log('No existing .env.local found, will create a new one\n');
  }

  // Parse existing env file to a map
  const envMap = {};
  if (envExists) {
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          envMap[key] = value;
        }
      }
    });
  }

  // Ask for Firebase config values
  console.log('Please enter your Firebase configuration values:');
  for (const key of requiredKeys) {
    const currentValue = envMap[key] || '';
    const displayValue = currentValue 
      ? currentValue.length > 10 
        ? `${currentValue.substring(0, 3)}***${currentValue.substring(currentValue.length - 3)}` 
        : '******' 
      : 'not set';

    const question = `${key} (${displayValue}): `;
    const answer = await askQuestion(question);
    
    if (answer.trim()) {
      envMap[key] = answer.trim();
    }
  }

  // Generate new .env content
  let newEnvContent = '';
  for (const [key, value] of Object.entries(envMap)) {
    newEnvContent += `${key}=${value}\n`;
  }

  // Write the updated content
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\nFirebase configuration updated successfully in .env.local');
  
  // Provide next steps
  console.log('\nNext steps:');
  console.log('1. Restart your Next.js development server');
  console.log('2. Visit /test-firebase in your browser to test the Firebase connection');
  console.log('3. Try uploading files in the chat interface');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 