"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Pencil } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

export function ChatHistory() {
  const { sessions, currentSession, createSession, switchSession, deleteSession, renameSession } = useChat()
  const [isEditing, setIsEditing] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  
  const handleCreateSession = () => {
    createSession()
  }
  
  const handleSwitchSession = (id: string) => {
    switchSession(id)
  }
  
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteSession(id)
    }
  }
  
  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(id)
    setEditTitle(currentTitle)
  }
  
  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim())
    }
    setIsEditing(null)
  }
  
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <Button 
          className="w-full" 
          onClick={handleCreateSession}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            No chat history yet
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent/50 ${
                currentSession?.id === session.id ? 'bg-accent' : ''
              }`}
              onClick={() => handleSwitchSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                {isEditing === session.id ? (
                  <input
                    type="text"
                    className="w-full p-1 rounded border"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveRename(session.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(session.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                    </p>
                  </>
                )}
              </div>
              <div className="flex space-x-1 ml-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => handleStartRename(session.id, session.title, e)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 