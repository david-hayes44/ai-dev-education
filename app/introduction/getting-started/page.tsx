import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Getting Started with Cursor and Windsurf",
  description: "Learn how to begin your journey with Cursor and Windsurf for AI-assisted development.",
  keywords: ["Cursor", "Windsurf", "setup", "workflow integration", "prompt engineering", "first steps"],
  section: "introduction/getting-started"
})

export default function GettingStartedPage() {
  return (
    <ContentTemplate
      title="Getting Started with Cursor and Windsurf"
      description="Learn how to begin your journey with Cursor and Windsurf for AI-assisted development."
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
          id: "introduction",
          title: "Introduction to Cursor and Windsurf",
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
          title: "Cursor Features and Techniques",
          href: "/tools/cursor",
          description: "Explore Cursor's powerful AI-assisted development capabilities."
        },
        {
          title: "Windsurf Integration Guide",
          href: "/tools/windsurf",
          description: "Learn how to leverage Windsurf for collaborative AI-assisted development."
        }
      ]}
    >
      <p>
        Starting your journey with Cursor and Windsurf can significantly enhance your 
        productivity and code quality. This guide provides practical steps to incorporate these 
        powerful AI tools into your development workflow, from setting up your environment to 
        establishing effective patterns for day-to-day coding.
      </p>

      <h2 id="introduction">Introduction to Cursor and Windsurf</h2>
      <p>
        Before diving into the setup process, let's briefly understand what makes Cursor and Windsurf 
        unique in the AI-assisted development landscape:
      </p>

      <ul>
        <li>
          <strong>Cursor</strong> - An AI-native code editor built on VS Code that seamlessly 
          integrates powerful AI capabilities. Cursor offers code completion, generation, and 
          explanation with natural language interaction, all while understanding your codebase context.
        </li>
        <li>
          <strong>Windsurf</strong> - A specialized AI-assisted development tool that enhances 
          collaborative development with shared context, allowing teams to maintain consistent 
          understanding of code across multiple developers.
        </li>
      </ul>

      <p>
        Both tools implement the Model Context Protocol (MCP), which enables AI to understand your
        entire codebase context, resulting in more accurate suggestions and higher-quality code generation.
      </p>

      <Callout type="info" title="MCP Advantage">
        Cursor and Windsurf's implementation of the Model Context Protocol significantly improves 
        the quality of AI assistance by providing comprehensive context about your project,
        helping the AI understand your codebase's structure, dependencies, and conventions.
      </Callout>

      <h2 id="setting-up">Setting Up Your Development Environment</h2>
      <p>
        Getting started with Cursor and Windsurf is straightforward. Follow these steps to set up your environment:
      </p>

      <h3>Installing Cursor</h3>
      <ol>
        <li>Visit the <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">Cursor website</a> and download the appropriate version for your operating system</li>
        <li>Run the installer and follow the on-screen instructions</li>
        <li>Launch Cursor after installation</li>
        <li>Sign in with your account or create a new one</li>
        <li>Configure your AI provider settings under Preferences {'>'}  AI {'>'} Provider</li>
      </ol>

      <h3>Setting Up Windsurf</h3>
      <ol>
        <li>Visit the <a href="https://windsurf.io" target="_blank" rel="noopener noreferrer">Windsurf website</a> to sign up for access</li>
        <li>Follow the installation instructions provided for your platform</li>
        <li>Configure Windsurf to connect with your team's shared resources</li>
        <li>Verify your connection to ensure proper synchronization</li>
      </ol>

      <h3>Configuring Your Environment</h3>
      <p>
        To optimize your experience with Cursor and Windsurf, consider these configuration recommendations:
      </p>

      <CodeBlock 
        language="json"
        filename=".vscode/settings.json"
        code={`{
  // Cursor settings for AI-assisted development
  "editor.inlineSuggest.enabled": true,
  "editor.inlineSuggest.showToolbar": "always",
  
  // Enable MCP features for better context awareness
  "cursor.mcp.enabled": true,
  "cursor.mcp.contextSync": true,
  
  // Configure formatting settings for consistency
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}`}
      />

      <h2 id="first-steps">First Steps with AI Assistance</h2>
      <p>
        Start with these basic interactions to become familiar with AI-assisted development using Cursor and Windsurf:
      </p>

      <h3 id="code-completion">Using Code Completion</h3>
      <p>
        Code completion is the most basic form of AI assistance, suggesting the next lines 
        as you type:
      </p>
      <ol>
        <li>In Cursor, start typing a function or method</li>
        <li>Observe inline suggestions appearing as ghost text</li>
        <li>Press Tab to accept suggestions or continue typing to refine them</li>
        <li>Use Escape to ignore suggestions</li>
      </ol>

      <h3 id="code-generation">Generating Code with Natural Language</h3>
      <p>
        One of Cursor's most powerful features is generating code based on natural language descriptions:
      </p>
      <ol>
        <li>
          Add a comment describing what you want to implement<br />
          <code>{"// Create a function that validates email addresses using regex"}</code>
        </li>
        <li>Press Ctrl+K (Cmd+K on Mac) to open the chat interface</li>
        <li>Provide more details if needed, then press Enter</li>
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
        When encountering unfamiliar code, Cursor can provide detailed explanations:
      </p>
      <ol>
        <li>Select the code you want to understand</li>
        <li>Press Ctrl+K (Cmd+K on Mac) to open the chat interface</li>
        <li>Ask "Explain this code" or a more specific question</li>
        <li>Review the detailed explanation provided by the AI</li>
      </ol>

      <CodeBlock 
        language="text"
        filename="example-explanation.txt"
        code={`User: Explain this code:
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, []);

Cursor: This code uses React's useEffect hook to handle API calls with proper cleanup:

1. It creates a new AbortController, which is a browser API that allows you to cancel fetch requests.

2. It calls a function named fetchData, passing the controller's signal as a parameter. This signal can be passed to fetch() to make the request abortable.

3. It returns a cleanup function that will be called when the component unmounts or before the effect runs again. This function calls controller.abort(), which cancels any pending requests.

4. The empty dependency array [] means this effect will only run once when the component mounts.

This pattern prevents memory leaks and race conditions by ensuring that if the component unmounts before the API call completes, the request will be cancelled.`}
      />

      <h2 id="effective-prompts">Writing Effective Prompts</h2>
      <p>
        The quality of AI assistance largely depends on your prompts. Here are best practices for writing effective prompts in Cursor and Windsurf:
      </p>

      <ul>
        <li>
          <strong>Be Specific</strong> - Clearly state what you want, including programming language, libraries, and specific functionality
        </li>
        <li>
          <strong>Provide Context</strong> - Reference relevant parts of your codebase that the AI should consider
        </li>
        <li>
          <strong>Ask for Iterations</strong> - Start simple and iteratively refine the code through follow-up prompts
        </li>
        <li>
          <strong>Specify Constraints</strong> - Mention performance requirements, coding standards, or error handling expectations
        </li>
        <li>
          <strong>Use Technical Terminology</strong> - Being precise with technical terms helps the AI understand your requirements better
        </li>
      </ul>

      <CodeBlock 
        language="text"
        filename="effective-prompt-example.txt"
        code={`// Less effective prompt:
"Create a React component for a form"

// More effective prompt:
"Create a React functional component that implements a user registration form with the following:
- Fields for name, email, password, and password confirmation
- Form validation using React Hook Form
- Show appropriate error messages
- Submit handler that logs the form data
- Responsive styling using Tailwind CSS
- Follow our project's existing component patterns (see UserProfile.tsx for reference)"`}
      />

      <h2 id="integration-workflow">Integrating AI into Your Workflow</h2>
      <p>
        To maximize the benefits of Cursor and Windsurf, consider integrating them at different stages of your development process:
      </p>

      <ol>
        <li>
          <strong>Planning Phase</strong>
          <ul>
            <li>Use Cursor to brainstorm architectural approaches</li>
            <li>Generate pseudocode or scaffold structures</li>
            <li>Create test plans based on requirements</li>
          </ul>
        </li>
        <li>
          <strong>Implementation Phase</strong>
          <ul>
            <li>Generate boilerplate and routine code</li>
            <li>Use AI for complex algorithms or patterns</li>
            <li>Leverage Cursor's chat for implementation alternatives</li>
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
        Always review AI-generated code carefully before integration. While Cursor and Windsurf are powerful,
        they may occasionally produce code that compiles but contains logical errors, security
        vulnerabilities, or inefficient patterns. Your expertise remains essential in evaluating
        and refining the generated solutions.
      </Callout>

      <h2 id="first-example-project">First Example Project</h2>
      <p>
        Let's walk through a complete example of creating a simple project with Cursor and Windsurf to demonstrate 
        how these tools work together in practice. We'll build a basic weather dashboard that fetches 
        and displays weather data.
      </p>

      <h3>1. Project Planning with Cursor</h3>
      <CodeBlock 
        language="text"
        code={`User: Help me plan a simple weather dashboard web app using React.

Cursor: I'll help you plan a React weather dashboard. Here's a simple structure:

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

      <h3>2. Project Setup with Cursor</h3>
      <CodeBlock 
        language="text"
        code={`User: Help me set up the initial project structure with Vite and React.

Cursor: I'll help you set up a new React project with Vite. First, run these commands in your terminal:

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

I can help you create any of these files. Would you like me to implement the SearchBar component first?`}
      />

      <h3>3. Implementing Components with Cursor</h3>
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
        Using Cursor's AI assistance, you can generate the rest of the components in a similar way. For example, 
        you might ask Cursor to generate the CurrentWeather component that displays the current conditions.
      </p>

      <h3>4. Creating the API Service with Windsurf</h3>
      <p>
        When working with teammates, you can use Windsurf to collaboratively develop the API service:
      </p>
      
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

      <h3>5. Creating a Custom Hook with Cursor</h3>
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

      <h3>6. Integrating in App.jsx with Cursor</h3>
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

      <h3>7. Debugging with Cursor</h3>
      <CodeBlock 
        language="text"
        code={`User: I'm getting an error "TypeError: Cannot read properties of null (reading 'main')" in my CurrentWeather component.

Cursor: This error occurs when you're trying to access a property on a null or undefined value. Specifically, you're likely trying to access currentWeather.main when currentWeather is null.

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

      <h3>8. Enhancing and Refining with Cursor and Windsurf</h3>
      <p>
        Once your basic application works, you can use Cursor and Windsurf to help enhance and refine it:
      </p>
      <ul>
        <li>Ask Cursor for styling improvements using CSS or styled-components</li>
        <li>Generate unit tests for your components</li>
        <li>Use Windsurf to collaborate with teammates on adding new features</li>
        <li>Optimize performance by requesting code improvements from Cursor</li>
        <li>Implement error boundary components with AI assistance</li>
      </ul>

      <Callout type="success" title="Learning Through Building">
        This simple project demonstrates many aspects of AI-assisted development with Cursor and Windsurf: 
        planning, code generation, component creation, API integration, and debugging. By working through 
        a complete example like this, you'll develop an intuition for when and how to effectively leverage 
        these powerful tools throughout the software development lifecycle.
      </Callout>

      <h2 id="next-steps">Next Steps in Your AI Development Journey</h2>
      <p>
        After getting comfortable with the basics of Cursor and Windsurf, consider these next steps to further enhance your AI-assisted development skills:
      </p>

      <ul>
        <li>
          <strong>Explore Advanced Features</strong> - Dive deeper into Cursor's advanced features like code refactoring, test generation, and debugging assistance
        </li>
        <li>
          <strong>Learn MCP Integration</strong> - Understand how the Model Context Protocol enhances AI capabilities in Cursor and Windsurf
        </li>
        <li>
          <strong>Develop AI Collaboration Patterns</strong> - Establish effective team patterns for collaborating with AI tools
        </li>
        <li>
          <strong>Create Custom Workflows</strong> - Develop personalized workflows that combine AI assistance with your development process
        </li>
        <li>
          <strong>Share Knowledge with Team</strong> - Help teammates adopt effective AI-assisted practices using Cursor and Windsurf
        </li>
      </ul>

      <p>
        Remember that AI-assisted development is a skill that improves with practice. The more you use 
        Cursor and Windsurf, the better you'll become at crafting effective prompts, integrating 
        AI suggestions, and leveraging these tools to enhance your development workflow.
      </p>
    </ContentTemplate>
  )
}