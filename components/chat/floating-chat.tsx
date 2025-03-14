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

// Define larger default sizes with increased comfort
const DEFAULT_WIDTH = 420; // Increased from 350
const DEFAULT_HEIGHT = 650; // Increased from previous value
const LARGE_WIDTH = 800;
const LARGE_HEIGHT = 800;

// Must be used within a ChatProvider
function ChatHeader({ isLarge, toggleSize, onClose }: { 
  isLarge: boolean; 
  toggleSize: () => void;
  onClose: () => void;
}) {
  const { selectedModel, setModel } = useChat();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-between border-b p-4 h-16">
      <h3 className="font-semibold text-base">AI Assistant</h3>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSize}
          className="h-9 w-9 hover:bg-accent/50"
          aria-label={isLarge ? "Minimize chat" : "Maximize chat"}
        >
          {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 p-4">
            <div className="space-y-3">
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
          onClick={onClose}
          className="h-9 w-9 hover:bg-accent/50"
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
  const chatWindowRef = React.useRef<HTMLDivElement>(null);
  
  // Handle custom close event - only on client
  React.useEffect(() => {
    // Use a small delay for hydration completion
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 100);
    
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
    
    // Prevent wheel events from bubbling outside the chat container
    const handleWheel = (e: WheelEvent) => {
      // Check if the event target is within the chat window
      if (chatWindowRef.current && e.target instanceof Node) {
        if (chatWindowRef.current.contains(e.target)) {
          // Let the inner scrollable container handle the event naturally
          e.stopPropagation();
        }
      }
    };

    // Add the wheel event listener to capture scroll events
    if (mounted) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('closeChatWindow', handleCloseChatWindow);
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [mounted, setIsOpen, isLarge, setIsLarge]);

  // Toggle between default and large size
  const toggleSize = React.useCallback(() => {
    setIsLarge(prev => !prev);
  }, [setIsLarge]);
  
  // Function to close the chat
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Get current dimensions based on size state
  const getCurrentSize = () => {
    if (!mounted) return { width: 0, height: 0 }; // Return empty dimensions during SSR
    
    const width = isLarge ? LARGE_WIDTH : DEFAULT_WIDTH;
    const height = isLarge ? LARGE_HEIGHT : DEFAULT_HEIGHT;
    
    // Ensure the chat fits within the viewport
    return {
      width: Math.min(width, window.innerWidth - 50),
      height: Math.min(height, window.innerHeight - 50)
    };
  };

  // Don't render anything during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  // Don't render component content until after hydration
  if (!mounted) {
    return <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6"></div>; // Empty placeholder
  }

  const { width, height } = getCurrentSize();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6">
      {isOpen ? (
        <div 
          ref={chatWindowRef}
          className="rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-in-out isolate"
          style={{ 
            width: `${width}px`,
            height: `${height}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ChatProvider>
            <div className="flex flex-col h-full">
              <ChatHeader 
                isLarge={isLarge} 
                toggleSize={toggleSize}
                onClose={handleClose}
              />
              <div className="flex-1 overflow-hidden">
                <ChatContainer />
              </div>
            </div>
          </ChatProvider>
        </div>
      ) : (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
} 