"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileJson, FileText, File, Download } from "lucide-react"
import { conversationIO } from "@/lib/conversation-io"
import { useToast } from "@/hooks/use-toast"

interface ConversationExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionTitle: string
}

export function ConversationExportDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
}: ConversationExportDialogProps) {
  const [format, setFormat] = useState<"json" | "text" | "pdf">("json")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    if (!sessionId) return
    
    setIsExporting(true)
    
    try {
      if (format === "pdf") {
        // PDF export not implemented yet
        toast({
          title: "PDF export not supported",
          description: "PDF export is not yet implemented. Please use JSON or Text format.",
          variant: "destructive",
        })
        return
      }
      
      // Get the downloadable blob
      const blob = await conversationIO.getConversationBlob(sessionId, format)
      
      if (!blob) {
        throw new Error("Failed to generate export file")
      }
      
      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sessionTitle.replace(/\s+/g, '_')}_export.${format === 'json' ? 'json' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Conversation exported",
        description: `The conversation was exported successfully as ${format.toUpperCase()}.`,
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export conversation</DialogTitle>
          <DialogDescription>
            Export your conversation in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button 
            variant={format === "json" ? "default" : "outline"} 
            onClick={() => setFormat("json")}
            className="flex flex-col items-center py-4 h-auto"
          >
            <FileJson className="h-8 w-8 mb-2" />
            <span>JSON</span>
          </Button>
          <Button 
            variant={format === "text" ? "default" : "outline"} 
            onClick={() => setFormat("text")}
            className="flex flex-col items-center py-4 h-auto"
          >
            <FileText className="h-8 w-8 mb-2" />
            <span>Text</span>
          </Button>
          <Button 
            variant={format === "pdf" ? "default" : "outline"} 
            onClick={() => setFormat("pdf")}
            className="flex flex-col items-center py-4 h-auto"
            disabled
          >
            <File className="h-8 w-8 mb-2" />
            <span>PDF</span>
            <span className="text-xs mt-1">(Coming soon)</span>
          </Button>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleExport} className="gap-2" disabled={isExporting}>
            {isExporting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 