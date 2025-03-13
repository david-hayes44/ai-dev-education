"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Settings, Cpu, Zap, Share2, Download, 
  SquareTerminal, MessageSquare, Sparkles
} from "lucide-react"
import { ModelSelector } from "@/components/chat/model-selector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserPreferences() {
  const { selectedModel, setModel, availableModels } = useChat()
  const [activeTab, setActiveTab] = React.useState("general")
  const [temperature, setTemperature] = React.useState(0.7)
  const [systemInstructions, setSystemInstructions] = React.useState(
    "You are a helpful AI assistant for the AI-Dev Education platform. " +
    "You can answer questions about AI-assisted development and the Model Context Protocol (MCP)."
  )
  const [contextLength, setContextLength] = React.useState("8k")
  const [streamResponses, setStreamResponses] = React.useState(true)
  const [showDetailedTokenInfo, setShowDetailedTokenInfo] = React.useState(false)

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Preferences
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              General
            </TabsTrigger>
            <TabsTrigger value="model" className="flex-1">
              Model
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">
              Advanced
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <TabsContent value="general" className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="model-selector">Current Model</Label>
              <ModelSelector 
                selectedModel={selectedModel} 
                onSelectModel={setModel} 
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature: {temperature}</Label>
              </div>
              <Slider 
                id="temperature" 
                min={0} 
                max={1} 
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused and deterministic.
                Higher values make output more creative and varied.
              </p>
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <Label htmlFor="stream">Stream responses</Label>
              <Switch 
                id="stream" 
                checked={streamResponses}
                onCheckedChange={setStreamResponses}
              />
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="available-models">Model Selector</Label>
              <ModelSelector 
                selectedModel={selectedModel} 
                onSelectModel={setModel} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="context-length">Context Window</Label>
              <Select value={contextLength} onValueChange={setContextLength}>
                <SelectTrigger id="context-length">
                  <SelectValue placeholder="Select context length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4k">4K tokens</SelectItem>
                  <SelectItem value="8k">8K tokens</SelectItem>
                  <SelectItem value="16k">16K tokens</SelectItem>
                  <SelectItem value="32k">32K tokens</SelectItem>
                  <SelectItem value="128k">128K tokens</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The maximum number of tokens the model can consider when generating responses.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="system-instructions">System Instructions</Label>
              <textarea 
                id="system-instructions"
                className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                placeholder="Instructions to control the AI's behavior"
              />
              <p className="text-xs text-muted-foreground">
                Specific instructions for the AI that inform how it should behave.
              </p>
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <Label htmlFor="token-info">Show detailed token information</Label>
              <Switch 
                id="token-info" 
                checked={showDetailedTokenInfo}
                onCheckedChange={setShowDetailedTokenInfo}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Actions</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Export Chat
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Share2 className="mr-2 h-4 w-4" />
            Share Chat
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <SquareTerminal className="mr-2 h-4 w-4" />
            View Raw JSON
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze Chat
          </Button>
        </div>
      </div>
    </div>
  )
} 