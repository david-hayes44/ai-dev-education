"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { navigateTo, clickElement, typeText, extractText, takeScreenshot, evaluateCode } from "@/lib/puppeteer-mcp"

export default function BrowserAutomationPage() {
  const [url, setUrl] = useState("https://example.com")
  const [selector, setSelector] = useState("")
  const [text, setText] = useState("")
  const [jsCode, setJsCode] = useState("return document.title;")
  const [result, setResult] = useState<{ success: boolean; data?: unknown; error?: string }>()
  const [isLoading, setIsLoading] = useState(false)

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
      const response = await typeText(selector, text)
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

  const handleEvaluate = async () => {
    setIsLoading(true)
    try {
      const response = await evaluateCode(jsCode)
      setResult(response)
    } catch (error) {
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
          Demonstrate browser automation capabilities using the Puppeteer MCP server.
        </p>

        <div className="grid gap-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Control Panel</h2>
            <Tabs defaultValue="navigate" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="navigate">Navigate</TabsTrigger>
                <TabsTrigger value="interact">Interact</TabsTrigger>
                <TabsTrigger value="extract">Extract</TabsTrigger>
                <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
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
                <Button onClick={handleNavigate} disabled={isLoading}>
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
                  <Label htmlFor="text">Text to Type</Label>
                  <Input
                    id="text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Hello, world!"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleClick} disabled={isLoading} variant="outline">
                    Click Element
                  </Button>
                  <Button onClick={handleType} disabled={isLoading}>
                    Type Text
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
                  <Button onClick={handleExtractText} disabled={isLoading}>
                    Extract Text
                  </Button>
                  <Button onClick={handleScreenshot} disabled={isLoading} variant="outline">
                    Take Screenshot
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="evaluate" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="js-code">JavaScript Code</Label>
                  <textarea
                    id="js-code"
                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    placeholder="return document.title;"
                  />
                </div>
                
                <Button onClick={handleEvaluate} disabled={isLoading}>
                  Evaluate Code
                </Button>
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