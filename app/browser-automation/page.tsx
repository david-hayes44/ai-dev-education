"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  navigateTo, 
  clickElement, 
  typeText, 
  extractText, 
  takeScreenshot,
  initBrowser,
  getStatus
} from "@/lib/puppeteer-mcp"

interface BrowserResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export default function BrowserAutomationPage() {
  const [url, setUrl] = useState("https://new-ai-dev-education.vercel.app/")
  const [selector, setSelector] = useState("")
  const [value, setValue] = useState("")
  const [jsCode, setJsCode] = useState("return document.title;")
  const [result, setResult] = useState<BrowserResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<{status?: string; browser?: string; activePage?: string}>({})
  const [domStructure, setDomStructure] = useState<string>("")
  const [cssStyles, setCssStyles] = useState<string>("")

  // Check server status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getStatus();
        if (response.success && response.data) {
          setServerStatus(response.data as {status: string; browser: string; activePage: string});
        }
      } catch (error) {
        console.error("Failed to get server status:", error);
      }
    };
    
    checkStatus();
    // Check every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleInitBrowser = async () => {
    setIsLoading(true);
    try {
      const response = await initBrowser();
      setResult(response);
      // Update status after initialization
      const statusResponse = await getStatus();
      if (statusResponse.success && statusResponse.data) {
        setServerStatus(statusResponse.data as {status: string; browser: string; activePage: string});
      }
    } catch (error) {
      setResult({ success: false, error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async () => {
    setIsLoading(true)
    try {
      const response = await navigateTo(url)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await clickElement(selector)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleType = async () => {
    setIsLoading(true)
    try {
      const response = await typeText(selector, value)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtractText = async () => {
    setIsLoading(true)
    try {
      const response = await extractText(selector)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScreenshot = async () => {
    setIsLoading(true)
    try {
      const response = await takeScreenshot()
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteJs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PUPPETEER_API_URL || 'http://localhost:5004'}/browser/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: jsCode }),
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetDomStructure = async () => {
    setIsLoading(true)
    try {
      const jsQuery = `
        function getNodePath(node, maxDepth = 2, currentDepth = 0) {
          if (!node || currentDepth > maxDepth) return '';
          
          const children = Array.from(node.children)
            .map(child => getNodePath(child, maxDepth, currentDepth + 1))
            .filter(path => path)
            .join('\\n');
          
          const classes = node.className ? \`.\${node.className.replace(/ /g, '.')}\` : '';
          const id = node.id ? \`#\${node.id}\` : '';
          const indent = '  '.repeat(currentDepth);
          
          return \`\${indent}<\${node.tagName.toLowerCase()}\${id}\${classes}>\${children ? \`\\n\${children}\` : ''}\`;
        }
        
        return getNodePath(document.body, 3);
      `;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_PUPPETEER_API_URL || 'http://localhost:5004'}/browser/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: jsQuery }),
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success && data.data) {
        setDomStructure(String(data.data))
      }
    } catch (error) {
      console.error("Error fetching DOM structure:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStyles = async () => {
    setIsLoading(true)
    try {
      if (!selector) {
        setResult({ success: false, error: "Selector is required" })
        setIsLoading(false)
        return
      }
      
      const jsQuery = `
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
        if (!element) return 'Element not found';
        
        const styles = window.getComputedStyle(element);
        const result = {};
        
        ['color', 'background-color', 'font-size', 'padding', 'margin', 'width', 'height', 
         'display', 'position', 'font-family', 'font-weight', 'border', 'border-radius']
          .forEach(prop => {
            result[prop] = styles.getPropertyValue(prop);
          });
          
        return JSON.stringify(result, null, 2);
      `;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_PUPPETEER_API_URL || 'http://localhost:5004'}/browser/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: jsQuery }),
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success && data.data) {
        setCssStyles(String(data.data))
        setResult(data)
      }
    } catch (error) {
      console.error("Error fetching styles:", error)
      setResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-6">Browser Automation</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Demonstrate browser automation capabilities using the Puppeteer server.
        </p>

        {/* Server Status */}
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-4">Server Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Server</h3>
              <div className={`flex items-center gap-2 ${serverStatus.status === "ok" ? "text-green-500" : "text-red-500"}`}>
                <div className={`h-3 w-3 rounded-full ${serverStatus.status === "ok" ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>{serverStatus.status === "ok" ? "Online" : "Offline"}</span>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Browser</h3>
              <div className={`flex items-center gap-2 ${serverStatus.browser === "running" ? "text-green-500" : "text-red-500"}`}>
                <div className={`h-3 w-3 rounded-full ${serverStatus.browser === "running" ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>{serverStatus.browser === "running" ? "Running" : "Not Started"}</span>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Page</h3>
              <div className={`flex items-center gap-2 ${serverStatus.activePage === "ready" ? "text-green-500" : "text-red-500"}`}>
                <div className={`h-3 w-3 rounded-full ${serverStatus.activePage === "ready" ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>{serverStatus.activePage === "ready" ? "Ready" : "Not Available"}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleInitBrowser} disabled={isLoading || serverStatus.browser === "running"}>
              {isLoading ? "Initializing..." : "Initialize Browser"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Control Panel</h2>
            <Tabs defaultValue="navigate" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="navigate">Navigate</TabsTrigger>
                <TabsTrigger value="interact">Interact</TabsTrigger>
                <TabsTrigger value="extract">Extract</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
              </TabsList>
              
              <TabsContent value="navigate" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <Button onClick={handleNavigate} disabled={isLoading || serverStatus.browser !== "running"}>
                  {isLoading ? "Loading..." : "Navigate"}
                </Button>
              </TabsContent>
              
              <TabsContent value="interact" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="selector">Element Selector</Label>
                  <Input
                    id="selector"
                    type="text"
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    placeholder="#submit-button"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Hello, world!"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleClick} disabled={isLoading || serverStatus.browser !== "running"} variant="outline">
                    Click Element
                  </Button>
                  <Button onClick={handleType} disabled={isLoading || serverStatus.browser !== "running"}>
                    Fill Text
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="extract" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="extract-selector">Element Selector</Label>
                  <Input
                    id="extract-selector"
                    type="text"
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    placeholder=".content"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleExtractText} disabled={isLoading || serverStatus.browser !== "running"}>
                    Extract Text
                  </Button>
                  <Button onClick={handleScreenshot} disabled={isLoading || serverStatus.browser !== "running"} variant="outline">
                    Take Screenshot
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="debug" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="js-code">JavaScript Code</Label>
                    <Textarea
                      id="js-code"
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      placeholder="return document.title;"
                      className="h-32 font-mono text-sm mt-2"
                    />
                    <Button 
                      onClick={handleExecuteJs} 
                      disabled={isLoading || serverStatus.browser !== "running"}
                      className="mt-2"
                    >
                      Execute JavaScript
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleGetDomStructure} 
                      disabled={isLoading || serverStatus.browser !== "running"}
                      variant="outline"
                    >
                      Get DOM Structure
                    </Button>
                    <Button 
                      onClick={handleGetStyles} 
                      disabled={isLoading || serverStatus.browser !== "running" || !selector}
                      variant="outline"
                    >
                      Get Styles for Selected Element
                    </Button>
                  </div>
                  
                  {domStructure && (
                    <div className="mt-2">
                      <Label>DOM Structure (Simplified)</Label>
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs mt-2">
                        {domStructure}
                      </pre>
                    </div>
                  )}
                  
                  {cssStyles && (
                    <div className="mt-2">
                      <Label>CSS Styles for {selector}</Label>
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs mt-2">
                        {cssStyles}
                      </pre>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{result.success ? 'Success' : 'Error'}</span>
                </div>
                <Separator />
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
                
                {/* Display screenshot if available */}
                {result.success && 
                 result.data && 
                 typeof result.data === 'string' && 
                 result.data.startsWith('iVBOR') && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Screenshot:</h3>
                    <img 
                      src={`data:image/png;base64,${result.data}`} 
                      alt="Screenshot" 
                      className="border rounded-md" 
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No results yet. Use the control panel to interact with the browser.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 