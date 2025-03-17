// This script is designed to execute a single SQL statement
// It will be called by the MCP bridge

// The SQL statement to execute
const sql = process.argv[2];

if (!sql) {
  console.error('No SQL statement provided');
  process.exit(1);
}

console.log('Executing SQL statement:', sql);

// This function will be executed by the MCP bridge
async function executeSql() {
  try {
    // This assumes mcp_supabase_query is available in the global scope
    // when this code is executed by the MCP bridge
    const result = await mcp_supabase_query({ sql });
    console.log('SQL execution successful');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error.message || error);
    throw error;
  }
}

// Export the function for use by the MCP bridge
export { executeSql }; 