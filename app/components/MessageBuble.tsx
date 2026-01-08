'use client'

import MarkdownRenderer from './MarkdownRenderer'
import { PenTool } from 'lucide-react'
export interface Message {
  id: string // 消息唯一标识
  content: string // 消息内容(支持 Markdown)
  role: 'user' | 'assistant' // 消息角色
  timestamp: Date // 消息时间戳
  isStreaming?: boolean // 是否正在流式传输(显示打字光标)
}

interface MessageBubbleProps {
  message: Message // 要显示的消息
  index: number // 消息在列表中的索引(用于动画延迟)
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const getTime = (timestamp: Date) => {
    const hour = timestamp.getHours()
    if (hour >= 5 && hour < 12) {
      return '晨曦微露'
    } else if (hour >= 12 && hour < 18) {
      return '正午炽阳'
    } else if (hour >= 18 && hour < 21) {
      return '暮色将至'
    } else {
      return '午夜秘语'
    }
  }
  return (
    <div
      className={`flex gap-4 opacity-0 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
      style={{
        animation: `fadeIn 0.5s ease-out forwards`,
      }}
    >
      {/* 头像 */}
      {message.role === 'user' ? (
        ''
      ) : (
        <div className="shrink-0">
          <PenTool className="text-alchemy-gold w-5 h-5" />
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={`max-w-[85%] ${
          message.role === 'user'
            ? 'text-right bg-paper-dark border-r-4 border-alchemy-gold p-4 rounded-l-xl shadow-sm'
            : 'text-left'
        }`}
      >
        <div className="text-sm leading-relaxed">
          <MarkdownRenderer content={message.content} />
        </div>
        {/* 打字光标 */}
        {message.isStreaming && (
          <span className="inline-block w-0.5 h-3 bg-alchemy-gold ml-1 typing-cursor"></span>
        )}

        <div className="text-[10px] text-text-tip mt-2">
          {getTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
