"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  createChatSession, 
  getChatSessions,
  getChatSession,
  deleteChatSession,
  updateChatSession,
  addChatMessage,
  subscribeToChatMessages
} from '@/lib/supabase-chat-service'
import { ChatSession, Message } from '@/lib/chat-service'

export default function DatabaseTestPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  
  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])
  
  // Subscribe to messages for the current session
  useEffect(() => {
    if (!currentSession || !realtimeEnabled) return
    
    const unsubscribe = subscribeToChatMessages(
      currentSession.id,
      (newMessage) => {
        console.log('New message received:', newMessage)
        
        // Update current session with new message
        setCurrentSession(prev => {
          if (!prev) return null
          
          const updatedMessages = [
            ...prev.messages.filter(m => m.id !== newMessage.id),
            newMessage
          ].sort((a, b) => a.timestamp - b.timestamp)
          
          return {
            ...prev,
            messages: updatedMessages
          }
        })
      }
    )
    
    return () => {
      unsubscribe()
    }
  }, [currentSession, realtimeEnabled])
  
  const loadSessions = async () => {
    setLoading(true)
    try {
      const allSessions = await getChatSessions()
      setSessions(allSessions)
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) {
      setError('Session title is required')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const sessionId = await createChatSession(newSessionTitle)
      const session = await getChatSession(sessionId)
      
      if (session) {
        setSessions(prev => [session, ...prev])
        setCurrentSession(session)
        setNewSessionTitle('')
      }
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Failed to create session')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSelectSession = async (sessionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const session = await getChatSession(sessionId)
      setCurrentSession(session)
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    
    setLoading(true)
    setError(null)
    
    try {
      await deleteChatSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
      }
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Failed to delete session')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      await updateChatSession(sessionId, { title: newTitle })
      
      // Update sessions list
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ))
      
      // Update current session if it's the one being renamed
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null)
      }
    } catch (err) {
      console.error('Error renaming session:', err)
      setError('Failed to rename session')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSendMessage = async () => {
    if (!currentSession || !messageContent.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Add user message
      await addChatMessage(currentSession.id, {
        role: 'user',
        content: messageContent
      })
      
      // Simulate assistant response
      setTimeout(async () => {
        await addChatMessage(currentSession.id, {
          role: 'assistant',
          content: `This is a test response to "${messageContent}"`
        })
      }, 1000)
      
      // Clear input
      setMessageContent('')
      
      // Refresh current session
      const updatedSession = await getChatSession(currentSession.id)
      setCurrentSession(updatedSession)
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Supabase Database Test</h1>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Chat Sessions</CardTitle>
              <CardDescription>Create and manage chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="New session title" 
                  value={newSessionTitle}
                  onChange={e => setNewSessionTitle(e.target.value)}
                />
                <Button onClick={handleCreateSession} disabled={loading}>
                  Create
                </Button>
              </div>
              
              {sessions.length === 0 ? (
                <p className="text-gray-500">No sessions yet</p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map(session => (
                    <li 
                      key={session.id} 
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        currentSession?.id === session.id 
                          ? 'bg-blue-100 hover:bg-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{session.title}</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session.id)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {currentSession ? currentSession.title : 'No session selected'}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      id="realtime-toggle"
                      checked={realtimeEnabled}
                      onChange={e => setRealtimeEnabled(e.target.checked)}
                    />
                    <label htmlFor="realtime-toggle" className="text-sm">
                      Realtime
                    </label>
                  </div>
                  
                  {currentSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTitle = prompt('Enter new title', currentSession.title)
                        if (newTitle) {
                          handleRenameSession(currentSession.id, newTitle)
                        }
                      }}
                    >
                      Rename
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {!currentSession ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select or create a session
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto mb-4 border rounded p-3">
                    {currentSession.messages.length === 0 ? (
                      <p className="text-gray-500">No messages yet</p>
                    ) : (
                      <div className="space-y-4">
                        {currentSession.messages.map(message => (
                          <div 
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.role === 'assistant' 
                                ? 'bg-blue-50 ml-4' 
                                : 'bg-gray-50 mr-4'
                            }`}
                          >
                            <div className="font-medium">
                              {message.role === 'user' ? 'You' : 'Assistant'}
                            </div>
                            <div>{message.content}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(message.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={e => setMessageContent(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={loading || !messageContent.trim()}>
                      Send
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 