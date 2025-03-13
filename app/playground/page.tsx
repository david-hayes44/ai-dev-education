"use client"

import Link from "next/link"
import { useState } from "react"
import { Play,Copy, Share, RefreshCw, Code,Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Template card component with proper TypeScript types
interface TemplateCardProps {
  title: string;
  description: string;
  language: string;
  level: string;
}

function TemplateCard({ title, description, language, level }: TemplateCardProps) {
  return (
    <div className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Code className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
              {language}
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
              {level}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Load
          </Button>
        </div>
      </div>
    </div>
  );
}

// Client component for the code playground
function CodePlayground() {
  const [code, setCode] = useState(`// Welcome to the MCP Code Playground
// Try editing this code and click Run to see the results

function createMCPResponse(input) {
  return {
    response: "This is a sample MCP response",
    context: {
      input: input,
      timestamp: new Date().toISOString()
    }
  };
}

// Test the function
const result = createMCPResponse("Hello, MCP!");
console.log(JSON.stringify(result, null, 2));
`);
  
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [autoRun, setAutoRun] = useState(false);
  
  const handleRunCode = () => {
    try {
      // In a real implementation, this would use a sandboxed environment
      // For demo purposes, we're just showing a simulated output
      setOutput(`// Output:
{
  "response": "This is a sample MCP response",
  "context": {
    "input": "Hello, MCP!",
    "timestamp": "${new Date().toISOString()}"
  }
}
      
// Execution completed successfully in 0.05s`);
    } catch (error) {
      setOutput(`// Error:
${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="rounded-lg border shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="vs-light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-run"
              checked={autoRun}
              onCheckedChange={setAutoRun}
            />
            <Label htmlFor="auto-run">Auto-run</Label>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => setCode("")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
          
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button onClick={handleRunCode}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      
      {/* Editor and Output */}
      <div className="grid md:grid-cols-2">
        {/* Code Editor */}
        <div className="border-r min-h-[500px] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Editor</h3>
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {/* In a real implementation, this would be a Monaco Editor or CodeMirror */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[450px] font-mono text-sm bg-muted p-4 rounded-md"
            spellCheck="false"
          />
        </div>
        
        {/* Output */}
        <div className="min-h-[500px] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Output</h3>
            <Button variant="ghost" size="sm" onClick={() => setOutput("")}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <pre className="w-full h-[450px] font-mono text-sm bg-muted p-4 rounded-md overflow-auto">
            {output || "// Run your code to see the output here"}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Main page component that uses the client components
export default function CodePlaygroundPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Code Playground</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Interactive Code Playground
        </h1>
        <p className="text-xl text-muted-foreground">
          Experiment with MCP implementations and AI-assisted development
        </p>
      </div>
      
      {/* Main playground */}
      <div className="mb-8">
        <CodePlayground />
      </div>
      
      {/* Example templates */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Example Templates</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <TemplateCard 
            title="Basic MCP Server"
            description="A simple MCP server implementation with Node.js"
            language="JavaScript"
            level="Beginner"
          />
          <TemplateCard 
            title="Context Management"
            description="Advanced context handling for large context windows"
            language="TypeScript"
            level="Intermediate"
          />
          <TemplateCard 
            title="Full-Stack MCP App"
            description="Complete application with frontend and backend"
            language="TypeScript"
            level="Advanced"
          />
        </div>
      </div>
    </div>
  )
} 