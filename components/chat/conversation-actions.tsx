"use client"

import React, { useState } from "react"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConversationExportDialog } from "./conversation-export-dialog"
import { ConversationImportDialog } from "./conversation-import-dialog"
import { useChat } from "@/contexts/chat-context"

/**
 * ConversationActions component provides export and import functionality for chat conversations
 */
export function ConversationActions() {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const { currentSession, switchSession } = useChat()

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowExportDialog(true)} 
              className="h-9 w-9 hover:bg-accent/50"
              aria-label="Export conversation"
              disabled={!currentSession}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export conversation</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImportDialog(true)}
              className="h-9 w-9 hover:bg-accent/50"
              aria-label="Import conversation"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import conversation</TooltipContent>
        </Tooltip>
      </div>

      {/* Export/Import Dialogs */}
      <ConversationExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        sessionId={currentSession?.id || ""}
        sessionTitle={currentSession?.title || "Chat Export"}
      />

      <ConversationImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={(sessionId) => {
          if (switchSession) {
            switchSession(sessionId);
          }
        }}
      />
    </>
  )
} 