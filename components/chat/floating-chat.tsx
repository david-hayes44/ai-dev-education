"use client"

import * as React from "react"
import { X, MessageCircle, Settings, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatContainer } from "@/components/chat/chat-container"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ChatProvider, useChat } from "@/contexts/chat-context"
import { ModelSelector } from "@/components/chat/model-selector"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Define larger default sizes
const DEFAULT_WIDTH = 550;
const DEFAULT_HEIGHT = 700;
const LARGE_WIDTH = 800;
const LARGE_HEIGHT = 800;

// Must be used within a ChatProvider
function ChatHeader({ isLarge, toggleSize }: { isLarge: boolean; toggleSize: () => void }) {
  const { selectedModel, setModel } = useChat();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-between border-b p-4">
      <h3 className="font-semibold">AI Assistant</h3>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSize}
          className="h-8 w-8"
          aria-label={isLarge ? "Minimize chat" : "Maximize chat"}
        >
          {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Model</h4>
              <ModelSelector 
                selectedModel={selectedModel} 
                onSelectModel={setModel} 
              />
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.dispatchEvent(new CustomEvent('closeChatWindow'))}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function FloatingChat() {
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = useLocalStorage<boolean>("floating-chat-open", false);
  const [isLarge, setIsLarge] = useLocalStorage<boolean>("floating-chat-large", false);
  
  // Handle custom close event - only on client
  React.useEffect(() => {
    setMounted(true);
    
    const handleCloseChatWindow = () => setIsOpen(false);
    window.addEventListener('closeChatWindow', handleCloseChatWindow);
    
    // Handle window resize to ensure chat stays within viewport
    const handleWindowResize = () => {
      // Check if we need to adjust the chat size based on window size
      if (isLarge && (window.innerWidth < LARGE_WIDTH + 100 || window.innerHeight < LARGE_HEIGHT + 100)) {
        setIsLarge(false);
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('closeChatWindow', handleCloseChatWindow);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [setIsOpen, isLarge, setIsLarge]);

  // Toggle between default and large size
  const toggleSize = React.useCallback(() => {
    setIsLarge(prev => !prev);
  }, [setIsLarge]);

  // Get current dimensions based on size state
  const getCurrentSize = () => {
    const width = isLarge ? LARGE_WIDTH : DEFAULT_WIDTH;
    const height = isLarge ? LARGE_HEIGHT : DEFAULT_HEIGHT;
    
    // Ensure the chat fits within the viewport
    if (mounted) {
      return {
        width: Math.min(width, window.innerWidth - 50),
        height: Math.min(height, window.innerHeight - 50)
      };
    }
    
    return { width, height };
  };

  // Render different content on server vs client to avoid hydration mismatch
  if (!mounted) {
    return null; // Return nothing during SSR or before hydration
  }

  const { width, height } = getCurrentSize();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6">
      {isOpen ? (
        <div 
          className="rounded-lg border bg-background shadow-xl overflow-hidden flex flex-col transition-all duration-200 ease-in-out"
          style={{ 
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <ChatProvider>
            <div className="flex flex-col h-full">
              <ChatHeader isLarge={isLarge} toggleSize={toggleSize} />
              <div className="flex-1 overflow-auto">
                <ChatContainer />
              </div>
            </div>
          </ChatProvider>
        </div>
      ) : (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
} 