import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Refactoring with AI Workshop",
  description: "Learn how to leverage AI tools to safely and efficiently refactor your codebase, improving code quality while minimizing risks.",
  keywords: ["AI refactoring", "code refactoring", "technical debt", "code quality", "automated refactoring", "safe refactoring"],
  section: "workshops/refactoring-with-ai"
})

export default function RefactoringWithAIWorkshop() {
  return (
    <ContentTemplate
      title="Refactoring with AI Workshop"
      description="Learn how to leverage AI tools to safely and efficiently refactor your codebase, improving code quality while minimizing risks."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "30 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction/concepts"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "introduction",
          title: "Introduction",
          level: 2
        },
        {
          id: "why-ai-refactoring",
          title: "Why Use AI for Refactoring",
          level: 2
        },
        {
          id: "preparation",
          title: "Preparing for AI-Assisted Refactoring",
          level: 2,
          children: [
            {
              id: "test-coverage",
              title: "Ensuring Adequate Test Coverage",
              level: 3
            },
            {
              id: "context-preparation",
              title: "Preparing Context for AI",
              level: 3
            }
          ]
        },
        {
          id: "refactoring-techniques",
          title: "Refactoring Techniques with AI",
          level: 2,
          children: [
            {
              id: "code-smells",
              title: "Identifying Code Smells",
              level: 3
            },
            {
              id: "structural-refactoring",
              title: "Structural Refactoring",
              level: 3
            },
            {
              id: "performance-refactoring",
              title: "Performance Optimization",
              level: 3
            }
          ]
        },
        {
          id: "safety-measures",
          title: "Safety Measures",
          level: 2
        },
        {
          id: "practical-example",
          title: "Practical Example: Refactoring a Legacy Component",
          level: 2
        },
        {
          id: "advanced-topics",
          title: "Advanced Topics",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Advanced Refactoring Techniques",
          href: "/workshops/refactoring-with-ai/advanced-techniques",
          description: "Explore more advanced techniques for AI-assisted refactoring."
        },
        {
          title: "AI-Assisted Testing Workshop",
          href: "/workshops/ai-assisted-testing",
          description: "Learn how to use AI to improve your testing process."
        },
        {
          title: "Code Review Best Practices",
          href: "/best-practices/code-review",
          description: "Best practices for reviewing code, including AI-generated code."
        }
      ]}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        Refactoring is the process of restructuring existing code without changing its external behavior. It's essential for maintaining code quality, reducing technical debt, and enabling future development. However, manual refactoring is often time-consuming, error-prone, and sometimes risky.
      </p>
      <p>
        This workshop explores how AI can transform the refactoring process, making it more efficient, thorough, and safe. You'll learn how to leverage AI tools to identify refactoring opportunities, automate common refactoring patterns, and validate the results—all while maintaining the integrity of your codebase.
      </p>

      <h2 id="why-ai-refactoring">Why Use AI for Refactoring</h2>
      <p>
        AI brings several unique advantages to the refactoring process:
      </p>
      <ul>
        <li><strong>Pattern Recognition:</strong> AI can identify subtle patterns and anti-patterns that might escape human attention, especially in large codebases.</li>
        <li><strong>Consistency:</strong> AI applies refactoring rules consistently across the entire codebase, avoiding the inconsistencies that can arise during manual refactoring.</li>
        <li><strong>Speed:</strong> AI can perform complex refactoring operations in seconds or minutes, rather than hours or days.</li>
        <li><strong>Knowledge:</strong> AI tools have been trained on millions of code examples and best practices, bringing a breadth of knowledge to the refactoring process.</li>
        <li><strong>Reduced Cognitive Load:</strong> By handling the mechanical aspects of refactoring, AI lets developers focus on architectural decisions and business logic.</li>
      </ul>

      <Callout type="info" title="When to Use AI for Refactoring">
        AI-assisted refactoring is particularly valuable for:
        <ul>
          <li>Large-scale refactoring operations across multiple files</li>
          <li>Modernizing legacy code with outdated patterns</li>
          <li>Standardizing code style and patterns across a codebase</li>
          <li>Complex performance optimizations</li>
          <li>Refactoring unfamiliar code where you don't know all the details</li>
        </ul>
      </Callout>

      <h2 id="preparation">Preparing for AI-Assisted Refactoring</h2>
      <p>
        Before diving into refactoring with AI, it's essential to prepare your codebase and tools properly. This preparation helps ensure the AI has the context it needs and that you have safety nets in place.
      </p>

      <h3 id="test-coverage">Ensuring Adequate Test Coverage</h3>
      <p>
        Tests are your first line of defense when refactoring. They help ensure that your refactoring doesn't change the behavior of your code.
      </p>
      <ul>
        <li><strong>Audit Your Test Coverage:</strong> Identify areas with inadequate test coverage before refactoring.</li>
        <li><strong>Add Missing Tests:</strong> Use AI to help generate tests for untested functionality.</li>
        <li><strong>Focus on Behavior:</strong> Ensure tests verify behavior, not implementation details, so they remain valid after refactoring.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="test-coverage-example.ts"
        code={`// Before refactoring, ask AI to help you write tests for untested code
// Example: untested utility function
function formatCurrency(amount: number, currency: string): string {
  if (amount < 0) {
    return '-' + currency + Math.abs(amount).toFixed(2);
  }
  return currency + amount.toFixed(2);
}

// AI-generated tests to ensure behavior is preserved during refactoring
describe('formatCurrency', () => {
  test('formats positive amounts correctly', () => {
    expect(formatCurrency(10.5, '$')).toBe('$10.50');
    expect(formatCurrency(0, '€')).toBe('€0.00');
    expect(formatCurrency(1234.56, '¥')).toBe('¥1234.56');
  });
  
  test('formats negative amounts correctly', () => {
    expect(formatCurrency(-10.5, '$')).toBe('-$10.50');
    expect(formatCurrency(-0.01, '€')).toBe('-€0.01');
  });
  
  test('handles zero decimal places correctly', () => {
    expect(formatCurrency(10, '$')).toBe('$10.00');
  });
});`}
      />

      <h3 id="context-preparation">Preparing Context for AI</h3>
      <p>
        For AI to provide effective refactoring suggestions, it needs to understand your codebase and conventions.
      </p>
      <ul>
        <li><strong>Provide Project Context:</strong> Share information about the project structure, coding conventions, and architectural constraints.</li>
        <li><strong>Use MCP:</strong> If available, use the Model Context Protocol (MCP) to provide standardized context to AI tools.</li>
        <li><strong>Share Dependencies:</strong> Make sure the AI knows about dependencies and constraints that might affect refactoring options.</li>
      </ul>

      <CodeBlock 
        language="markdown"
        filename="refactoring-context.md"
        code={`# Project Context for Refactoring

## Project Architecture
- React frontend using hooks and function components
- Express.js backend with MongoDB
- TypeScript throughout the codebase

## Coding Conventions
- ESLint with Airbnb config
- 2-space indentation
- Function components preferred over class components
- Custom hooks for shared logic
- Async/await preferred over Promise chains

## Current Issues
- Component X has grown too large and needs to be split
- Redux actions/reducers need to be converted to Redux Toolkit
- Legacy class components need conversion to function components
- Some components still use older React patterns (e.g., componentDidMount)

## Dependencies and Constraints
- Must maintain backward compatibility with API v1
- Must support IE11
- Cannot increase bundle size significantly`}
      />

      <h2 id="refactoring-techniques">Refactoring Techniques with AI</h2>
      <p>
        Now that you've prepared your codebase, let's explore specific refactoring techniques you can perform with AI assistance.
      </p>

      <h3 id="code-smells">Identifying Code Smells</h3>
      <p>
        AI can help identify code smells—indicators of potential problems in your code that might require refactoring.
      </p>
      <ul>
        <li><strong>Analyze a Component:</strong> Ask AI to analyze and identify code smells in a component or module.</li>
        <li><strong>Prioritize Issues:</strong> Have AI help you prioritize which code smells to address first based on impact and complexity.</li>
        <li><strong>Generate Refactoring Plan:</strong> Use AI to create a step-by-step refactoring plan for addressing identified issues.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="component-with-code-smells.tsx"
        code={`// Component with several code smells
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function UserDashboard() {
  // Code smell: Too many state variables
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Code smell: Duplicate fetch logic, complex useEffect
  useEffect(() => {
    setLoading(true);
    axios.get('/api/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  // Code smell: Filtering logic should be extracted
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  );
  
  // Code smell: Sorting logic should be extracted
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'email') {
      return a.email.localeCompare(b.email);
    } else if (sortBy === 'lastLogin') {
      return new Date(b.lastLogin) - new Date(a.lastLogin);
    }
    return 0;
  });
  
  // Code smell: Pagination logic should be extracted
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  
  // Code smell: Event handlers defined inside render
  // Code smell: JSX is too complex
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      
      <div className="controls">
        <input 
          type="text" 
          placeholder="Filter users..." 
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="lastLogin">Sort by Last Login</option>
        </select>
      </div>
      
      {loading && <div className="loading">Loading users...</div>}
      {error && <div className="error">{error}</div>}
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
              <td>
                <button onClick={() => {
                  // Code smell: Complex inline function
                  console.log('Edit user', user.id);
                  // More complex logic would go here
                }}>Edit</button>
                <button onClick={() => {
                  // Code smell: Complex inline function, duplicate logic
                  console.log('Delete user', user.id);
                  // More complex logic would go here
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}`}
      />

      <Callout type="tip" title="AI Analysis Prompt">
        When asking AI to analyze your code, try a prompt like:
        <p>"Analyze this component for code smells and refactoring opportunities. Focus on separation of concerns, component size, and React best practices. Suggest specific refactoring steps in order of priority."</p>
      </Callout>

      <h3 id="structural-refactoring">Structural Refactoring</h3>
      <p>
        Structural refactoring involves reorganizing code to improve its structure without changing its behavior. AI can help with common structural refactoring tasks.
      </p>
      <ul>
        <li><strong>Extract Components:</strong> Break down large components into smaller, more focused ones.</li>
        <li><strong>Extract Hooks:</strong> Move reusable logic into custom hooks.</li>
        <li><strong>Convert Class to Function Components:</strong> Modernize class components to function components with hooks.</li>
        <li><strong>Improve File Organization:</strong> Reorganize files and folders for better modularity and discoverability.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="refactored-user-dashboard.tsx"
        code={`// After AI-assisted refactoring: User Dashboard with extracted components and hooks
import React from 'react';
import { UserTable } from './UserTable';
import { SearchControls } from './SearchControls';
import { Pagination } from './Pagination';
import { LoadingState } from './LoadingState';
import { useUsers } from '../hooks/useUsers';
import { useUserFiltering } from '../hooks/useUserFiltering';
import { usePagination } from '../hooks/usePagination';

export function UserDashboard() {
  // Custom hook for fetching users
  const { users, loading, error } = useUsers();
  
  // Custom hook for filtering and sorting
  const { 
    filter, setFilter,
    sortBy, setSortBy,
    filteredUsers, sortedUsers
  } = useUserFiltering(users);
  
  // Custom hook for pagination
  const {
    currentPage, setCurrentPage,
    itemsPerPage,
    paginatedItems: paginatedUsers,
    totalPages
  } = usePagination(sortedUsers, 10);
  
  // User action handlers
  const handleEditUser = (userId: string) => {
    console.log('Edit user', userId);
    // Implementation would go here
  };
  
  const handleDeleteUser = (userId: string) => {
    console.log('Delete user', userId);
    // Implementation would go here
  };
  
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      
      <SearchControls
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      <LoadingState loading={loading} error={error} />
      
      <UserTable
        users={paginatedUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}`}
      />

      <h3 id="performance-refactoring">Performance Optimization</h3>
      <p>
        AI can help identify and fix performance issues in your code.
      </p>
      <ul>
        <li><strong>Memoization:</strong> Add React.memo, useMemo, and useCallback where appropriate.</li>
        <li><strong>Optimize Renders:</strong> Identify and fix unnecessary re-renders.</li>
        <li><strong>Optimize Algorithms:</strong> Improve time and space complexity of your algorithms.</li>
        <li><strong>Code Splitting:</strong> Implement code splitting for better loading performance.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="performance-optimization.tsx"
        code={`// Example: AI-assisted performance optimization
import React, { useState, useMemo, useCallback } from 'react';

// Before optimization
function ExpensiveList({ items, onItemClick }) {
  // This sorts the array on every render
  const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// After AI-assisted optimization
function OptimizedList({ items, onItemClick }) {
  // Memoize the sorted array to prevent unnecessary re-sorting
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  // Memoize click handler to prevent unnecessary re-renders
  const handleItemClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <ul>
      {sortedItems.map(item => (
        <ListItem 
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </ul>
  );
}

// Extract to a memoized component to prevent unnecessary re-renders
const ListItem = React.memo(({ item, onClick }) => (
  <li onClick={() => onClick(item.id)}>
    {item.name}
  </li>
));`}
      />

      <h2 id="safety-measures">Safety Measures</h2>
      <p>
        While AI can greatly assist with refactoring, it's important to maintain safety measures to prevent regressions.
      </p>

      <ul>
        <li><strong>Commit Often:</strong> Make small, focused refactoring commits with clear messages.</li>
        <li><strong>Run Tests Frequently:</strong> Run your test suite after each significant refactoring step.</li>
        <li><strong>Manual Verification:</strong> Perform manual testing of key workflows after refactoring.</li>
        <li><strong>Code Review:</strong> Have another developer review the refactored code, even if generated by AI.</li>
        <li><strong>Feature Flags:</strong> Use feature flags to gradually roll out large refactorings in production.</li>
      </ul>

      <Callout type="warning" title="AI Limitations">
        Remember that AI has limitations:
        <ul>
          <li>It may not understand all the historical reasons behind certain code patterns</li>
          <li>It could misunderstand your architecture or constraints</li>
          <li>It might make incorrect assumptions about your dependencies</li>
          <li>It won't be aware of undocumented side effects</li>
        </ul>
        Always review and verify AI-suggested refactorings before committing them.
      </Callout>

      <h2 id="practical-example">Practical Example: Refactoring a Legacy Component</h2>
      <p>
        Let's walk through a complete example of refactoring a legacy React class component to a modern function component with hooks, guided by AI.
      </p>

      <h3>Original Legacy Component</h3>
      <CodeBlock 
        language="javascript"
        filename="LegacyUserProfile.jsx"
        code={`// A legacy React class component with various issues
import React, { Component } from 'react';
import axios from 'axios';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null,
      isEditing: false,
      formData: {
        name: '',
        email: '',
        bio: ''
      }
    };
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
  }
  
  componentDidMount() {
    this.fetchUserData();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUserData();
    }
  }
  
  fetchUserData() {
    this.setState({ loading: true });
    
    axios.get(\`/api/users/\${this.props.userId}\`)
      .then(response => {
        const user = response.data;
        this.setState({
          user,
          loading: false,
          formData: {
            name: user.name,
            email: user.email,
            bio: user.bio || ''
          }
        });
      })
      .catch(error => {
        this.setState({
          error: 'Failed to load user data',
          loading: false
        });
        console.error('Error fetching user:', error);
      });
  }
  
  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  }
  
  handleSubmit(event) {
    event.preventDefault();
    const { formData } = this.state;
    
    this.setState({ loading: true });
    
    axios.put(\`/api/users/\${this.props.userId}\`, formData)
      .then(response => {
        this.setState({
          user: response.data,
          loading: false,
          isEditing: false
        });
      })
      .catch(error => {
        this.setState({
          error: 'Failed to update user data',
          loading: false
        });
        console.error('Error updating user:', error);
      });
  }
  
  toggleEdit() {
    this.setState(prevState => ({
      isEditing: !prevState.isEditing
    }));
  }
  
  render() {
    const { user, loading, error, isEditing, formData } = this.state;
    
    if (loading && !user) {
      return <div className="loading">Loading user profile...</div>;
    }
    
    if (error) {
      return <div className="error">{error}</div>;
    }
    
    if (!user) {
      return <div className="error">User not found</div>;
    }
    
    return (
      <div className="user-profile">
        <h1>{user.name}'s Profile</h1>
        
        {isEditing ? (
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={this.handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={this.handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={this.toggleEdit}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <strong>Email:</strong> {user.email}
            </div>
            
            {user.bio && (
              <div className="info-group">
                <strong>Bio:</strong> {user.bio}
              </div>
            )}
            
            <div className="profile-actions">
              <button onClick={this.toggleEdit}>
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}`}
      />

      <h3>Refactored Modern Component</h3>
      <CodeBlock 
        language="typescript"
        filename="UserProfile.tsx"
        code={`// Refactored as a modern function component with hooks and TypeScript
import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfileForm } from './UserProfileForm';
import { UserProfileInfo } from './UserProfileInfo';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const {
    user,
    loading,
    error,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    toggleEdit
  } = useUserProfile(userId);
  
  if (loading && !user) {
    return <LoadingSpinner message="Loading user profile..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!user) {
    return <ErrorMessage message="User not found" />;
  }
  
  return (
    <div className="user-profile">
      <h1>{user.name}'s Profile</h1>
      
      {isEditing ? (
        <UserProfileForm
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={toggleEdit}
        />
      ) : (
        <UserProfileInfo
          user={user}
          onEdit={toggleEdit}
        />
      )}
    </div>
  );
}`}
      />

      <h3>Extracted Custom Hook</h3>
      <CodeBlock 
        language="typescript"
        filename="useUserProfile.ts"
        code={`// Custom hook extracted during the refactoring process
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

interface FormData {
  name: string;
  email: string;
  bio: string;
}

export function useUserProfile(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: ''
  });
  
  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get<User>(\`/api/users/\${userId}\`);
      const userData = response.data;
      
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        bio: userData.bio || ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, [userId]);
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put<User>(\`/api/users/\${userId}\`, formData);
      setUser(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update user data');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(prev => !prev);
  };
  
  return {
    user,
    loading,
    error,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    toggleEdit
  };
}`}
      />

      <Callout type="info" title="Key Refactoring Steps">
        This refactoring example demonstrates several improvements:
        <ul>
          <li>Converted class component to function component</li>
          <li>Added TypeScript for better type safety</li>
          <li>Extracted logic into a custom hook for better separation of concerns</li>
          <li>Split UI into smaller, focused components</li>
          <li>Switched from Promise chains to async/await</li>
          <li>Improved error handling</li>
          <li>Enhanced accessibility with semantic HTML and better component structure</li>
        </ul>
      </Callout>

      <h2 id="advanced-topics">Advanced Topics</h2>
      <p>
        As you become more comfortable with AI-assisted refactoring, consider exploring these advanced topics:
      </p>
      <ul>
        <li><strong>Large-Scale Codebase Refactoring:</strong> Strategies for refactoring entire codebases or monolithic applications.</li>
        <li><strong>Architecture Refactoring:</strong> Using AI to assist with larger architectural changes.</li>
        <li><strong>Database Schema Refactoring:</strong> Applying refactoring principles to database schemas with AI guidance.</li>
        <li><strong>API Refactoring:</strong> Modernizing APIs while maintaining backward compatibility.</li>
        <li><strong>Refactoring Workflows:</strong> Creating efficient workflows that combine AI and human expertise.</li>
      </ul>
      <p>
        For more on these topics, check out our <a href="/workshops/refactoring-with-ai/advanced-techniques">Advanced Refactoring Techniques</a> page.
      </p>

      <Callout type="tip" title="Continuous Refactoring">
        <p>
          Rather than addressing technical debt in large, risky refactoring projects, consider adopting a practice of continuous refactoring. Use AI to help identify and refactor small segments of code regularly as part of your normal development workflow. This approach minimizes risk and keeps your codebase healthy over time.
        </p>
      </Callout>
    </ContentTemplate>
  )
} 