import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description: string;
}

interface KeyboardShortcutsOptions {
  isEnabled?: boolean;
  globalScope?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutHandler[],
  options: KeyboardShortcutsOptions = {}
) {
  const { isEnabled = true, globalScope = false } = options;
  const shortcutsRef = useRef<KeyboardShortcutHandler[]>(shortcuts);
  
  // Update the ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if shortcuts are disabled or if focus is in an input, textarea, or contenteditable element
    if (!isEnabled) return;
    
    if (!globalScope) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
    }
    
    // Find matching shortcut
    const matchedShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
      const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
      const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
      const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });
    
    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.handler();
    }
  }, [isEnabled, globalScope]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Generate help text for shortcuts
  const getShortcutsHelp = useCallback(() => {
    return shortcuts.map(shortcut => {
      const keyCombo = [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.altKey && 'Alt',
        shortcut.shiftKey && 'Shift',
        shortcut.metaKey && 'Meta',
        shortcut.key
      ].filter(Boolean).join(' + ');
      
      return {
        key: keyCombo,
        description: shortcut.description
      };
    });
  }, [shortcuts]);
  
  return {
    getShortcutsHelp
  };
}

// Predefined shortcuts for common chat operations
export function useChatKeyboardShortcuts({
  onNextChunk,
  onPrevChunk,
  onFirstChunk,
  onLastChunk,
  onClearChat,
  onFocusInput,
  onToggleSize,
  onSendMessage,
  isEnabled = true,
}: {
  onNextChunk?: () => void;
  onPrevChunk?: () => void;
  onFirstChunk?: () => void;
  onLastChunk?: () => void;
  onClearChat?: () => void;
  onFocusInput?: () => void;
  onToggleSize?: () => void;
  onSendMessage?: () => void;
  isEnabled?: boolean;
}) {
  const shortcuts: KeyboardShortcutHandler[] = [
    // Navigation shortcuts
    ...(onNextChunk ? [{
      key: 'ArrowRight',
      altKey: true,
      handler: onNextChunk,
      description: 'Next message chunk'
    }] : []),
    ...(onPrevChunk ? [{
      key: 'ArrowLeft',
      altKey: true,
      handler: onPrevChunk,
      description: 'Previous message chunk'
    }] : []),
    ...(onFirstChunk ? [{
      key: 'Home',
      altKey: true,
      handler: onFirstChunk,
      description: 'First message chunk'
    }] : []),
    ...(onLastChunk ? [{
      key: 'End',
      altKey: true,
      handler: onLastChunk,
      description: 'Last message chunk'
    }] : []),
    
    // Actions
    ...(onClearChat ? [{
      key: 'Escape',
      handler: onClearChat,
      description: 'Clear chat'
    }] : []),
    ...(onFocusInput ? [{
      key: '/',
      handler: onFocusInput,
      description: 'Focus chat input'
    }] : []),
    ...(onToggleSize ? [{
      key: 'm',
      altKey: true,
      handler: onToggleSize,
      description: 'Toggle chat size'
    }] : []),
    ...(onSendMessage ? [{
      key: 'Enter',
      ctrlKey: true,
      handler: onSendMessage,
      description: 'Send message'
    }] : []),
  ];
  
  return useKeyboardShortcuts(shortcuts, { isEnabled, globalScope: false });
} 