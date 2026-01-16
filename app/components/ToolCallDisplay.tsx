'use client'

import { ToolCall } from '@app/agent/types/tool.types'
import { useState } from 'react'
import { ChevronDown, ChevronRight, Activity } from 'lucide-react'

interface ToolCallDisplayProps {
  toolCalls: ToolCall[]
}

export default function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  // 记录展开的工具调用ID
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())

  const toggleTool = (toolId: string) => {
    setExpandedTools((pre) => {
      const set = new Set(pre)
      if (set.has(toolId)) {
        set.delete(toolId)
      } else {
        set.add(toolId)
      }
      return set
    })
  }

  if (!toolCalls || toolCalls.length === 0) {
    return null
  }

  return (
    <>
      <div>
        {toolCalls.map((toolCall) => {
          const isExpanded = expandedTools.has(toolCall.id)
          const hasOutput = toolCall.output !== undefined
          const hasError = toolCall.error !== undefined
          const isExecuting = !hasOutput && !hasError

          return (
            <div
              key={toolCall.id}
              className="border flex items-center flex-col justify-between py-2 px-3 border-l-2 border-alchemy-gold/30  bg-alchemy-gold/10 rounded-r-lg cursor-pointer hover:bg-alchemy-gold/20 transition-colors group overflow-hidden"
            >
              <button
                onClick={() => toggleTool(toolCall.id)}
                className="flex items-center cursor-pointer w-full gap-2"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-alchemy-gold shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-alchemy-gold shrink-0" />
                )}
                <span className="text-[10px] tracking-[0.2em] text-alchemy-gold font-bold">
                  {toolCall.name}
                </span>
              </button>
              {isExpanded && (
                <div className="p-2 border border-alchemy-gold/20 bg-white/40 rounded shadow-sm w-full">
                  {toolCall.args && Object.keys(toolCall.args).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-alchemy-gold mb-1">
                        法则原理：
                      </div>
                      <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(toolCall.args, null, 2)}
                      </pre>
                    </div>
                  )}
                  {hasOutput && (
                    <div>
                      <div className="text-xs font-semibold text-alchemy-gold mb-1">
                        法则结果：
                      </div>
                      <pre className="overflow-x-auto text-xs">
                        {typeof toolCall.output === 'string'
                          ? toolCall.output
                          : JSON.stringify(toolCall.output, null, 2)}
                      </pre>
                    </div>
                  )}
                  {hasError && (
                    <div>
                      <div className="text-xs font-semibold mb-1 text-seal-red">
                        错误信息：
                      </div>
                      <pre className="text-xs font-semibold text-seal-red">
                        {toolCall.error}
                      </pre>
                    </div>
                  )}
                  {isExecuting && (
                    <div className="text-xs text-alchemy-gold italic">
                      正在执行法则
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
