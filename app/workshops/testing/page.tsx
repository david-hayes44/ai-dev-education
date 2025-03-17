import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestTube, Upload, CheckSquare, Lightbulb, ArrowRight } from "lucide-react"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "AI-Assisted Testing Workshop",
  description: "Learn how to leverage AI to generate, improve, and analyze tests for your codebase through practical, hands-on exercises.",
  keywords: ["AI testing", "unit tests", "test generation", "test coverage", "TDD", "Cursor", "Windsurf"],
  section: "workshops/testing"
})

export default function TestingWorkshopPage() {
  return (
    <ContentTemplate
      title="AI-Assisted Testing Workshop"
      description="Learn how to leverage AI to generate, improve, and analyze tests for your codebase through practical, hands-on exercises."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "45 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction/getting-started"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "overview",
          title: "Workshop Overview",
          level: 2
        },
        {
          id: "why-ai-testing",
          title: "Why Use AI for Testing?",
          level: 2
        },
        {
          id: "module-1",
          title: "Module 1: Generating Basic Unit Tests",
          level: 2,
          children: [
            {
              id: "understanding-function",
              title: "Understanding the Function",
              level: 3
            },
            {
              id: "generating-tests",
              title: "Generating Tests with AI",
              level: 3
            }
          ]
        },
        {
          id: "module-2",
          title: "Module 2: Improving Test Coverage",
          level: 2
        },
        {
          id: "module-3",
          title: "Module 3: Test-Driven Development with AI",
          level: 2
        },
        {
          id: "module-4",
          title: "Module 4: Testing Legacy Code",
          level: 2
        },
        {
          id: "upload-code",
          title: "Upload Your Own Code",
          level: 2
        },
        {
          id: "best-practices",
          title: "Best Practices",
          level: 2
        },
        {
          id: "next-steps",
          title: "Next Steps",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Best Practices for AI-Assisted Development",
          href: "/best-practices",
          description: "Learn how to effectively utilize AI tools in your development workflow."
        },
        {
          title: "AI Models and Capabilities",
          href: "/introduction/models",
          description: "Understand the capabilities and limitations of different AI models in development contexts."
        },
        {
          title: "Practical Prompt Engineering",
          href: "/best-practices/prompting",
          description: "Master the art of crafting effective prompts for AI-assisted development."
        }
      ]}
    >
      <div className="my-8 rounded-xl bg-primary/5 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <TestTube className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium">Interactive Learning Experience</h3>
            <p className="text-muted-foreground">
              This workshop is designed for active participation. You'll get the most value by following along 
              with the examples or uploading your own code to see immediate results.
            </p>
          </div>
        </div>
      </div>

      <h2 id="overview">Workshop Overview</h2>
      <p>
        Testing is a critical part of software development, but it can be time-consuming and challenging to 
        write comprehensive tests. This workshop demonstrates how AI tools like Cursor and Windsurf can 
        help you write better tests faster, improve your test coverage, and even approach Test-Driven 
        Development (TDD) with AI assistance.
      </p>
      <p>
        By the end of this workshop, you'll be able to:
      </p>
      <ul>
        <li>Generate unit tests for new and existing code using AI</li>
        <li>Analyze and improve test coverage with AI assistance</li>
        <li>Practice Test-Driven Development with AI as your pair programmer</li>
        <li>Effectively test complex or legacy code with AI guidance</li>
      </ul>

      <h2 id="why-ai-testing">Why Use AI for Testing?</h2>
      <div className="grid gap-6 md:grid-cols-3 my-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>Increased Coverage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI can help identify edge cases and scenarios you might miss, leading to more comprehensive test coverage.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Reduced Time Investment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate the boilerplate and basic test cases quickly, so you can focus on more complex testing scenarios.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              <span>Improved Test Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI can suggest best practices and help you write more readable, maintainable, and effective tests.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 id="module-1">Module 1: Generating Basic Unit Tests</h2>
      <p>
        In this module, we'll start with a simple JavaScript function and use AI to generate unit tests for it. 
        We'll explore different testing frameworks and approaches.
      </p>

      <h3 id="understanding-function">Understanding the Function</h3>
      <p>
        Let's consider this simple utility function that validates email addresses:
      </p>

      <CodeBlock 
        language="javascript"
        filename="validateEmail.js"
        code={`function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, reason: 'Email is required' };
  }
  
  if (typeof email !== 'string') {
    return { valid: false, reason: 'Email must be a string' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }
  
  return { valid: true };
}

module.exports = validateEmail;`}
      />

      <h3 id="generating-tests">Generating Tests with AI</h3>
      <p>
        Now let's use Cursor to generate tests for this function. Here's how to approach it:
      </p>

      <Tabs defaultValue="jest">
        <TabsList className="mb-4">
          <TabsTrigger value="jest">Jest</TabsTrigger>
          <TabsTrigger value="mocha">Mocha</TabsTrigger>
        </TabsList>
        <TabsContent value="jest">
          <p>Let's use Jest to test our email validation function:</p>
          
          <Callout type="info" title="AI Prompt">
            Generate comprehensive Jest tests for this validateEmail function. Include tests for valid emails, 
            invalid formats, edge cases, and error conditions.
          </Callout>

          <CodeBlock 
            language="javascript"
            filename="validateEmail.test.js"
            code={`const validateEmail = require('./validateEmail');

describe('validateEmail', () => {
  test('should return valid for correct email format', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
  });

  test('should return invalid when email is missing', () => {
    const result = validateEmail();
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Email is required');
  });

  test('should return invalid when email is not a string', () => {
    const result = validateEmail(123);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Email must be a string');
  });

  test('should return invalid for incorrect email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Invalid email format');
  });

  test('should handle emails with subdomains', () => {
    const result = validateEmail('user@sub.example.com');
    expect(result.valid).toBe(true);
  });

  test('should reject emails with spaces', () => {
    const result = validateEmail('user @example.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Invalid email format');
  });
});`}
          />
        </TabsContent>
        <TabsContent value="mocha">
          <p>Here's how we can test the same function using Mocha and Chai:</p>
          
          <Callout type="info" title="AI Prompt">
            Generate comprehensive Mocha and Chai tests for this validateEmail function. Include tests for valid emails, 
            invalid formats, edge cases, and error conditions.
          </Callout>

          <CodeBlock 
            language="javascript"
            filename="validateEmail.test.js"
            code={`const validateEmail = require('./validateEmail');
const { expect } = require('chai');

describe('validateEmail', () => {
  it('should return valid for correct email format', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).to.be.true;
  });

  it('should return invalid when email is missing', () => {
    const result = validateEmail();
    expect(result.valid).to.be.false;
    expect(result.reason).to.equal('Email is required');
  });

  it('should return invalid when email is not a string', () => {
    const result = validateEmail(123);
    expect(result.valid).to.be.false;
    expect(result.reason).to.equal('Email must be a string');
  });

  it('should return invalid for incorrect email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).to.be.false;
    expect(result.reason).to.equal('Invalid email format');
  });

  it('should handle emails with subdomains', () => {
    const result = validateEmail('user@sub.example.com');
    expect(result.valid).to.be.true;
  });

  it('should reject emails with spaces', () => {
    const result = validateEmail('user @example.com');
    expect(result.valid).to.be.false;
    expect(result.reason).to.equal('Invalid email format');
  });
});`}
          />
        </TabsContent>
      </Tabs>

      <Callout type="tip" title="Try It Yourself">
        In Cursor, create these two files and run the tests. Notice how AI was able to generate comprehensive 
        tests that cover various scenarios including edge cases. Try modifying the function slightly and 
        see if the tests catch the changes.
      </Callout>

      <h2 id="module-2">Module 2: Improving Test Coverage</h2>
      <p>
        Now let's explore how AI can help identify gaps in test coverage and suggest additional tests.
      </p>

      <Callout type="info" title="AI Prompt">
        Analyze the test coverage for the validateEmail function. Are there any edge cases or scenarios 
        not covered by our current tests? Suggest additional tests to improve coverage.
      </Callout>

      <CodeBlock 
        language="javascript"
        filename="Additional Tests"
        code={`// Additional test cases to improve coverage

// Test handling of emails with plus addressing
test('should handle emails with plus addressing', () => {
  const result = validateEmail('user+tag@example.com');
  expect(result.valid).toBe(true);
});

// Test handling of very long email addresses
test('should handle very long email addresses', () => {
  const longName = 'a'.repeat(64);
  const longDomain = 'b'.repeat(63);
  const result = validateEmail(longName + '@' + longDomain + '.com');
  expect(result.valid).toBe(true);
});

// Test handling of uppercase characters
test('should handle uppercase characters in email', () => {
  const result = validateEmail('User@Example.COM');
  expect(result.valid).toBe(true);
});

// Test handling of empty strings
test('should reject empty strings', () => {
  const result = validateEmail('');
  expect(result.valid).toBe(false);
  expect(result.reason).toBe('Invalid email format');
});

// Test handling of emails with IP addresses
test('should handle emails with IP addresses as domain', () => {
  const result = validateEmail('user@[192.168.1.1]');
  // Note: Our current regex doesn't support this format
  expect(result.valid).toBe(false);
});`}
      />

      <p>
        This example shows how AI can identify scenarios you might have overlooked, such as:
      </p>
      <ul>
        <li>Emails with plus addressing (common in Gmail)</li>
        <li>Very long email addresses (testing boundary conditions)</li>
        <li>Case sensitivity handling</li>
        <li>Empty strings versus null/undefined</li>
        <li>Special formats like IP addresses in the domain part</li>
      </ul>

      <h2 id="module-3">Module 3: Test-Driven Development with AI</h2>
      <p>
        In this module, we'll explore how to use AI as a pair programming partner in a Test-Driven Development workflow.
      </p>

      <Callout type="info">
        Test-Driven Development (TDD) follows a cycle of:
        <ol>
          <li>Write a failing test for a new feature</li>
          <li>Implement the minimum code needed to pass the test</li>
          <li>Refactor the code while ensuring tests still pass</li>
        </ol>
      </Callout>

      <p>
        Let's try this with a new function that formats phone numbers:
      </p>

      <CodeBlock 
        language="javascript"
        filename="TDD Example - Step 1: Writing Tests First"
        code={`// phoneFormatter.test.js
const formatPhoneNumber = require('./phoneFormatter');

describe('formatPhoneNumber', () => {
  test('should format a 10-digit number to (XXX) XXX-XXXX', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  test('should handle numbers with existing formatting', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
  });

  test('should handle numbers with country code', () => {
    expect(formatPhoneNumber('+11234567890')).toBe('+1 (123) 456-7890');
  });

  test('should return null for invalid inputs', () => {
    expect(formatPhoneNumber(null)).toBe(null);
    expect(formatPhoneNumber('')).toBe(null);
    expect(formatPhoneNumber('123')).toBe(null);
    expect(formatPhoneNumber('abcdefghij')).toBe(null);
  });
});`}
      />

      <p>
        Now, let's ask the AI to implement the function based on these tests:
      </p>

      <Callout type="info" title="AI Prompt">
        Implement the formatPhoneNumber function that will pass all these tests.
      </Callout>

      <CodeBlock 
        language="javascript"
        filename="phoneFormatter.js"
        code={`function formatPhoneNumber(phoneNumber) {
  // Handle invalid inputs
  if (!phoneNumber) return null;
  
  // Extract digits and potential country code
  let digits = phoneNumber.replace(/\\D/g, '');
  let hasCountryCode = phoneNumber.includes('+');
  
  // Check if we have a valid number of digits
  if (digits.length < 10) return null;
  
  // Handle country code
  let countryCode = '';
  if (hasCountryCode && digits.length > 10) {
    countryCode = '+' + digits.slice(0, digits.length - 10);
    digits = digits.slice(digits.length - 10);
  }
  
  // Check if we have exactly 10 digits after extraction
  if (digits.length !== 10) return null;
  
  // Format the phone number
  const formattedNumber = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  
  return countryCode ? countryCode + ' ' + formattedNumber : formattedNumber;
}

module.exports = formatPhoneNumber;`}
      />

      <Callout type="tip" title="AI-Assisted TDD Workflow">
        <p>Using AI for TDD can be highly effective:</p>
        <ol>
          <li>You write the tests first (or have AI suggest tests based on requirements)</li>
          <li>AI implements the function to pass those tests</li>
          <li>You review the implementation and make adjustments if needed</li>
          <li>If requirements change, update the tests and have AI adapt the implementation</li>
        </ol>
      </Callout>

      <h2 id="module-4">Module 4: Testing Legacy Code</h2>
      <p>
        Testing legacy code can be particularly challenging. Let's see how AI can help with this task.
      </p>

      <CodeBlock 
        language="javascript"
        filename="legacyParser.js"
        code={`// A legacy function with no tests
function parseConfig(input) {
  var result = {};
  var lines = input.split('\\n');
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Skip empty lines and comments
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    
    // Handle section headers
    if (line.startsWith('[') && line.endsWith(']')) {
      var section = line.substring(1, line.length - 1);
      result[section] = {};
      continue;
    }
    
    // Handle key-value pairs
    var parts = line.split('=');
    if (parts.length >= 2) {
      var key = parts[0].trim();
      var value = parts.slice(1).join('=').trim();
      
      // Handle values in the current section
      var currentSection = Object.keys(result).pop();
      if (currentSection && result[currentSection] !== undefined) {
        result[currentSection][key] = parseValue(value);
      } else {
        result[key] = parseValue(value);
      }
    }
  }
  
  return result;
  
  function parseValue(val) {
    // Convert boolean strings
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
    
    // Convert numbers
    if (!isNaN(val) && val.trim() !== '') {
      return Number(val);
    }
    
    // Handle quoted strings
    if ((val.startsWith('"') && val.endsWith('"')) || 
        (val.startsWith("'") && val.endsWith("'"))) {
      return val.substring(1, val.length - 1);
    }
    
    return val;
  }
}

module.exports = parseConfig;`}
      />

      <Callout type="info" title="AI Prompt">
        This legacy function parses a configuration file format. I need comprehensive tests for it, 
        but I'm not sure how all the edge cases work. Analyze the function and generate tests that 
        cover all the functionality and potential edge cases.
      </Callout>

      <CodeBlock 
        language="javascript"
        filename="legacyParser.test.js"
        code={`const parseConfig = require('./legacyParser');

describe('parseConfig', () => {
  test('should parse simple key-value pairs', () => {
    const input = 'name=John\nage=30\nenabled=true';
    const expected = {
      name: 'John',
      age: 30,
      enabled: true
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should handle sections', () => {
    const input = '[user]\nname=John\nage=30\n[settings]\nenabled=true';
    const expected = {
      user: {
        name: 'John',
        age: 30
      },
      settings: {
        enabled: true
      }
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should skip comments and empty lines', () => {
    const input = '# This is a comment\nname=John\n\n# Another comment\nage=30';
    const expected = {
      name: 'John',
      age: 30
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should parse different value types', () => {
    const input = 'string=plain\nquoted="value"\nnumber=42\nfloat=3.14\ntrue=true\nfalse=false';
    const expected = {
      string: 'plain',
      quoted: 'value',
      number: 42,
      float: 3.14,
      true: true,
      false: false
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should handle equals sign in values', () => {
    const input = 'equation=2+2=4\nformula=a=b+c';
    const expected = {
      equation: '2+2=4',
      formula: 'a=b+c'
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should handle empty sections', () => {
    const input = '[empty]\n[user]\nname=John';
    const expected = {
      empty: {},
      user: {
        name: 'John'
      }
    };
    expect(parseConfig(input)).toEqual(expected);
  });

  test('should handle quotes correctly', () => {
    const input = 'single=\'quoted value\'\ndouble="double quoted"\nnested=\'nested "quotes"\'';
    const expected = {
      single: 'quoted value',
      double: 'double quoted',
      nested: 'nested "quotes"'
    };
    expect(parseConfig(input)).toEqual(expected);
  });
});`}
      />

      <Callout type="warning" title="Legacy Code Challenges">
        <p>When using AI to test legacy code:</p>
        <ul>
          <li>The AI might not catch all edge cases on the first attempt</li>
          <li>You may need to iteratively improve the tests as you discover more about how the code works</li>
          <li>Consider using the tests to document the actual behavior, then refactor the code later</li>
        </ul>
      </Callout>

      <h2 id="upload-code">Upload Your Own Code</h2>
      <div className="rounded-xl border bg-card p-6 shadow-sm my-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary md:p-5">
            <Upload className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-2xl font-bold">Try with Your Code</h3>
            <p className="mb-4 text-muted-foreground md:mb-0">
              Upload your own function or class to see how AI can help you write tests for it.
              Get immediate feedback and suggestions for improving your test coverage.
            </p>
          </div>
          <Button>
            Upload Code <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <p>
        To try this with your own code:
      </p>
      <ol>
        <li>Create a new file in Cursor or Windsurf</li>
        <li>Paste your code that needs tests</li>
        <li>Ask the AI: "Write comprehensive tests for this code"</li>
        <li>Review the generated tests and make adjustments as needed</li>
        <li>Ask for improvements or additional coverage if necessary</li>
      </ol>

      <h2 id="best-practices">Best Practices</h2>
      <div className="my-6">
        <Callout type="tip">
          <h3 className="font-medium mb-2">Effective Prompts for Testing</h3>
          <p>When asking AI to help with testing, be specific about:</p>
          <ul>
            <li>The testing framework you're using (Jest, Mocha, PyTest, etc.)</li>
            <li>The type of tests you need (unit, integration, etc.)</li>
            <li>Any specific edge cases you want to cover</li>
            <li>The expected behavior of the code</li>
          </ul>
        </Callout>
      </div>

      <p>Here are some additional best practices for AI-assisted testing:</p>
      <ul>
        <li><strong>Review the tests:</strong> Always review AI-generated tests to ensure they're testing what you expect</li>
        <li><strong>Iterative approach:</strong> Start with basic tests and gradually add more complex scenarios</li>
        <li><strong>Balance coverage and readability:</strong> Aim for comprehensive coverage but keep tests maintainable</li>
        <li><strong>Add human insight:</strong> Supplement AI-generated tests with your domain knowledge</li>
        <li><strong>Document assumptions:</strong> Make sure tests document your assumptions about how the code should behave</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Now that you've learned the basics of AI-assisted testing, here are some next steps to continue your journey:
      </p>
      <ul>
        <li>Apply these techniques to your real-world projects</li>
        <li>Experiment with different testing frameworks and approaches</li>
        <li>Try more advanced testing scenarios like mocking, stubbing, and spying</li>
        <li>Explore integration and end-to-end testing with AI assistance</li>
        <li>Share your experiences and learn from others in the community</li>
      </ul>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/workshops">
            Back to Workshops
          </Link>
        </Button>
        <Button asChild>
          <Link href="/workshops/testing/advanced">
            Advanced Testing Techniques
          </Link>
        </Button>
      </div>
    </ContentTemplate>
  )
} 