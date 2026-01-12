'use client'

import { Boxes, Check, Delete, Trash2, Wind, ZapOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface Tool {
  id: string
  name: string
  description: string
  icon?: string
}

interface ToolSelectorProps {
  tools: Tool[]
  selectedTools: string[]
  onToolToggle: (toolId: string) => void
}

export default function ToolSelector({
  tools,
  selectedTools,
  onToolToggle,
}: ToolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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

  const handleToolClick = (toolId: string) => {
    onToolToggle(toolId)
  }
  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          className={`px-3 py-1.5 border rounded text-[10px] uppercase transition-all cursor-pointer ${
            selectedTools.length > 0
              ? 'bg-alchemy-gold/10 border-alchemy-gold/50 text-alchemy-gold'
              : 'bg-environment/5 border-alchemy-gold/20 text-text-tip'
          } `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedTools.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <Boxes className="w-3 h-3 text-seal-red" />
              <span>法则共振({selectedTools.length})</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ZapOff className="w-3 h-3" />
              <span>纯粹沉思</span>
            </div>
          )}
        </button>
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-56 bg-delete-bg border border-alchemy-gold/40 shadow-2xl p-2 z-50 rounded space-y-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-[8px] uppercase text-alchemy-gold border-b border-alchemy-gold/20 pb-1 mb-1">
              <span>选择共振法典</span>
              <div
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-white"
                onClick={() => {
                  selectedTools.forEach((toolId) => onToolToggle(toolId))
                }}
              >
                <Trash2 className="w-2 h-2" />
                清空
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {tools.map((tool) => {
                const isSelected = selectedTools.includes(tool.id)
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`w-full flex items-center cursor-pointer p-2 justify-between text-[10px] hover:bg-alchemy-gold/20  rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-alchemy-gold/30 text-paper'
                        : 'text-sidebar-color'
                    }`}
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <div className="flex gap-2 items-center">
                      <div>{tool.icon}</div>
                      <div className="flex items-baseline flex-col">
                        {tool.name}
                        <div>{tool.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div>
                        <Check className="w-3 h-3 text-alchemy-gold" />
                      </div>
                    )}
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
