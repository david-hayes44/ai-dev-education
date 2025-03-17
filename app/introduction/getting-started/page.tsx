import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Getting Started with AI-Assisted Development",
  description: "Learn how to begin your journey with AI-assisted development tools and techniques.",
  keywords: ["AI tools", "setup", "workflow integration", "prompt engineering", "first steps"],
  section: "introduction/getting-started"
})

export default function GettingStartedPage() {
  return (
    <ContentTemplate
      title="Getting Started with AI-Assisted Development"
      description="Learn how to begin your journey with AI-assisted development tools and techniques."
      metadata={{
        difficulty: "beginner",
        timeToComplete: "20 minutes",
        prerequisites: [
          {
            title: "AI-Assisted Development Concepts",
            href: "/introduction/concepts"
          },
          {
            title: "Benefits of AI-Assisted Development",
            href: "/introduction/benefits"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "choosing-tools",
          title: "Choosing the Right AI Tools",
          level: 2
        },
        {
          id: "setting-up",
          title: "Setting Up Your Development Environment",
          level: 2
        },
        {
          id: "first-steps",
          title: "First Steps with AI Assistance",
          level: 2,
          children: [
            {
              id: "code-completion",
              title: "Using Code Completion",
              level: 3
            },
            {
              id: "code-generation",
              title: "Generating Code with Natural Language",
              level: 3
            },
            {
              id: "code-explanation",
              title: "Getting Code Explanations",
              level: 3
            }
          ]
        },
        {
          id: "effective-prompts",
          title: "Writing Effective Prompts",
          level: 2
        },
        {
          id: "integration-workflow",
          title: "Integrating AI into Your Workflow",
          level: 2
        },
        {
          id: "common-challenges",
          title: "Overcoming Common Challenges",
          level: 2
        },
        {
          id: "first-example-project",
          title: "First Example Project",
          level: 2
        },
        {
          id: "next-steps",
          title: "Next Steps in Your AI Development Journey",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Understanding the Model Context Protocol",
          href: "/mcp",
          description: "Learn how MCP enhances context management in AI tools."
        },
        {
          title: "AI Development Tools Overview",
          href: "/tools",
          description: "Explore the various AI tools available for developers."
        },
        {
          title: "Best Practices for AI-Assisted Development",
          href: "/best-practices",
          description: "Discover patterns and practices for effective AI-assisted development."
        }
      ]}
    >
      <p>
        Starting your journey with AI-assisted development can significantly enhance your 
        productivity and code quality. This guide provides practical steps to incorporate AI 
        tools into your development workflow, from selecting the right tools to establishing 
        effective patterns for day-to-day coding.
      </p>

      <h2 id="choosing-tools">Choosing the Right AI Tools</h2>
      <p>
        The landscape of AI development tools is expanding rapidly. Here are some 
        considerations to guide your selection:
      </p>

      <ul>
        <li>
          <strong>IDE Integrations vs. Standalone Tools</strong> - Choose between AI tools 
          that integrate with your existing IDE (like GitHub Copilot, Codeium, or Cursor) 
          or standalone tools that offer specialized capabilities
        </li>
        <li>
          <strong>Programming Language Support</strong> - Ensure the tool provides strong 
          support for your primary programming languages and frameworks
        </li>
        <li>
          <strong>Context Management</strong> - Look for tools that effectively manage context 
          to provide more relevant suggestions (tools supporting MCP are ideal)
        </li>
        <li>
          <strong>Team Collaboration Features</strong> - Consider how the tool facilitates 
          sharing context or prompts among team members
        </li>
        <li>
          <strong>Cost vs. Capability</strong> - Weigh the subscription costs against the 
          productivity benefits, considering both individual and team licensing options
        </li>
      </ul>

      <Callout type="info" title="Popular AI Development Tools">
        <p>Some widely-used AI development tools include:</p>
        <ul>
          <li><strong>GitHub Copilot</strong> - Deep integration with popular IDEs</li>
          <li><strong>Cursor</strong> - AI-native code editor with natural language features</li>
          <li><strong>Codeium</strong> - Free alternative with strong multilingual support</li>
          <li><strong>Tabnine</strong> - Code completion with privacy-focused options</li>
          <li><strong>JetBrains AI Assistant</strong> - Native integration in JetBrains IDEs</li>
        </ul>
      </Callout>

      <h2 id="setting-up">Setting Up Your Development Environment</h2>
      <p>
        Once you've selected tools, follow these steps to set up your AI-enhanced development environment:
      </p>

      <ol>
        <li>
          <strong>Installation</strong> - Install your chosen AI coding assistant following 
          the vendor's instructions (typically through an extension marketplace or standalone installer)
        </li>
        <li>
          <strong>Authentication</strong> - Complete any required authentication or API key setup
        </li>
        <li>
          <strong>Configuration</strong> - Adjust settings to match your preferences:
          <ul>
            <li>Enable/disable autocompletion frequency</li>
            <li>Set keybindings for AI interactions</li>
            <li>Configure inline suggestion behavior</li>
            <li>Adjust privacy settings if available</li>
          </ul>
        </li>
        <li>
          <strong>MCP Setup</strong> - If your tool supports the Model Context Protocol, 
          configure workspace-specific rules and context management
        </li>
        <li>
          <strong>Extension Integration</strong> - Install additional extensions that enhance 
          AI capabilities (like specialized language servers)
        </li>
      </ol>

      <CodeBlock 
        language="json"
        filename=".vscode/settings.json (example configuration)"
        code={`{
  // GitHub Copilot configuration example
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": false,
    "scminput": false
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "editor.inlineSuggest.enabled": true,
  "editor.inlineSuggest.showToolbar": "always",
  
  // Additional language-specific settings
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}`}
      />

      <h2 id="first-steps">First Steps with AI Assistance</h2>
      <p>
        Start with these basic interactions to become familiar with AI-assisted development:
      </p>

      <h3 id="code-completion">Using Code Completion</h3>
      <p>
        Code completion is the most basic form of AI assistance, suggesting the next lines 
        as you type:
      </p>
      <ol>
        <li>Start typing a function or method</li>
        <li>Observe inline suggestions appearing</li>
        <li>Press Tab or the assigned key to accept suggestions</li>
        <li>Use Escape or continue typing to ignore suggestions</li>
      </ol>

      <h3 id="code-generation">Generating Code with Natural Language</h3>
      <p>
        Many AI tools can generate code based on natural language descriptions:
      </p>
      <ol>
        <li>
          Add a comment describing what you want to implement<br />
          <code>{"// Create a function that validates email addresses using regex"}</code>
        </li>
        <li>Press Enter or the tool's generation shortcut</li>
        <li>Review the generated code and modify as needed</li>
      </ol>

      <CodeBlock 
        language="javascript"
        filename="example-generation.js"
        code={`// Create a function that validates email addresses using regex
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Test the function with different emails
console.log(validateEmail('test@example.com')); // true
console.log(validateEmail('invalid-email')); // false
console.log(validateEmail('test@example')); // false (missing top-level domain)`}
      />

      <h3 id="code-explanation">Getting Code Explanations</h3>
      <p>
        AI tools can help you understand unfamiliar code:
      </p>
      <ol>
        <li>Select the code you want to understand</li>
        <li>Use the explain or chat feature of your AI tool</li>
        <li>Ask follow-up questions to clarify specific aspects</li>
      </ol>

      <Callout type="tip" title="Start Small">
        Begin with simpler tasks while you learn how your AI assistant works. Gradually 
        progress to more complex code generation as you understand the tool's capabilities 
        and limitations. This approach helps build confidence and develop effective collaboration 
        patterns with the AI.
      </Callout>

      <h2 id="effective-prompts">Writing Effective Prompts</h2>
      <p>
        The quality of AI-generated code largely depends on your prompts. Use these strategies 
        to write effective prompts:
      </p>

      <ul>
        <li>
          <strong>Be specific and detailed</strong> - Include requirements, edge cases, and expected behavior
          <br />
          <code>{"// Implement a pagination function that takes an array of items, page number, and page size. \n// It should handle empty arrays and return the correct page of items along with metadata about total pages."}</code>
        </li>
        <li>
          <strong>Provide context</strong> - Include relevant information about your project, frameworks, or patterns
          <br />
          <code>{"// In our React + TypeScript project using the repository pattern, implement a user service \n// that handles authentication with our Firebase backend"}</code>
        </li>
        <li>
          <strong>Specify format and style</strong> - Request code that follows your project's conventions
          <br />
          <code>{"// Using our functional programming approach with immutability, implement a data \n// transformation function that converts the API response to our internal format"}</code>
        </li>
        <li>
          <strong>Use iterative prompting</strong> - Start with a basic prompt, then refine based on the response
        </li>
      </ul>

      <h2 id="integration-workflow">Integrating AI into Your Workflow</h2>
      <p>
        Develop a systematic approach to using AI in your development workflow:
      </p>

      <ol>
        <li>
          <strong>Planning Phase</strong>
          <ul>
            <li>Use AI to brainstorm architectural approaches</li>
            <li>Generate pseudocode or scaffold structures</li>
            <li>Create test plans based on requirements</li>
          </ul>
        </li>
        <li>
          <strong>Implementation Phase</strong>
          <ul>
            <li>Generate boilerplate and routine code</li>
            <li>Use AI for complex algorithms or patterns</li>
            <li>Get implementation alternatives for comparison</li>
          </ul>
        </li>
        <li>
          <strong>Testing Phase</strong>
          <ul>
            <li>Generate unit and integration tests</li>
            <li>Create test data and edge cases</li>
            <li>Debug issues with AI assistance</li>
          </ul>
        </li>
        <li>
          <strong>Documentation Phase</strong>
          <ul>
            <li>Generate code comments and documentation</li>
            <li>Create user guides or API documentation</li>
            <li>Document known limitations or future improvements</li>
          </ul>
        </li>
      </ol>

      <Callout type="warning">
        Always review AI-generated code carefully before integration. While AI tools are powerful,
        they may occasionally produce code that compiles but contains logical errors, security
        vulnerabilities, or inefficient patterns. Your expertise remains essential in evaluating
        and refining the generated solutions.
      </Callout>

      <h2 id="common-challenges">Overcoming Common Challenges</h2>
      <p>
        Be prepared to address these common challenges when starting with AI-assisted development:
      </p>

      <ul>
        <li>
          <strong>Context Limitations</strong> - AI tools may have limited understanding of your 
          entire codebase. Provide more context in your prompts or use MCP-enabled tools.
        </li>
        <li>
          <strong>Overreliance</strong> - Avoid accepting AI suggestions without understanding them. 
          Take time to review and learn from the generated code.
        </li>
        <li>
          <strong>Inconsistent Quality</strong> - Results can vary based on your prompt and the 
          AI's training. Iterate on your prompts to improve outcomes.
        </li>
        <li>
          <strong>Security Concerns</strong> - AI may occasionally generate code with security 
          issues. Always review security-sensitive areas and run appropriate security scans.
        </li>
        <li>
          <strong>Learning Curve</strong> - Effective prompting is a skill that develops with 
          practice. Keep refining your prompting techniques.
        </li>
      </ul>

      <h2 id="first-example-project">First Example Project</h2>
      <p>
        Let's walk through a complete example of creating a simple project with AI assistance to demonstrate 
        how these concepts work together in practice. We'll build a basic weather dashboard that fetches 
        and displays weather data.
      </p>

      <h3>1. Project Planning with AI</h3>
      <CodeBlock 
        language="text"
        code={`User: Help me plan a simple weather dashboard web app using React.

AI: I'll help you plan a React weather dashboard. Here's a simple structure:

1. Components:
   - WeatherDashboard (main container)
   - SearchBar (for city input)
   - CurrentWeather (displays current conditions)
   - ForecastList (shows 5-day forecast)
   - WeatherCard (reusable component for forecast items)
   - LoadingIndicator
   - ErrorMessage

2. Data Flow:
   - Use OpenWeatherMap API (free tier)
   - Store API key in .env file
   - Manage state with useState or useContext
   - Handle API calls with async/await and fetch or axios

3. Features:
   - Search by city name
   - Display current temperature, conditions, humidity, wind
   - Show 5-day forecast
   - Toggle between Celsius/Fahrenheit
   - Responsive design for mobile/desktop

4. Project Setup:
   - Create React App or Vite for bootstrapping
   - Use CSS modules or styled-components for styling
   - Add simple error handling for API failures

Would you like me to help with any specific part of this plan?`}
      />

      <h3>2. Project Setup with AI</h3>
      <CodeBlock 
        language="text"
        code={`User: Help me set up the initial project structure with Vite and React.

AI: I'll help you set up a new React project with Vite. First, run these commands in your terminal:

\`\`\`bash
npm create vite@latest weather-dashboard -- --template react
cd weather-dashboard
npm install
npm install axios
\`\`\`

Now let's set up our project structure:

\`\`\`
src/
├── components/
│   ├── CurrentWeather.jsx
│   ├── ForecastList.jsx
│   ├── SearchBar.jsx
│   ├── WeatherCard.jsx
│   ├── LoadingIndicator.jsx
│   └── ErrorMessage.jsx
├── services/
│   └── weatherService.js
├── hooks/
│   └── useWeather.js
├── utils/
│   └── formatters.js
├── App.jsx
└── main.jsx
\`\`\`

I can help you create any of these files.`}
      />

      <h3>3. Implementing Components</h3>
      <CodeBlock 
        language="jsx"
        filename="components/SearchBar.jsx"
        code={`import { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        aria-label="City name"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;`}
      />

      <p>
        Using AI assistance, you can generate the rest of the components in a similar way. For example, 
        you might ask the AI to generate the CurrentWeather component that displays the current conditions.
      </p>

      <h3>4. Creating the API Service</h3>
      <CodeBlock 
        language="javascript"
        filename="services/weatherService.js"
        code={`import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(\`\${BASE_URL}/weather\`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const getForecastByCity = async (city) => {
  try {
    const response = await axios.get(\`\${BASE_URL}/forecast\`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};`}
      />

      <h3>5. Creating a Custom Hook</h3>
      <CodeBlock 
        language="javascript"
        filename="hooks/useWeather.js"
        code={`import { useState } from 'react';
import { getWeatherByCity, getForecastByCity } from '../services/weatherService';

const useWeather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    
    try {
      const weatherData = await getWeatherByCity(city);
      setCurrentWeather(weatherData);
      
      const forecastData = await getForecastByCity(city);
      
      // Process forecast data to get one forecast per day
      const dailyForecasts = forecastData.list.filter(item => 
        item.dt_txt.includes('12:00:00')
      ).slice(0, 5);
      
      setForecast(dailyForecasts);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setCurrentWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentWeather,
    forecast,
    loading,
    error,
    fetchWeather
  };
};

export default useWeather;`}
      />

      <h3>6. Integrating in App.jsx</h3>
      <CodeBlock 
        language="jsx"
        filename="App.jsx"
        code={`import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import useWeather from './hooks/useWeather';
import './App.css';

function App() {
  const { currentWeather, forecast, loading, error, fetchWeather } = useWeather();
  
  const handleSearch = (city) => {
    fetchWeather(city);
  };
  
  // Optional: Load default city on initial render
  useEffect(() => {
    fetchWeather('London');
  }, []);

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>
      <SearchBar onSearch={handleSearch} />
      
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
      
      {currentWeather && !loading && (
        <CurrentWeather data={currentWeather} />
      )}
      
      {forecast.length > 0 && !loading && (
        <ForecastList data={forecast} />
      )}
    </div>
  );
}

export default App;`}
      />

      <h3>7. Debugging with AI</h3>
      <CodeBlock 
        language="text"
        code={`User: I'm getting an error "TypeError: Cannot read properties of null (reading 'main')" in my CurrentWeather component.

AI: This error occurs when you're trying to access a property on a null or undefined value. Specifically, you're likely trying to access currentWeather.main when currentWeather is null.

In your CurrentWeather component, make sure you're checking if the data exists before accessing its properties:

\`\`\`jsx
const CurrentWeather = ({ data }) => {
  // Add this check at the beginning
  if (!data || !data.main) {
    return <div>No weather data available</div>;
  }

  // Now you can safely access data.main
  const { temp, feels_like, humidity } = data.main;
  
  // Rest of your component...
}
\`\`\`

This pattern is called defensive programming and helps prevent these types of errors.`}
      />

      <h3>8. Enhancing and Refining</h3>
      <p>
        Once your basic application works, you can use AI to help enhance and refine it:
      </p>
      <ul>
        <li>Ask for styling improvements using CSS or styled-components</li>
        <li>Generate unit tests for your components</li>
        <li>Add new features like geolocation or weather maps</li>
        <li>Optimize performance for larger applications</li>
        <li>Implement error boundary components for better error handling</li>
      </ul>

      <Callout type="success" title="Learning Through Building">
        This simple project demonstrates many aspects of AI-assisted development: planning, code generation, 
        component creation, API integration, and debugging. By working through a complete example like this, 
        you'll develop an intuition for when and how to effectively leverage AI throughout the software 
        development lifecycle.
      </Callout>

      <h2 id="next-steps">Next Steps in Your AI Development Journey</h2>
      <p>
        As you become comfortable with basic AI-assisted development, consider these advanced steps:
      </p>

      <ul>
        <li>
          <strong>Explore MCP Integration</strong> - Set up standardized context management 
          using the Model Context Protocol for improved AI assistance
        </li>
        <li>
          <strong>Develop Team Guidelines</strong> - Create shared practices for using AI tools 
          consistently across your team
        </li>
        <li>
          <strong>Create Custom Prompts Library</strong> - Build a collection of effective prompts 
          for common tasks in your project
        </li>
        <li>
          <strong>Measure Impact</strong> - Track productivity improvements and code quality 
          metrics to quantify AI assistance benefits
        </li>
        <li>
          <strong>Experiment with Advanced Features</strong> - Try more complex interactions 
          like pair programming sessions or architectural consultations with AI
        </li>
      </ul>

      <Callout type="success" title="Practice Makes Perfect">
        The effectiveness of AI-assisted development improves significantly with practice. 
        Dedicate time to experimenting with different approaches and refining your interaction 
        patterns. Many developers report that after 2-3 weeks of consistent use, working with 
        AI assistants becomes second nature and notably enhances their development speed and quality.
      </Callout>
    </ContentTemplate>
  )
}