import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Advanced AI-Assisted Testing Techniques",
  description: "Explore advanced techniques for leveraging AI in your testing workflows, including integration testing, performance testing, and security testing.",
  keywords: ["AI testing", "integration testing", "performance testing", "security testing", "TDD", "test coverage", "AI test generation", "snapshot testing"],
  section: "workshops/ai-assisted-testing/advanced-techniques"
})

export default function AdvancedTestingTechniques() {
  return (
    <ContentTemplate
      title="Advanced AI-Assisted Testing Techniques"
      description="Explore advanced techniques for leveraging AI in your testing workflows, including integration testing, performance testing, and security testing."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "25 minutes",
        prerequisites: [
          {
            title: "AI-Assisted Testing Workshop",
            href: "/workshops/ai-assisted-testing"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "ai-for-integration-testing",
          title: "AI for Integration Testing",
          level: 2
        },
        {
          id: "leveraging-ai-for-tdd",
          title: "Leveraging AI for TDD",
          level: 2
        },
        {
          id: "performance-testing",
          title: "Performance Testing with AI",
          level: 2
        },
        {
          id: "security-testing",
          title: "Security Testing with AI",
          level: 2
        },
        {
          id: "test-coverage-optimization",
          title: "Test Coverage Optimization",
          level: 2
        },
        {
          id: "snapshot-testing",
          title: "AI-Enhanced Snapshot Testing",
          level: 2
        },
        {
          id: "maintenance-strategies",
          title: "Test Maintenance Strategies",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "AI-Assisted Testing Workshop",
          href: "/workshops/ai-assisted-testing",
          description: "Learn the fundamentals of using AI to improve your testing process."
        },
        {
          title: "Best Practices for AI-Generated Code",
          href: "/best-practices/code-review",
          description: "Guidelines for reviewing and validating AI-generated code."
        },
        {
          title: "MCP for Testing",
          href: "/mcp/context-management",
          description: "How to use the Model Context Protocol to enhance your testing workflow."
        }
      ]}
    >
      <p>
        Building on the fundamentals covered in the main workshop, this page explores advanced techniques for leveraging AI in your testing workflows. These strategies help you tackle more complex testing scenarios, improve test quality, and optimize your testing process.
      </p>

      <h2 id="ai-for-integration-testing">AI for Integration Testing</h2>
      <p>
        Integration testing verifies that different components of your application work together correctly. AI can significantly enhance this process by understanding system interactions and generating comprehensive test scenarios.
      </p>

      <h3>Challenges of Integration Testing</h3>
      <ul>
        <li>Complex setup and configuration requirements</li>
        <li>Difficulty in identifying all possible interaction paths</li>
        <li>Managing test data across components</li>
        <li>Simulating real-world usage patterns</li>
      </ul>

      <h3>AI-Assisted Approach</h3>
      <ol>
        <li><strong>Component Analysis:</strong> Use AI to analyze component interfaces and dependencies.</li>
        <li><strong>Scenario Generation:</strong> Let AI identify potential integration scenarios based on component relationships.</li>
        <li><strong>Mock Generation:</strong> Use AI to create appropriate mocks and stubs for external dependencies.</li>
        <li><strong>Test Implementation:</strong> Implement integration tests with AI assistance, focusing on realistic data flows.</li>
      </ol>

      <CodeBlock 
        language="typescript"
        filename="user-order-integration.test.ts"
        code={`// Example of AI-assisted integration test between User and Order services
import { UserService } from '../services/UserService';
import { OrderService } from '../services/OrderService';
import { PaymentGateway } from '../services/PaymentGateway';
import { mockPaymentProvider } from '../mocks/paymentProvider';

describe('User-Order Integration', () => {
  // AI helped identify this complex but crucial flow
  test('User can place order, payment is processed, and inventory is updated', async () => {
    // Setup - AI generated appropriate test data
    const userService = new UserService();
    const orderService = new OrderService();
    
    // Mock the payment gateway - AI suggested this isolation
    const paymentGateway = new PaymentGateway();
    paymentGateway.provider = mockPaymentProvider();
    
    // Test user
    const user = await userService.createUser({
      name: 'Test User',
      email: 'test@example.com',
      paymentMethods: [{
        type: 'credit',
        token: 'test-token-123'
      }]
    });
    
    // Test product with inventory check
    const initialInventory = await orderService.checkInventory('PROD-123');
    expect(initialInventory).toBeGreaterThan(0);
    
    // Place order
    const order = await orderService.createOrder({
      userId: user.id,
      items: [{ productId: 'PROD-123', quantity: 1 }],
      paymentMethod: user.paymentMethods[0]
    });
    
    // Verify order was created
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
    
    // Process payment
    const payment = await orderService.processPayment(order.id);
    expect(payment.status).toBe('successful');
    
    // Verify order status updated
    const updatedOrder = await orderService.getOrder(order.id);
    expect(updatedOrder.status).toBe('paid');
    
    // Verify inventory updated
    const finalInventory = await orderService.checkInventory('PROD-123');
    expect(finalInventory).toBe(initialInventory - 1);
  });
});`}
      />

      <Callout type="tip" title="Integration Test Tips">
        When using AI for integration testing, use the Model Context Protocol (MCP) to provide comprehensive context about your system architecture. This helps the AI understand component relationships and generate more accurate integration tests.
      </Callout>

      <h2 id="leveraging-ai-for-tdd">Leveraging AI for TDD</h2>
      <p>
        Test-Driven Development (TDD) involves writing tests before implementing features. AI can enhance this process by helping you write more comprehensive tests and generating implementation code that satisfies them.
      </p>

      <h3>AI-Enhanced TDD Workflow</h3>
      <ol>
        <li><strong>Requirements Analysis:</strong> Describe feature requirements to the AI.</li>
        <li><strong>Test Generation:</strong> Ask AI to generate tests that validate these requirements.</li>
        <li><strong>Test Refinement:</strong> Review and refine the generated tests.</li>
        <li><strong>Implementation Support:</strong> Use AI to help implement code that passes the tests.</li>
        <li><strong>Refactoring Assistance:</strong> Get AI suggestions for code improvements while maintaining test passing status.</li>
      </ol>

      <CodeBlock 
        language="typescript"
        filename="currency-converter-tdd.ts"
        code={`// Step 1: AI-generated tests based on requirements
// currency-converter.test.ts
import { CurrencyConverter } from './currency-converter';

describe('CurrencyConverter', () => {
  let converter: CurrencyConverter;
  
  beforeEach(() => {
    converter = new CurrencyConverter();
  });
  
  test('converts USD to EUR with correct exchange rate', () => {
    const result = converter.convert(100, 'USD', 'EUR');
    // Assuming exchange rate of USD to EUR is approximately 0.85
    expect(result).toBeCloseTo(85, 0);
  });
  
  test('throws error for invalid currency codes', () => {
    expect(() => converter.convert(100, 'USD', 'INVALID')).toThrow('Invalid currency code');
  });
  
  test('handles zero amount correctly', () => {
    expect(converter.convert(0, 'USD', 'EUR')).toBe(0);
  });
  
  test('handles negative amounts', () => {
    expect(converter.convert(-100, 'USD', 'EUR')).toBeCloseTo(-85, 0);
  });
  
  test('same currency conversion returns same amount', () => {
    expect(converter.convert(100, 'USD', 'USD')).toBe(100);
  });
});

// Step 2: AI-suggested implementation to satisfy tests
// currency-converter.ts
type ExchangeRates = Record<string, Record<string, number>>;

export class CurrencyConverter {
  private rates: ExchangeRates;
  private validCurrencies: string[];
  
  constructor() {
    // In a real implementation, these would come from an API
    this.rates = {
      'USD': { 'EUR': 0.85, 'GBP': 0.75, 'JPY': 110.2 },
      'EUR': { 'USD': 1.18, 'GBP': 0.88, 'JPY': 129.7 },
      'GBP': { 'USD': 1.33, 'EUR': 1.14, 'JPY': 147.3 },
      'JPY': { 'USD': 0.009, 'EUR': 0.0077, 'GBP': 0.0068 }
    };
    
    this.validCurrencies = Object.keys(this.rates);
  }
  
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    // Handle same currency
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // Validate currencies
    if (!this.validCurrencies.includes(fromCurrency) || !this.validCurrencies.includes(toCurrency)) {
      throw new Error('Invalid currency code');
    }
    
    // Perform conversion
    const rate = this.rates[fromCurrency][toCurrency];
    return amount * rate;
  }
}`}
      />

      <h2 id="performance-testing">Performance Testing with AI</h2>
      <p>
        Performance testing ensures your application meets speed, scalability, and stability requirements. AI can help identify performance bottlenecks and generate tests that stress your system appropriately.
      </p>

      <h3>Key AI Applications in Performance Testing</h3>
      <ul>
        <li><strong>Load Pattern Analysis:</strong> AI can analyze real user behavior to generate realistic load patterns.</li>
        <li><strong>Bottleneck Identification:</strong> AI can review application code to identify potential performance issues before they arise in production.</li>
        <li><strong>Test Script Generation:</strong> Generate performance test scripts based on application architecture.</li>
        <li><strong>Result Analysis:</strong> Analyze performance test results to identify patterns and improvement opportunities.</li>
      </ul>

      <CodeBlock 
        language="javascript"
        filename="ai-assisted-performance-test.js"
        code={`// Example of AI-generated performance test script for an API endpoint
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics - AI identified these as important for this API
const failedRequests = new Counter('failed_requests');
const slowRequests = new Counter('slow_requests');

// Test configuration - AI suggested these parameters based on production traffic analysis
export const options = {
  scenarios: {
    // Simulate normal usage
    average_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },  // Ramp up to 50 users
        { duration: '5m', target: 50 },  // Stay at 50 users
        { duration: '2m', target: 0 },   // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
    },
    // Simulate peak traffic (e.g., during marketing campaigns)
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 200 },  // Quick ramp up to 200 users
        { duration: '3m', target: 200 },  // Stay at 200 users
        { duration: '1m', target: 0 },    // Ramp down to 0 users
      ],
      startTime: '10m',
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // Performance targets - AI derived these from business requirements
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    failed_requests: ['count<100'],
    slow_requests: ['count<200'],
  },
};

export default function() {
  // AI identified critical endpoints to test based on application analysis
  const searchEndpoint = 'https://api.example.com/search';
  const productEndpoint = 'https://api.example.com/products';
  
  // AI generated realistic search patterns based on analytics data
  const searchQueries = [
    'popular item',
    'discount seasonal',
    'new arrivals',
    'best sellers',
    'clearance'
  ];
  
  // Randomly select a search query (replicating user behavior)
  const searchQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  // Perform search
  const searchResponse = http.get(\`\${searchEndpoint}?q=\${searchQuery}\`);
  
  // Check if search was successful
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search results returned': (r) => r.json().results.length > 0,
  }) || failedRequests.add(1);
  
  // Track slow requests
  if (searchResponse.timings.duration > 300) {
    slowRequests.add(1);
  }
  
  // 80% of searches lead to product views (based on analytics)
  if (Math.random() < 0.8 && searchResponse.status === 200) {
    const results = searchResponse.json().results;
    if (results.length > 0) {
      // Visit a product page from search results
      const productId = results[0].id;
      const productResponse = http.get(\`\${productEndpoint}/\${productId}\`);
      
      check(productResponse, {
        'product status is 200': (r) => r.status === 200,
        'product data is valid': (r) => r.json().name !== undefined,
      }) || failedRequests.add(1);
      
      if (productResponse.timings.duration > 200) {
        slowRequests.add(1);
      }
    }
  }
  
  // Realistic user think time between actions
  sleep(Math.random() * 3 + 2);
}`}
      />

      <Callout type="info" title="AI for Performance Analysis">
        AI tools can analyze your application logs to identify actual usage patterns, then generate performance tests that mirror real-world conditions. This makes your performance testing more realistic and valuable.
      </Callout>

      <h2 id="security-testing">Security Testing with AI</h2>
      <p>
        Security testing identifies vulnerabilities in your application. AI can enhance security testing by generating tests for known vulnerability patterns and suggesting fixes.
      </p>

      <h3>AI-Assisted Security Testing Techniques</h3>
      <ul>
        <li><strong>Vulnerability Pattern Recognition:</strong> AI can scan code for common security vulnerabilities.</li>
        <li><strong>Test Case Generation:</strong> Generate tests that specifically target potential security weaknesses.</li>
        <li><strong>Attack Simulation:</strong> Create tests that simulate common attack patterns.</li>
        <li><strong>Remediation Suggestions:</strong> Generate code fixes for identified security issues.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="security-tests.ts"
        code={`// Example of AI-generated security tests
import { simulateXssAttack, simulateSqlInjection, simulateCsrf } from './security-utils';
import { UserController } from '../controllers/UserController';

describe('Security Tests', () => {
  let userController: UserController;
  
  beforeEach(() => {
    userController = new UserController();
  });
  
  describe('XSS Vulnerability Tests', () => {
    test('user profile should sanitize name input', async () => {
      // AI identified this potential attack vector
      const maliciousName = '<script>alert("XSS")</script>';
      const user = await userController.createUser({
        name: maliciousName,
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Verify name was sanitized
      expect(user.name).not.toBe(maliciousName);
      expect(user.name).not.toContain('<script>');
      
      // Additional XSS test recommended by AI
      const results = await simulateXssAttack(
        'http://localhost:3000/profile',
        { name: maliciousName }
      );
      expect(results.vulnerabilitiesFound).toBe(0);
    });
  });
  
  describe('SQL Injection Tests', () => {
    test('user search should be protected against SQL injection', async () => {
      // AI-generated SQL injection attempts
      const injectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'); --"
      ];
      
      for (const attempt of injectionAttempts) {
        // Test each injection attempt
        const results = await simulateSqlInjection(
          'http://localhost:3000/api/users/search',
          { query: attempt }
        );
        expect(results.vulnerabilitiesFound).toBe(0);
      }
    });
  });
  
  describe('CSRF Protection Tests', () => {
    test('password change endpoint should have CSRF protection', async () => {
      // AI-generated CSRF test
      const results = await simulateCsrf(
        'http://localhost:3000/api/users/change-password',
        { newPassword: 'Hacked123!' }
      );
      expect(results.csrfProtectionPresent).toBe(true);
      expect(results.vulnerabilitiesFound).toBe(0);
    });
  });
});

// Example remediation code generated by AI for an XSS vulnerability
// controllers/UserController.ts

import { sanitizeHtml } from 'sanitize-html';

export class UserController {
  // ...
  
  sanitizeUserInput(user: UserInput): UserInput {
    return {
      ...user,
      name: user.name ? sanitizeHtml(user.name) : '',
      bio: user.bio ? sanitizeHtml(user.bio) : '',
      // Sanitize other user-provided content
    };
  }
  
  async createUser(userInput: UserInput): Promise<User> {
    // Sanitize input before processing
    const sanitizedInput = this.sanitizeUserInput(userInput);
    
    // Proceed with user creation using sanitized input
    // ...
  }
}`}
      />

      <h2 id="test-coverage-optimization">Test Coverage Optimization</h2>
      <p>
        Test coverage measures how much of your code is exercised by your tests. AI can help identify coverage gaps and generate tests to address them.
      </p>

      <h3>AI-Assisted Coverage Optimization Process</h3>
      <ol>
        <li><strong>Coverage Analysis:</strong> Analyze current test coverage to identify gaps.</li>
        <li><strong>Edge Case Identification:</strong> Use AI to identify edge cases and unusual scenarios that might be missed.</li>
        <li><strong>Test Generation:</strong> Generate tests specifically targeting uncovered code paths.</li>
        <li><strong>Test Prioritization:</strong> Prioritize tests based on risk and importance of the functionality.</li>
      </ol>

      <CodeBlock 
        language="typescript"
        filename="coverage-optimization.ts"
        code={`// Example: AI identified these uncovered edge cases in a date formatting utility
import { formatDate } from '../utils/formatDate';

describe('Date Formatting Edge Cases', () => {
  // AI identified these tests were missing from the current suite
  test('handles dates before 1970 (Unix epoch)', () => {
    const oldDate = new Date('1965-07-15');
    expect(formatDate(oldDate, 'YYYY-MM-DD')).toBe('1965-07-15');
  });
  
  test('handles invalid date inputs', () => {
    expect(() => formatDate(new Date('invalid-date'), 'YYYY-MM-DD'))
      .toThrow('Invalid date');
  });
  
  test('handles null or undefined inputs', () => {
    expect(() => formatDate(null as any, 'YYYY-MM-DD'))
      .toThrow('Date is required');
      
    expect(() => formatDate(undefined as any, 'YYYY-MM-DD'))
      .toThrow('Date is required');
  });
  
  test('handles leap years correctly', () => {
    // February 29 in leap year
    const leapYearDate = new Date('2020-02-29');
    expect(formatDate(leapYearDate, 'YYYY-MM-DD')).toBe('2020-02-29');
    
    // Verify day after Feb 28 in non-leap year is March 1
    const nonLeapYearDate = new Date('2021-02-28');
    nonLeapYearDate.setDate(nonLeapYearDate.getDate() + 1);
    expect(formatDate(nonLeapYearDate, 'YYYY-MM-DD')).toBe('2021-03-01');
  });
  
  test('handles daylight saving time transitions', () => {
    // Test a date during spring forward (varies by location)
    const springForward = new Date('2021-03-14T02:30:00'); // US DST change
    expect(formatDate(springForward, 'YYYY-MM-DD HH:mm'))
      .toBe('2021-03-14 02:30');
      
    // Test a date during fall back (varies by location)
    const fallBack = new Date('2021-11-07T01:30:00'); // US DST change
    expect(formatDate(fallBack, 'YYYY-MM-DD HH:mm'))
      .toBe('2021-11-07 01:30');
  });
});

// AI also recommended improving the implementation to handle these edge cases
// utils/formatDate.ts
export function formatDate(date: Date, format: string): string {
  // Check for null or undefined
  if (!date) {
    throw new Error('Date is required');
  }
  
  // Validate date
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  
  // Handle formatting
  // ...implementation...
}`}
      />

      <h2 id="snapshot-testing">AI-Enhanced Snapshot Testing</h2>
      <p>
        Snapshot testing compares the current output of a component or function with a previously captured "snapshot" to detect unexpected changes. AI can enhance this process by generating more meaningful snapshots and helping to analyze differences.
      </p>

      <h3>AI Applications in Snapshot Testing</h3>
      <ul>
        <li><strong>Intelligent Snapshot Generation:</strong> Create snapshots that focus on critical aspects of components.</li>
        <li><strong>Diff Analysis:</strong> Analyze differences between snapshots to determine if changes are expected or problematic.</li>
        <li><strong>Dynamic Snapshot Updates:</strong> Suggest when snapshots should be updated based on intentional changes.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="profile-card.snapshot.test.tsx"
        code={`// Example of AI-enhanced snapshot testing for a React component
import React from 'react';
import { render } from '@testing-library/react';
import { ProfileCard } from '../components/ProfileCard';
import { analyzeSnapshotDiff } from '../test-utils/snapshot-analyzer';

describe('ProfileCard Snapshot Tests', () => {
  // AI helped identify these critical test cases
  test('renders basic profile correctly', () => {
    const { container } = render(
      <ProfileCard
        name="Jane Doe"
        role="Software Engineer"
        avatar="/avatars/jane.jpg"
      />
    );
    
    // Take snapshot with focus on structural elements (AI-recommended approach)
    expect(container).toMatchSnapshot({
      ignoreAttributes: ['data-testid', 'style'],
      focus: ['h2', '.role', '.avatar']
    });
  });
  
  test('renders profile with additional fields correctly', () => {
    const { container } = render(
      <ProfileCard
        name="John Smith"
        role="Product Manager"
        avatar="/avatars/john.jpg"
        department="Product"
        location="New York"
        languages={['English', 'Spanish']}
      />
    );
    
    expect(container).toMatchSnapshot();
  });
  
  // AI-generated test for theme variations
  test.each([
    ['light', false],
    ['dark', false],
    ['light', true],
    ['dark', true]
  ])('renders correctly with %s theme and highlighted: %s', 
    (theme, highlighted) => {
      const { container } = render(
        <ProfileCard
          name="Alex Johnson"
          role="Designer"
          avatar="/avatars/alex.jpg"
          theme={theme as string}
          highlighted={highlighted}
        />
      );
      
      expect(container).toMatchSnapshot();
    }
  );
  
  // AI-recommended snapshot diff analysis
  test('rendering changes analysis', async () => {
    // Capture previous snapshot (e.g., from before a UI change)
    const prevSnapshot = '<div class="profile-card">' +
      '<img class="avatar" src="/avatars/jane.jpg" alt="Jane Doe" />' +
      '<h2>Jane Doe</h2>' +
      '<div class="role">Software Engineer</div>' +
      '</div>';
    
    // Render current component
    const { container } = render(
      <ProfileCard
        name="Jane Doe"
        role="Software Engineer"
        avatar="/avatars/jane.jpg"
        department="Engineering" // Added field
      />
    );
    
    // Use AI to analyze differences
    const results = await analyzeSnapshotDiff(
      prevSnapshot, 
      container.innerHTML
    );
    
    // Check if changes are as expected
    expect(results.hasUnexpectedChanges).toBe(false);
    expect(results.addedElements).toContain('department');
    expect(results.removedElements).toHaveLength(0);
    expect(results.structuralChanges).toHaveLength(0);
  });
});`}
      />

      <h2 id="maintenance-strategies">Test Maintenance Strategies</h2>
      <p>
        As your application evolves, tests often require maintenance. AI can help identify brittle tests and suggest improvements to make your test suite more maintainable.
      </p>

      <h3>AI-Assisted Test Maintenance Techniques</h3>
      <ul>
        <li><strong>Brittleness Detection:</strong> Identify tests that frequently break due to minor changes.</li>
        <li><strong>Test Refactoring:</strong> Suggest improvements to make tests more resilient and maintainable.</li>
        <li><strong>Test Update Automation:</strong> Automatically update tests when the corresponding code changes.</li>
        <li><strong>Test Health Monitoring:</strong> Track test metrics over time to identify trends and issues.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="test-maintenance.ts"
        code={`// Example: AI-suggested test refactoring to improve maintainability
// Before refactoring - brittle test with many implementation details
test('user login process', async () => {
  // This test knows too much about implementation details
  const emailInput = screen.getByTestId('email-input');
  const passwordInput = screen.getByTestId('password-input');
  const submitButton = screen.getByTestId('login-button');
  
  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    expect(window.location.pathname).toBe('/dashboard');
  });
});

// After AI-suggested refactoring - more resilient test
test('user can log in successfully', async () => {
  // Render login component
  render(<Login />);
  
  // Use more resilient selectors based on roles and accessibility
  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  
  // Enter credentials
  await userEvent.type(emailInput, 'user@example.com');
  await userEvent.type(passwordInput, 'password123');
  await userEvent.click(submitButton);
  
  // Verify successful login by checking for expected outcomes
  expect(await screen.findByRole('heading', { name: /welcome/i }))
    .toBeInTheDocument();
  
  // Check for user's name without depending on specific test IDs
  const welcomeMessage = await screen.findByText(/welcome back/i);
  expect(welcomeMessage).toHaveTextContent('John Doe');
  
  // Verify navigation - more robust way to check URL
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});

// AI-suggested test helper functions to reduce duplication
// test-helpers.ts
export const loginTestUser = async (
  email = 'user@example.com', 
  password = 'password123'
) => {
  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  
  await userEvent.type(emailInput, email);
  await userEvent.type(passwordInput, password);
  await userEvent.click(submitButton);
  
  return await screen.findByRole('heading', { name: /welcome/i });
};`}
      />

      <Callout type="warning" title="Test Suite Health">
        Use AI to periodically analyze your test suite's health by identifying slow tests, flaky tests, and tests that frequently break due to changes. This proactive approach helps maintain a reliable test suite as your application evolves.
      </Callout>

      <p>
        By leveraging these advanced AI-assisted testing techniques, you can create more robust, comprehensive test suites that effectively validate complex application behaviors and adapt to changing requirements. These approaches build upon the fundamentals covered in the main workshop, allowing you to tackle increasingly sophisticated testing scenarios with confidence.
      </p>
    </ContentTemplate>
  )
} 