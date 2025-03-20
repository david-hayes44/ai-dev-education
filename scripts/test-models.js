/**
 * Test script to verify model access through OpenRouter
 * 
 * This script tests connectivity with the following models:
 * - google/gemini-2.0-flash-thinking-exp:free
 * - deepseek/deepseek-r1:free
 * - google/gemini-2.0-flash-lite-preview-02-05:free
 */

// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

// Check if API key is available
console.log("API Key:", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
  console.error(`${colors.red}Error: OpenRouter API key is not available in environment variables.${colors.reset}`);
  console.log(`Please make sure NEXT_PUBLIC_OPENROUTER_API_KEY is set in .env.local file.`);
  process.exit(1);
}

// Check if API key is the placeholder
if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
  console.error(`${colors.red}Error: OpenRouter API key is set to the placeholder value.${colors.reset}`);
  console.log(`Please update the NEXT_PUBLIC_OPENROUTER_API_KEY in your .env.local file with your actual API key.`);
  process.exit(1);
}

// Models to test
const modelsToTest = [
  {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Flash Thinking'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1'
  },
  {
    id: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    name: 'Gemini 2.0 Flash Lite'
  }
];

// Function to test a model
async function testModel(model) {
  console.log(`\n${colors.blue}Testing model: ${model.name} (${model.id})${colors.reset}`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI-Dev Education Platform - Model Test',
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for the AI-Dev Education platform.' },
          { role: 'user', content: 'Hello! Please respond with a short greeting and your model name.' }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || 'Unknown error' };
      }
      console.log(`${colors.red}Response status: ${response.status} ${response.statusText}${colors.reset}`);
      console.log(`${colors.red}Error details: ${JSON.stringify(errorData, null, 2)}${colors.reset}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'No content returned';
    
    console.log(`${colors.green}✓ Success!${colors.reset}`);
    console.log(`${colors.yellow}Response:${colors.reset} ${content}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.blue}Starting OpenRouter model tests...${colors.reset}`);
  console.log(`API Key available: ${colors.green}Yes${colors.reset}`);
  
  let passCount = 0;
  
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) passCount++;
  }
  
  console.log(`\n${colors.blue}Test Results:${colors.reset}`);
  console.log(`${passCount} of ${modelsToTest.length} models tested successfully.`);
  
  if (passCount === modelsToTest.length) {
    console.log(`${colors.green}All tests passed!${colors.reset}`);
  } else {
    console.log(`${colors.red}Some tests failed. Please check the model IDs or your API key.${colors.reset}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
}); 