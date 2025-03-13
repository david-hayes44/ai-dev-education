"use client"

import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Download, Terminal, Settings, Shield, Key } from "lucide-react"

export default function CursorSetupPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12 max-w-6xl">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools" className="hover:text-foreground">Tools</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools/cursor" className="hover:text-foreground">Cursor</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Setup</span>
            </nav>

            <h1 className="text-4xl font-bold mb-4">Cursor Installation & Setup</h1>
            <p className="text-xl text-muted-foreground">
              A complete guide to installing, configuring, and setting up Cursor for AI-assisted development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="prose dark:prose-invert max-w-none">
                <h2>Getting Started with Cursor</h2>
                <p>
                  Cursor is a powerful code editor built on top of VSCode that integrates AI capabilities directly into your development workflow.
                  This guide will walk you through installation, initial configuration, and essential settings to get you started quickly.
                </p>

                <h3>System Requirements</h3>
                <ul>
                  <li><strong>Operating Systems:</strong> Windows 10+, macOS 10.15+, Ubuntu 20.04+ or other Linux distributions</li>
                  <li><strong>RAM:</strong> 8GB minimum, 16GB recommended</li>
                  <li><strong>Disk Space:</strong> 1GB for installation</li>
                  <li><strong>Internet Connection:</strong> Required for AI features</li>
                </ul>
              </div>

              <Tabs defaultValue="windows" className="mt-10">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="windows">Windows</TabsTrigger>
                  <TabsTrigger value="macos">macOS</TabsTrigger>
                  <TabsTrigger value="linux">Linux</TabsTrigger>
                </TabsList>
                
                <TabsContent value="windows" className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>Windows Installation</h3>
                    <ol>
                      <li>Navigate to <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">cursor.sh</a> and click "Download"</li>
                      <li>Run the downloaded <code>cursor-windows-installer.exe</code> file</li>
                      <li>Follow the installation wizard instructions</li>
                      <li>Launch Cursor from the Start menu or desktop shortcut</li>
                      <li>Sign in or create a Cursor account when prompted</li>
                    </ol>

                    <h4>Configuring API Keys</h4>
                    <p>
                      For full functionality, you'll need to configure an OpenAI API key in Cursor:
                    </p>
                    <ol>
                      <li>Navigate to Cursor Settings (<code>Ctrl+,</code>)</li>
                      <li>Select "AI" from the left sidebar</li>
                      <li>Enter your OpenAI API key in the field provided</li>
                      <li>Click "Save"</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="macos" className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>macOS Installation</h3>
                    <ol>
                      <li>Navigate to <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">cursor.sh</a> and click "Download"</li>
                      <li>Open the downloaded <code>Cursor.dmg</code> file</li>
                      <li>Drag the Cursor icon to the Applications folder</li>
                      <li>Launch Cursor from your Applications folder</li>
                      <li>If prompted about an unidentified developer, go to System Preferences → Security & Privacy and click "Open Anyway"</li>
                      <li>Sign in or create a Cursor account when prompted</li>
                    </ol>

                    <h4>Configuring API Keys</h4>
                    <p>
                      For full functionality, you'll need to configure an OpenAI API key in Cursor:
                    </p>
                    <ol>
                      <li>Navigate to Cursor Settings (<code>Cmd+,</code>)</li>
                      <li>Select "AI" from the left sidebar</li>
                      <li>Enter your OpenAI API key in the field provided</li>
                      <li>Click "Save"</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="linux" className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>Linux Installation</h3>
                    <ol>
                      <li>Navigate to <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">cursor.sh</a> and click "Download"</li>
                      <li>Download the appropriate package for your distribution (<code>.deb</code> or <code>.AppImage</code>)</li>
                      <li>For <code>.deb</code> package:
                        <ul>
                          <li>Open terminal and navigate to the download folder</li>
                          <li>Run <code>sudo dpkg -i cursor-*.deb</code></li>
                          <li>If dependencies are missing, run <code>sudo apt-get install -f</code></li>
                        </ul>
                      </li>
                      <li>For <code>.AppImage</code>:
                        <ul>
                          <li>Make it executable with <code>chmod +x cursor-*.AppImage</code></li>
                          <li>Run it with <code>./cursor-*.AppImage</code></li>
                        </ul>
                      </li>
                      <li>Sign in or create a Cursor account when prompted</li>
                    </ol>

                    <h4>Configuring API Keys</h4>
                    <p>
                      For full functionality, you'll need to configure an OpenAI API key in Cursor:
                    </p>
                    <ol>
                      <li>Navigate to Cursor Settings (<code>Ctrl+,</code>)</li>
                      <li>Select "AI" from the left sidebar</li>
                      <li>Enter your OpenAI API key in the field provided</li>
                      <li>Click "Save"</li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="prose dark:prose-invert max-w-none mt-12">
                <h2>Initial Configuration</h2>
                <p>
                  After installing Cursor, you'll want to configure it for optimal performance. Here are the essential settings to adjust:
                </p>

                <h3>1. Model Selection</h3>
                <p>
                  Cursor supports various AI models. For the best experience, we recommend:
                </p>
                <ul>
                  <li><strong>OpenAI GPT-4</strong> for complex tasks and high-quality code generation</li>
                  <li><strong>Claude 3 Sonnet</strong> for general use with a good balance of performance and speed</li>
                  <li><strong>Local models</strong> for privacy-conscious development (requires separate setup)</li>
                </ul>
                <p>To configure your model:</p>
                <ol>
                  <li>Open Cursor Settings (Ctrl/Cmd + ,)</li>
                  <li>Navigate to AI → Models</li>
                  <li>Select your preferred model from the dropdown</li>
                </ol>

                <h3>2. YOLO Mode</h3>
                <p>
                  YOLO mode allows Cursor to automatically run commands to verify code correctness beyond just lint checks.
                  This powerful feature can significantly speed up your workflow:
                </p>
                <ol>
                  <li>Open Cursor Settings (Ctrl/Cmd + ,)</li>
                  <li>Navigate to AI → Advanced</li>
                  <li>Enable "YOLO Mode"</li>
                  <li>Configure your preferred prompt (recommended example below)</li>
                </ol>

                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  <code>{`any kind of tests are always allowed like vitest, npm test, nr test, etc. also basic build commands like build, tsc, etc. creating files and making directories (like touch, mkdir, etc) is always ok too`}</code>
                </pre>
                
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg my-6">
                  <h4 className="text-amber-800 dark:text-amber-300 flex items-center text-base mt-0">
                    <Shield className="h-5 w-5 mr-2 text-amber-500" />
                    Security Note
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400 text-sm mt-1 mb-0">
                    When using YOLO mode, be cautious about which commands you allow. Avoid permitting potentially
                    destructive commands like <code>rm -rf</code> or commands that could expose sensitive information.
                    Always review the commands before they execute.
                  </p>
                </div>

                <h3>3. Extensions and Settings Sync</h3>
                <p>
                  Since Cursor is built on VSCode, you can synchronize your VSCode settings and extensions:
                </p>
                <ol>
                  <li>Open the Command Palette (Ctrl/Cmd + Shift + P)</li>
                  <li>Type "Settings Sync" and select "Settings Sync: Turn On"</li>
                  <li>Choose which settings you want to sync (extensions, preferences, keybindings, etc.)</li>
                  <li>Sign in with your preferred account (GitHub or Microsoft)</li>
                </ol>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Terminal className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Quick Start Commands</CardTitle>
                  <CardDescription>Essential keyboard shortcuts to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Open Command Palette</span>
                      <span className="text-muted-foreground">Ctrl/Cmd + Shift + P</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Access all Cursor commands</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">AI Inline Chat</span>
                      <span className="text-muted-foreground">Ctrl/Cmd + I</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Chat with AI about selected code</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Quick Edit</span>
                      <span className="text-muted-foreground">Ctrl/Cmd + K</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Make quick changes to selected code</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Terminal AI</span>
                      <span className="text-muted-foreground">Ctrl/Cmd + K in terminal</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Get AI help in the terminal</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Open Settings</span>
                      <span className="text-muted-foreground">Ctrl/Cmd + ,</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Configure Cursor preferences</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Key className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Setting up your API access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    To use Cursor's AI features, you'll need an API key from one of these providers:
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">1</span>
                      <div>
                        <span className="font-medium">OpenAI API Key</span>
                        <p className="text-xs text-muted-foreground mt-1">Required for GPT-4 and GPT-3.5 models</p>
                        <Link href="https://platform.openai.com/account/api-keys" target="_blank" className="text-xs text-primary hover:underline">
                          Get key from OpenAI →
                        </Link>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 p-1 rounded-full mr-2 mt-0.5">2</span>
                      <div>
                        <span className="font-medium">Anthropic API Key</span>
                        <p className="text-xs text-muted-foreground mt-1">Required for Claude models</p>
                        <Link href="https://console.anthropic.com/account/keys" target="_blank" className="text-xs text-primary hover:underline">
                          Get key from Anthropic →
                        </Link>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-0.5">3</span>
                      <div>
                        <span className="font-medium">Optional: Cursor Account</span>
                        <p className="text-xs text-muted-foreground mt-1">For settings sync and some features</p>
                        <Link href="https://cursor.sh" target="_blank" className="text-xs text-primary hover:underline">
                          Create account →
                        </Link>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Settings className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>What's Next?</CardTitle>
                  <CardDescription>Continue your Cursor journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/tools/cursor/core-features">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Core Features & Shortcuts</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/tools/cursor/workflows">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Development Workflows</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/tools/cursor/advanced-features">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Advanced Features</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/tools/cursor/project-rules">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Project Rules & Configuration</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <Link href="/tools/cursor">
              <Button variant="outline">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to Cursor Guide
              </Button>
            </Link>
            <Link href="/tools/cursor/core-features">
              <Button>
                Core Features & Shortcuts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 