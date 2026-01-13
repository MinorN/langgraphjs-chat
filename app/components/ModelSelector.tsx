'use client'

import { Wind } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface Model {
  id: string
  name: string
  description?: string
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export default function ModelSelector({
  models,
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentModel = models.find((m) => m.id === selectedModel) || models[0]
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleModelClick = (modelId: string) => {
    onModelChange(modelId)
    setIsOpen(false)
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          className={`px-3 py-1.5 border rounded text-[10px] uppercase transition-all cursor-pointer bg-environment/5 border-alchemy-gold/20 text-text-tip `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-center gap-2">
            <Wind className="w-3 h-3" />
            <span>{currentModel.name}</span>
          </div>
        </button>
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-56 bg-delete-bg border border-alchemy-gold/40 shadow-2xl p-2 z-50 rounded space-y-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="max-h-80 overflow-y-auto space-y-1">
              {models.map((tool) => {
                const isSelected = tool.id === selectedModel
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`w-full flex items-center cursor-pointer p-2 justify-between text-[10px] hover:bg-alchemy-gold/20  rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-alchemy-gold/30 text-paper'
                        : 'text-sidebar-color'
                    }`}
                    onClick={() => handleModelClick(tool.id)}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="flex items-baseline flex-col">
                        {tool.name}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
