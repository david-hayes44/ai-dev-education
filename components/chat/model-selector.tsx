"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AIModel, AVAILABLE_MODELS } from "@/lib/chat-service"

interface ModelSelectorProps {
  selectedModel: string
  onSelectModel: (modelId: string) => void
}

export function ModelSelector({
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  // Client-side only rendering with more robust safeguards
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  
  // CMDK internal values - fully controlled mode
  const [commandValue, setCommandValue] = React.useState("")
  const [inputValue, setInputValue] = React.useState("")
  
  // Ensure we have a safe array of models
  const safeModels = React.useMemo(() => {
    return Array.isArray(AVAILABLE_MODELS) && AVAILABLE_MODELS.length > 0 
      ? AVAILABLE_MODELS 
      : []
  }, [])
  
  // Ensure we have a safe default model
  const safeSelectedModel = React.useMemo(() => {
    return selectedModel || (safeModels.length > 0 ? safeModels[0].id : '')
  }, [selectedModel, safeModels])
  
  // Find the current model info - ensure we always have a valid model
  const currentModel = React.useMemo(() => {
    if (!safeModels.length) return null
    return safeModels.find((model: AIModel) => model.id === safeSelectedModel) || safeModels[0]
  }, [safeSelectedModel, safeModels])
  
  // Safe model selection handler - fully typed and guarded
  const handleSelectModel = React.useCallback((value: string) => {
    if (value && typeof value === 'string' && typeof onSelectModel === 'function') {
      onSelectModel(value)
      setOpen(false)
      setInputValue("")
      setCommandValue("") // Reset command value too
    }
  }, [onSelectModel])
  
  // Only run on client-side to prevent hydration issues
  React.useEffect(() => {
    setMounted(true)
    
    // Reset command value when selection changes externally
    if (safeSelectedModel) {
      setCommandValue(safeSelectedModel)
    }
  }, [safeSelectedModel])
  
  // Handle errors gracefully
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Look for CMDK errors 
      if (event.message?.includes('undefined is not iterable') || 
          event.message?.includes('Symbol(Symbol.iterator)')) {
        console.error('CMDK error intercepted:', event.message);
        // Could implement recovery logic here
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (!mounted) return null
  
  // Only render if we have models to display
  if (!safeModels.length) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        No models available
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentModel ? currentModel.name : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command 
          controlledValue={commandValue} 
          onControlledValueChange={setCommandValue}
        >
          <CommandInput 
            placeholder="Search models..." 
            value={inputValue} 
            onValueChange={setInputValue}
          />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {safeModels.map((model: AIModel) => (
              <CommandItem
                key={model.id}
                value={model.id}
                onSelect={handleSelectModel}
                aria-selected={safeSelectedModel === model.id ? "true" : "false"}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeSelectedModel === model.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.provider}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 