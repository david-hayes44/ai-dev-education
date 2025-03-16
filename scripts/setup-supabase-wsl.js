#!/usr/bin/env node

/**
 * Supabase WSL Setup Script
 * 
 * This script automates the setup of Supabase integration with WSL.
 * It reads credentials from .env.local and sets up necessary configurations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Check if WSL is installed
function checkWsl() {
  try {
    execSync('wsl --status', { stdio: 'pipe' });
    logSuccess('WSL is installed');
    return true;
  } catch (error) {
    logError('WSL is not installed or not properly configured');
    log('Please install WSL using: wsl --install', colors.yellow);
    return false;
  }
}

// Read environment variables from .env.local
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found');
    log('Please create .env.local file with Supabase credentials', colors.yellow);
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim();
    }
  });

  if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logError('Supabase credentials not found in .env.local');
    log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set', colors.yellow);
    return null;
  }

  return envVars;
}

// Extract project ID from Supabase URL
function extractProjectId(supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.split('.')[0];
  } catch (error) {
    logError(`Failed to extract project ID from ${supabaseUrl}`);
    return null;
  }
}

// Create Supabase config in WSL
function setupSupabaseWsl(projectId, supabaseUrl, supabaseKey) {
  try {
    // Create directory
    execSync('wsl -- mkdir -p ~/.supabase', { stdio: 'pipe' });
    
    // Create config file with proper escaping for special characters
    const configContent = JSON.stringify({
      project_id: projectId,
      api_url: supabaseUrl,
      api_key: supabaseKey
    }, null, 2);
    
    // Write content to temporary file
    const tempFilePath = path.join(os.tmpdir(), 'supabase-config.json');
    fs.writeFileSync(tempFilePath, configContent);
    
    // Copy to WSL
    execSync(`wsl -- cp $(wslpath '${tempFilePath}') ~/.supabase/config.json`, { stdio: 'pipe' });
    
    // Cleanup
    fs.unlinkSync(tempFilePath);
    
    logSuccess('Supabase configuration created in WSL');
    return true;
  } catch (error) {
    logError(`Failed to create Supabase config in WSL: ${error.message}`);
    return false;
  }
}

// Create or update Cursor MCP configuration
function setupCursorMcp(postgresConnectionString) {
  try {
    const cursorDir = path.join(process.cwd(), '.cursor');
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
    }
    
    const mcpPath = path.join(cursorDir, 'mcp.json');
    let mcpConfig = {};
    
    if (fs.existsSync(mcpPath)) {
      mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    }
    
    // Update or add Supabase server config
    mcpConfig.mcpServers = mcpConfig.mcpServers || {};
    mcpConfig.mcpServers.supabase = {
      command: 'wsl',
      args: ['npx', '-y', '@modelcontextprotocol/server-postgres', postgresConnectionString]
    };
    
    fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
    logSuccess('Cursor MCP configuration updated');
    return true;
  } catch (error) {
    logError(`Failed to update Cursor MCP configuration: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n🔧 Supabase WSL Setup Script 🔧\n', colors.bold + colors.cyan);
  
  // Check WSL
  if (!checkWsl()) {
    return;
  }
  
  // Read environment variables
  const envVars = readEnvFile();
  if (!envVars) {
    return;
  }
  
  // Extract project ID
  const projectId = extractProjectId(envVars.NEXT_PUBLIC_SUPABASE_URL);
  if (!projectId) {
    return;
  }
  
  logInfo(`Supabase project ID: ${projectId}`);
  
  // Determine PostgreSQL connection string
  let postgresConnectionString = envVars.POSTGRES_CONNECTION_STRING;
  if (!postgresConnectionString) {
    logWarning('POSTGRES_CONNECTION_STRING not found in .env.local');
    logInfo('Please provide a PostgreSQL connection string in this format:');
    log('postgresql://postgres.[project_id]:[password]@aws-0-us-east-2.pooler.supabase.com:5432/postgres', colors.cyan);
    // In a real interactive script, we would prompt for input here
    postgresConnectionString = `postgresql://postgres.${projectId}:password@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;
  }
  
  // Set up Supabase in WSL
  const wslSetupSuccess = setupSupabaseWsl(
    projectId, 
    envVars.NEXT_PUBLIC_SUPABASE_URL, 
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  if (!wslSetupSuccess) {
    return;
  }
  
  // Set up Cursor MCP
  const mcpSetupSuccess = setupCursorMcp(postgresConnectionString);
  if (!mcpSetupSuccess) {
    return;
  }
  
  // Success message
  log('\n🎉 Supabase WSL setup completed successfully! 🎉\n', colors.bold + colors.green);
  logInfo('You can now use Supabase with WSL in your project.');
  logInfo('To test your setup, run the application and check if Supabase client initializes properly.');
}

// Run the script
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 