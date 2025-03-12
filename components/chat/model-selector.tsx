"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getAvailableModels } from "@/lib/chat-service"

interface ModelSelectorProps {
  selectedModel: string
  onSelect: (modelId: string) => void
  className?: string
}

export function ModelSelector({ selectedModel, onSelect, className }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const models = getAvailableModels()
  
  // Find the currently selected model
  const currentModel = models.find(model => model.id === selectedModel) || models[0]

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        onClick={() => setOpen(!open)}
      >
        {currentModel.name}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
          <div className="max-h-[200px] overflow-auto">
            <div className="p-1">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    selectedModel === model.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onSelect(model.id)
                    setOpen(false)
                  }}
                >
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {model.provider}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 