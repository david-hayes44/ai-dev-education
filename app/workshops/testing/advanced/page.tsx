import { Metadata } from "next"
import Link from "next/link"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTube, Code, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Advanced AI-Assisted Testing Techniques",
  description: "Learn advanced techniques for AI-assisted testing, including mocking, fixtures, performance testing, and integration with CI/CD pipelines.",
  keywords: ["advanced testing", "mocking", "test fixtures", "performance testing", "CI/CD", "test generation", "AI testing"],
  section: "workshops/testing/advanced"
})

export default function AdvancedTestingWorkshopPage() {
  return (
    <ContentTemplate
      title="Advanced AI-Assisted Testing Techniques"
      description="Learn advanced techniques for AI-assisted testing, including mocking, fixtures, performance testing, and integration with CI/CD pipelines."
      metadata={{
        difficulty: "advanced",
        timeToComplete: "60 minutes",
        prerequisites: [
          {
            title: "AI-Assisted Testing Workshop",
            href: "/workshops/testing"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "overview",
          title: "Overview",
          level: 2
        },
        {
          id: "mocking",
          title: "Mocking with AI Assistance",
          level: 2,
          children: [
            {
              id: "generating-mocks",
              title: "Generating Mock Functions and Objects",
              level: 3
            },
            {
              id: "mocking-apis",
              title: "Mocking External APIs",
              level: 3
            }
          ]
        },
        {
          id: "fixtures",
          title: "Test Fixtures and Data Generation",
          level: 2
        },
        {
          id: "property-testing",
          title: "Property-Based Testing",
          level: 2
        },
        {
          id: "performance",
          title: "Performance Testing",
          level: 2
        },
        {
          id: "cicd",
          title: "Integration with CI/CD",
          level: 2
        },
        {
          id: "best-practices",
          title: "Advanced Best Practices",
          level: 2
        },
        {
          id: "resources",
          title: "Additional Resources",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "AI-Assisted Testing Workshop",
          href: "/workshops/testing",
          description: "Start with the fundamentals of AI-assisted testing"
        },
        {
          title: "Best Practices for Testing",
          href: "/best-practices/testing",
          description: "Learn established testing patterns and how AI enhances them"
        },
        {
          title: "AI for Code Quality",
          href: "/best-practices/code-quality",
          description: "Discover how AI can help improve overall code quality"
        }
      ]}
    >
      <div className="my-8 rounded-xl bg-primary/5 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <TestTube className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium">Building on the Basics</h3>
            <p className="text-muted-foreground">
              This workshop assumes you've completed the basic AI-Assisted Testing Workshop. Here, we'll dive deeper
              into advanced techniques that leverage AI to handle complex testing scenarios.
            </p>
          </div>
        </div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>
        In the basic workshop, we covered generating simple unit tests and improving test coverage. Now, we'll
        explore how AI can assist with more complex testing challenges including:
      </p>
      <ul>
        <li>Creating sophisticated mocks for dependencies</li>
        <li>Generating test fixtures and realistic test data</li>
        <li>Setting up property-based testing</li>
        <li>Optimizing performance testing</li>
        <li>Integrating AI-assisted testing into CI/CD pipelines</li>
      </ul>

      <h2 id="mocking">Mocking with AI Assistance</h2>
      <p>
        Mocking is essential when testing components that depend on external services, databases, or complex objects.
        AI can significantly simplify creating and maintaining mocks.
      </p>

      <h3 id="generating-mocks">Generating Mock Functions and Objects</h3>
      <p>
        Let's consider a service that depends on a database repository:
      </p>

      <CodeBlock 
        language="javascript"
        filename="userService.js"
        code={`// UserService depends on a repository for data access
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id) {
    if (!id) throw new Error('User ID is required');
    
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    
    // Don't expose password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserEmail(id, newEmail) {
    if (!id) throw new Error('User ID is required');
    if (!newEmail || !this.isValidEmail(newEmail)) {
      throw new Error('Valid email is required');
    }

    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser && existingUser.id !== id) {
      throw new Error('Email already in use');
    }

    return this.userRepository.update(id, { email: newEmail });
  }

  isValidEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = UserService;`}
      />

      <p>
        Now, let's ask AI to generate mock objects and test the UserService:
      </p>

      <Callout type="info" title="AI Prompt">
        Generate Jest tests for the UserService class. Create appropriate mocks for the userRepository dependency 
        and test both the getUserById and updateUserEmail methods. Include test cases for success scenarios and all 
        edge cases.
      </Callout>

      <CodeBlock 
        language="javascript"
        filename="userService.test.js"
        code={`const UserService = require('./userService');

describe('UserService', () => {
  // Mock repository implementation
  let mockUserRepository;
  let userService;

  beforeEach(() => {
    // Create fresh mock for each test
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn()
    };
    
    userService = new UserService(mockUserRepository);
  });

  describe('getUserById', () => {
    test('should throw error when id is not provided', async () => {
      await expect(userService.getUserById()).rejects.toThrow('User ID is required');
    });

    test('should return null when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      
      const result = await userService.getUserById('non-existent-id');
      
      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    test('should return user without password when found', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password-should-not-be-exposed'
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      const result = await userService.getUserById('user-123');
      
      expect(result).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      });
      expect(result.passwordHash).toBeUndefined();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updateUserEmail', () => {
    test('should throw error when id is not provided', async () => {
      await expect(userService.updateUserEmail(null, 'new@example.com')).rejects.toThrow('User ID is required');
    });

    test('should throw error when email is not valid', async () => {
      await expect(userService.updateUserEmail('user-123', 'invalid-email')).rejects.toThrow('Valid email is required');
    });

    test('should throw error when email is already in use by another user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ 
        id: 'different-user', 
        email: 'existing@example.com' 
      });
      
      await expect(userService.updateUserEmail('user-123', 'existing@example.com'))
        .rejects.toThrow('Email already in use');
        
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
    });

    test('should update email when all validations pass', async () => {
      // Email not in use
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Mock successful update
      mockUserRepository.update.mockResolvedValue({
        id: 'user-123',
        email: 'new@example.com',
        name: 'Test User'
      });
      
      const result = await userService.updateUserEmail('user-123', 'new@example.com');
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'new@example.com',
        name: 'Test User'
      });
      
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', { email: 'new@example.com' });
    });

    test('should allow user to update to their own email', async () => {
      // Same user already has this email
      mockUserRepository.findByEmail.mockResolvedValue({ 
        id: 'user-123', 
        email: 'same@example.com' 
      });
      
      mockUserRepository.update.mockResolvedValue({
        id: 'user-123',
        email: 'same@example.com',
        name: 'Test User'
      });
      
      const result = await userService.updateUserEmail('user-123', 'same@example.com');
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'same@example.com',
        name: 'Test User'
      });
    });
  });
});`}
      />

      <Callout type="tip">
        <p>Notice how AI created:</p>
        <ul>
          <li>A mock repository with jest.fn() for each method we needed</li>
          <li>Test cases for success scenarios and all edge cases</li>
          <li>Appropriate assertions to verify both return values and that the correct repository methods were called</li>
          <li>Tests that verify security concerns (password not exposed)</li>
        </ul>
      </Callout>

      <h3 id="mocking-apis">Mocking External APIs</h3>
      <p>
        When your code interacts with external APIs, mocking becomes even more important. Here's how AI can help generate mocks for API calls:
      </p>

      <CodeBlock 
        language="javascript"
        filename="weatherService.js"
        code={`const axios = require('axios');

class WeatherService {
  constructor(apiKey, baseUrl = 'https://api.weatherapi.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getCurrentWeather(city) {
    try {
      const response = await axios.get(`${this.baseUrl}/current.json`, {
        params: {
          key: this.apiKey,
          q: city
        }
      });
      
      return {
        location: response.data.location.name,
        country: response.data.location.country,
        temperature: {
          celsius: response.data.current.temp_c,
          fahrenheit: response.data.current.temp_f
        },
        condition: response.data.current.condition.text,
        wind: {
          kph: response.data.current.wind_kph,
          direction: response.data.current.wind_dir
        },
        humidity: response.data.current.humidity,
        updated: response.data.current.last_updated
      };
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error('Invalid city name');
      }
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error('Failed to fetch weather data');
    }
  }
}

module.exports = WeatherService;`}
      />

      <p>
        Let's use AI to generate tests with API mocking:
      </p>

      <Callout type="info" title="AI Prompt">
        Write Jest tests for the WeatherService class. Use jest.mock to mock the axios library and test the 
        getCurrentWeather method, including success cases and error handling.
      </Callout>

      <CodeBlock 
        language="javascript"
        filename="weatherService.test.js"
        code={`const axios = require('axios');
const WeatherService = require('./weatherService');

// Mock the axios module
jest.mock('axios');

describe('WeatherService', () => {
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://test-api.example.com';
  let weatherService;

  beforeEach(() => {
    weatherService = new WeatherService(mockApiKey, mockBaseUrl);
    // Clear all mock implementation and calls before each test
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    test('should fetch and transform weather data correctly', async () => {
      // Mock the API response
      const mockResponse = {
        data: {
          location: {
            name: 'San Francisco',
            country: 'United States of America'
          },
          current: {
            temp_c: 18.0,
            temp_f: 64.4,
            condition: {
              text: 'Partly cloudy'
            },
            wind_kph: 14.4,
            wind_dir: 'WSW',
            humidity: 71,
            last_updated: '2023-04-15 13:30'
          }
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);
      
      const result = await weatherService.getCurrentWeather('San Francisco');
      
      // Verify the result
      expect(result).toEqual({
        location: 'San Francisco',
        country: 'United States of America',
        temperature: {
          celsius: 18.0,
          fahrenheit: 64.4
        },
        condition: 'Partly cloudy',
        wind: {
          kph: 14.4,
          direction: 'WSW'
        },
        humidity: 71,
        updated: '2023-04-15 13:30'
      });
      
      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(`${mockBaseUrl}/current.json`, {
        params: {
          key: mockApiKey,
          q: 'San Francisco'
        }
      });
    });

    test('should throw "Invalid city name" for 400 response', async () => {
      // Mock a 400 error response
      axios.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: { message: 'No matching location found.' } }
        }
      });
      
      await expect(weatherService.getCurrentWeather('NonExistentCity'))
        .rejects.toThrow('Invalid city name');
        
      expect(axios.get).toHaveBeenCalled();
    });

    test('should throw "Invalid API key" for 401 response', async () => {
      // Mock a 401 error response
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: { message: 'API key invalid.' } }
        }
      });
      
      await expect(weatherService.getCurrentWeather('San Francisco'))
        .rejects.toThrow('Invalid API key');
        
      expect(axios.get).toHaveBeenCalled();
    });

    test('should throw generic error for other failures', async () => {
      // Mock a network error
      axios.get.mockRejectedValue(new Error('Network Error'));
      
      await expect(weatherService.getCurrentWeather('San Francisco'))
        .rejects.toThrow('Failed to fetch weather data');
        
      expect(axios.get).toHaveBeenCalled();
    });
  });
});`}
      />

      <h2 id="fixtures">Test Fixtures and Data Generation</h2>
      <p>
        AI can help generate realistic test fixtures that cover a wide range of scenarios.
        This is particularly useful for complex objects or large datasets.
      </p>

      <CodeBlock 
        language="javascript"
        filename="userFixtures.js"
        code={`// Generated with AI assistance to provide realistic test data
const userFixtures = {
  // Basic valid user
  validUser: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    created: '2023-04-15T10:30:00Z',
    preferences: {
      theme: 'light',
      notifications: true
    }
  },
  
  // Admin user with all permissions
  adminUser: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created: '2022-01-10T08:15:00Z',
    permissions: ['read', 'write', 'delete', 'admin'],
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  
  // Inactive user
  inactiveUser: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Inactive User',
    email: 'inactive@example.com',
    role: 'user',
    created: '2023-02-20T14:45:00Z',
    status: 'inactive',
    preferences: {
      theme: 'light',
      notifications: false
    }
  },
  
  // User with minimal properties
  minimalUser: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Minimal User',
    email: 'minimal@example.com'
  },
  
  // User with all optional fields
  completeUser: {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Complete User',
    email: 'complete@example.com',
    role: 'editor',
    created: '2023-03-05T11:22:00Z',
    lastLogin: '2023-04-14T09:15:00Z',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    phone: '+1 (555) 123-4567',
    preferences: {
      theme: 'system',
      language: 'en-US',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    },
    metadata: {
      registrationSource: 'web',
      accountType: 'premium',
      verificationStatus: 'verified'
    }
  },
  
  // Factory function to create customized users
  createUser: (overrides = {}) => ({
    id: `user-${Math.floor(Math.random() * 1000000)}`,
    name: 'Generated User',
    email: `user-${Math.floor(Math.random() * 1000000)}@example.com`,
    role: 'user',
    created: new Date().toISOString(),
    ...overrides
  })
};

module.exports = userFixtures;`}
      />

      <Callout type="tip">
        <p>AI can help generate fixture factories that:</p>
        <ul>
          <li>Provide common test cases (valid, invalid, edge cases)</li>
          <li>Include realistic-looking data that matches your domain</li>
          <li>Create factory functions that let you customize fixtures for specific tests</li>
        </ul>
      </Callout>

      <h2 id="property-testing">Property-Based Testing</h2>
      <p>
        Property-based testing involves testing that your code satisfies certain properties, rather than just testing specific examples.
        For instance, a function that reverses a string should satisfy the property that reversing it twice returns the original string.
      </p>

      <CodeBlock 
        language="javascript"
        filename="propertyTesting.test.js"
        code={`const fc = require('fast-check');

// Function we want to test
const sortArray = (arr) => [...arr].sort((a, b) => a - b);

describe('Property-based testing with fast-check', () => {
  test('sorting an array should produce an array of the same length', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sortArray(arr);
          return sorted.length === arr.length;
        }
      )
    );
  });

  test('sorting an array should be idempotent (sorting twice is the same as sorting once)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const onceSorted = sortArray(arr);
          const twiceSorted = sortArray(onceSorted);
          
          return JSON.stringify(onceSorted) === JSON.stringify(twiceSorted);
        }
      )
    );
  });

  test('every element in the sorted array should be >= to the previous element', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sortArray(arr);
          
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] < sorted[i-1]) {
              return false;
            }
          }
          
          return true;
        }
      )
    );
  });

  test('sorted array should contain the same elements as the original array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sortArray(arr);
          
          // Check if sorted has the same elements as the original
          return (
            // Same length
            sorted.length === arr.length &&
            // Every element in original is in sorted
            arr.every(x => sorted.includes(x)) &&
            // Every element in sorted is in original
            sorted.every(x => arr.includes(x))
          );
        }
      )
    );
  });
});`}
      />

      <p>
        Using AI to generate property-based tests can help you identify properties you might not have thought of.
      </p>

      <h2 id="performance">Performance Testing</h2>
      <p>
        AI can help write performance tests and analyze the results to identify bottlenecks.
      </p>

      <CodeBlock 
        language="javascript"
        filename="performanceTesting.js"
        code={`const { performance } = require('perf_hooks');

// Function to benchmark
function searchAlgorithm(arr, target) {
  // Implementation of search algorithm
  return arr.indexOf(target);
}

// AI-generated performance testing framework
function runPerformanceTest(testName, fn, args, iterations = 1000) {
  console.log(`Running performance test: ${testName}`);
  
  // Warm-up phase
  for (let i = 0; i < 100; i++) {
    fn(...args);
  }
  
  const times = [];
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(...args);
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate statistics
  const total = times.reduce((sum, time) => sum + time, 0);
  const average = total / times.length;
  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const min = times[0];
  const max = times[times.length - 1];
  
  console.log(`Results for ${testName}:`);
  console.log(`  Average: ${average.toFixed(6)} ms`);
  console.log(`  Median: ${median.toFixed(6)} ms`);
  console.log(`  Min: ${min.toFixed(6)} ms`);
  console.log(`  Max: ${max.toFixed(6)} ms`);
  
  return { average, median, min, max, times };
}

// Generate test data of different sizes
function generateTestData(size) {
  const arr = Array(size).fill().map((_, i) => i);
  // Shuffle the array
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Run tests with different input sizes
async function runScalabilityTests() {
  const sizes = [100, 1000, 10000, 100000];
  const results = {};
  
  for (const size of sizes) {
    const arr = generateTestData(size);
    const target = arr[Math.floor(Math.random() * arr.length)]; // Random existing element
    
    results[size] = runPerformanceTest(
      `Search in array of ${size} elements`,
      searchAlgorithm,
      [arr, target]
    );
  }
  
  // Analyze time complexity
  console.log('\nTime Complexity Analysis:');
  const baseline = results[sizes[0]].average;
  const baselineSize = sizes[0];
  
  for (const size of sizes) {
    const ratio = results[size].average / baseline;
    const expectedLinear = size / baselineSize;
    const expectedLogN = Math.log(size) / Math.log(baselineSize);
    
    console.log(`Size ${size}:`);
    console.log(`  Actual ratio: ${ratio.toFixed(2)}`);
    console.log(`  Expected for O(n): ${expectedLinear.toFixed(2)}`);
    console.log(`  Expected for O(log n): ${expectedLogN.toFixed(2)}`);
  }
}

runScalabilityTests();`}
      />

      <h2 id="cicd">Integration with CI/CD</h2>
      <p>
        AI can help generate configuration files and scripts for integrating tests into CI/CD pipelines.
      </p>

      <CodeBlock 
        language="yaml"
        filename=".github/workflows/test.yml"
        code={`name: Test Suite

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint check
      run: npm run lint
    
    - name: Run unit tests
      run: npm test -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: \${{ secrets.CODECOV_TOKEN }}
        file: ./coverage/lcov.info
        fail_ci_if_error: true
    
    - name: Performance benchmarks (only on main branch)
      if: github.ref == 'refs/heads/main'
      run: npm run benchmarks`}
      />

      <p>
        You can also use AI to generate scripts that analyze test results and provide insights:
      </p>

      <CodeBlock 
        language="javascript"
        filename="scripts/analyze-test-results.js"
        code={`const fs = require('fs');
const path = require('path');

// Read the test results JSON file generated by Jest
const testResultsPath = path.join(__dirname, '../test-results.json');
const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

try {
  const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  // Analysis of test results
  const totalTests = testResults.numTotalTests;
  const passedTests = testResults.numPassedTests;
  const failedTests = testResults.numFailedTests;
  const skippedTests = testResults.numPendingTests;
  
  console.log('=== Test Results Analysis ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${(passedTests / totalTests * 100).toFixed(2)}%)`);
  console.log(`Failed: ${failedTests} (${(failedTests / totalTests * 100).toFixed(2)}%)`);
  console.log(`Skipped: ${skippedTests} (${(skippedTests / totalTests * 100).toFixed(2)}%)`);
  
  // Find slowest tests
  const testResults = testResults.testResults.flatMap(file => 
    file.testResults.map(test => ({
      name: test.fullName,
      duration: test.duration,
      status: test.status,
      file: file.name
    }))
  );
  
  console.log('\n=== Slowest Tests ===');
  testResults
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .forEach((test, i) => {
      console.log(`${i + 1}. ${test.name} (${test.duration}ms) - ${test.file}`);
    });
  
  // Coverage analysis
  console.log('\n=== Coverage Analysis ===');
  console.log(`Statements: ${coverage.total.statements.pct}%`);
  console.log(`Branches: ${coverage.total.branches.pct}%`);
  console.log(`Functions: ${coverage.total.functions.pct}%`);
  console.log(`Lines: ${coverage.total.lines.pct}%`);
  
  // Files with low coverage
  console.log('\n=== Files with Low Coverage ===');
  const lowCoverageThreshold = 70;
  const lowCoverageFiles = Object.entries(coverage)
    .filter(([file, data]) => file !== 'total')
    .filter(([file, data]) => data.statements.pct < lowCoverageThreshold)
    .sort(([, a], [, b]) => a.statements.pct - b.statements.pct);
  
  lowCoverageFiles.forEach(([file, data]) => {
    console.log(`${file}: ${data.statements.pct}% statement coverage`);
  });
  
} catch (error) {
  console.error('Error analyzing test results:', error);
  process.exit(1);
}`}
      />

      <h2 id="best-practices">Advanced Best Practices</h2>
      <div className="grid gap-6 md:grid-cols-2 my-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>AI Test Maintenance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              When updating tests for changed code, provide both the original code and tests to the AI, 
              along with the new code. This gives the AI context to understand what should change.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              <span>Snapshot Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use AI to help generate meaningful snapshot tests that focus on critical parts of components 
              rather than capturing everything, which can lead to brittle tests.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <span>Testing First Approach</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For complex functions, ask AI to generate tests before implementing the function. 
              This ensures your implementation meets all requirements and edge cases.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Self-Testing Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use AI to help implement design patterns that make code more testable, such as 
              dependency injection, interface segregation, and command-query separation.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 id="resources">Additional Resources</h2>
      <ul>
        <li><a href="https://jestjs.io/docs/mock-functions" target="_blank" rel="noopener noreferrer">Jest Mock Functions Documentation</a></li>
        <li><a href="https://github.com/dubzzz/fast-check" target="_blank" rel="noopener noreferrer">fast-check: Property-based testing for JavaScript</a></li>
        <li><a href="https://www.martinfowler.com/articles/mocksArentStubs.html" target="_blank" rel="noopener noreferrer">Mocks Aren't Stubs by Martin Fowler</a></li>
        <li><a href="https://kentcdodds.com/blog/write-tests" target="_blank" rel="noopener noreferrer">How to Write Tests by Kent C. Dodds</a></li>
      </ul>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/workshops/testing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Testing Workshop
          </Link>
        </Button>
      </div>
    </ContentTemplate>
  )
} 