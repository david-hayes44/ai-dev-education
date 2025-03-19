"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, FileUp } from "lucide-react"
import { conversationIO, ExportedConversation } from "@/lib/conversation-io"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@/contexts/chat-context"

interface ConversationImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (sessionId: string) => void
}

export function ConversationImportDialog({
  open,
  onOpenChange,
  onSuccess
}: ConversationImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // We'll get this from the context to properly handle the new session
  const { switchSession } = useChat()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0] || null
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        setError('Only JSON files are supported for import')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import')
      return
    }
    
    setIsImporting(true)
    setError(null)
    
    try {
      // Parse the imported file
      const exportData = await conversationIO.parseImportFile(file)
      
      if (!exportData) {
        throw new Error('Could not parse the import file')
      }
      
      // Validate the data structure
      validateImportData(exportData)
      
      // Import the conversation
      const sessionId = await conversationIO.importConversation(exportData)
      
      if (!sessionId) {
        throw new Error('Failed to import conversation')
      }
      
      // Show success message
      toast({
        title: "Conversation imported",
        description: `Imported "${exportData.session.title}" successfully`,
      })
      
      // Switch to the new session if requested
      if (switchSession) {
        switchSession(sessionId)
      }
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess(sessionId)
      }
      
      // Close the dialog
      onOpenChange(false)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error'
      setError(errorMessage)
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }
  
  // Validate import data structure
  const validateImportData = (data: ExportedConversation) => {
    // Check required fields
    if (!data.version) {
      throw new Error('Invalid import format: missing version')
    }
    
    if (!data.session || !data.session.title) {
      throw new Error('Invalid import format: missing session information')
    }
    
    if (!Array.isArray(data.messages)) {
      throw new Error('Invalid import format: messages must be an array')
    }
    
    // Check each message has the required fields
    for (const msg of data.messages) {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        throw new Error(`Invalid message role: ${msg.role}`)
      }
      
      if (typeof msg.content !== 'string') {
        throw new Error('Invalid message content')
      }
      
      if (typeof msg.timestamp !== 'number') {
        throw new Error('Invalid message timestamp')
      }
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import conversation</DialogTitle>
          <DialogDescription>
            Import a previously exported conversation file
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="conversation-file" className="block mb-2">
            Select a conversation file (.json)
          </Label>
          
          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {file ? file.name : 'Click to select a file or drag it here'}
              </p>
              <p className="text-xs text-muted-foreground">
                Only .json files exported from this app are supported
              </p>
              <input
                ref={fileInputRef}
                id="conversation-file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button 
            onClick={handleImport} 
            className="gap-2" 
            disabled={isImporting || !file}
          >
            {isImporting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 