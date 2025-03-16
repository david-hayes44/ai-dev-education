"use client"

import { SupabaseChatProvider, useSupabaseChat } from '@/contexts/supabase-chat-context'
import { ChatInputSupabase } from '@/components/chat/chat-input-supabase'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function ChatContainer() {
  const { 
    currentSession, 
    sendMessage, 
    sendStreamingMessage,
    isLoading,
    isStreaming,
    createSession,
    sessions,
    switchSession,
    deleteSession,
    renameSession,
    selectedModel,
    setModel,
    availableModels
  } = useSupabaseChat()
  
  const [showSessions, setShowSessions] = useState(false)
  
  // Create a session if none exists
  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <p className="mb-4">No active chat session</p>
        <Button 
          onClick={() => createSession()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Chat
        </Button>
      </div>
    )
  }
  
  return (
    <div className="flex h-[80vh]">
      {/* Sessions sidebar */}
      {showSessions && (
        <div className="w-64 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Chat Sessions</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => createSession()}
            >
              New
            </Button>
          </div>
          
          <ul className="space-y-2">
            {sessions.map(session => (
              <li 
                key={session.id} 
                className={`p-2 rounded cursor-pointer transition-colors ${
                  currentSession.id === session.id 
                    ? 'bg-blue-100 hover:bg-blue-200' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => switchSession(session.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{session.title}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                  >
                    &times;
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSessions(!showSessions)}
          >
            {showSessions ? 'Hide Sessions' : 'Show Sessions'}
          </Button>
          
          <div className="font-medium">{currentSession.title}</div>
          
          <select 
            value={selectedModel}
            onChange={e => setModel(e.target.value)}
            className="text-sm border rounded p-1"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {currentSession.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Start a conversation by sending a message
            </div>
          ) : (
            <div className="space-y-4">
              {currentSession.messages.map(message => (
                <div 
                  key={message.id}
                  className={`${
                    message.role === 'assistant' 
                      ? 'bg-gray-100 rounded-lg p-3 ml-8' 
                      : 'border rounded-lg p-3 mr-8'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  
                  <div>{message.content}</div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">Attachments:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.attachments.map(attachment => (
                          <a 
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center text-sm"
                          >
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isStreaming && (
                <div className="bg-gray-100 rounded-lg p-3 ml-8">
                  <div className="font-medium mb-1">AI Assistant</div>
                  <div className="flex items-center">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <ChatInputSupabase
            onSubmit={sendMessage}
            isLoading={isLoading || isStreaming}
            isStreaming={isStreaming}
            currentSession={currentSession}
          />
        </div>
      </div>
    </div>
  )
}

export default function ChatSupabasePage() {
  return (
    <SupabaseChatProvider>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Supabase Chat Implementation</h1>
        <Card>
          <CardContent className="p-0">
            <ChatContainer />
          </CardContent>
        </Card>
      </div>
    </SupabaseChatProvider>
  )
} 