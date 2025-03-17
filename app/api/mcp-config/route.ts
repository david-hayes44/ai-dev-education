import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Define path to .cursor/mcp.json at project root
    const mcpConfigPath = path.join(process.cwd(), '.cursor', 'mcp.json')
    
    // Check if file exists
    if (!fs.existsSync(mcpConfigPath)) {
      return NextResponse.json(
        { error: 'MCP configuration file not found' }, 
        { status: 404 }
      )
    }
    
    // Read and parse the file
    const configData = fs.readFileSync(mcpConfigPath, 'utf8')
    const config = JSON.parse(configData)
    
    // Return the configuration
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading MCP configuration:', error)
    return NextResponse.json(
      { error: 'Failed to read MCP configuration' }, 
      { status: 500 }
    )
  }
} 