'use client'
import { useEffect, useRef } from 'react'
import MessageBubble, { type Message } from './MessageBuble'
import LoadingIndicator from './LoadingIndicator'
import EmptyState from './EmptyState'

interface MessageListProps {
  messages: Message[] // 要显示的消息数组
  isLoading: boolean // 是否正在加载中
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messageEndRef = useRef<HTMLDivElement>(null) // 用于标记列表底部的引用

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar mb-8">
      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <div className="h-full p-6 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messageEndRef}></div>
        </div>
      )}
    </div>
  )
}
