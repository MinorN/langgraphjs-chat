'use client'

import { AIMessage, BaseMessage } from '@langchain/core/messages'
import MarkdownRenderer from './MarkdownRenderer'
import { PenTool } from 'lucide-react'
export interface Message extends BaseMessage {
  isStreaming?: boolean // 是否正在流式传输(显示打字光标)
}

interface MessageBubbleProps {
  message: Message // 要显示的消息
  index: number // 消息在列表中的索引(用于动画延迟)
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // 判断消息类型
  const isUser = AIMessage.isInstance(message) ? false : true

  // 显示时间
  const getTime = (timestamp: string) => {
    const hour = new Date(timestamp).getHours()
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
  let messageContent = ''
  const imageUrls: string[] = []
  // 处理不同类型的content text image
  if (typeof message.content === 'string') {
    messageContent = message.content
  } else if (Array.isArray(message.content)) {
    // 可能是文本和图片的混合数组
    message.content.forEach((block) => {
      if (typeof block === 'string') {
        messageContent += block
      } else if (block && typeof block === 'object') {
        if ('text' in block && block.text) {
          messageContent += block.text
        }
        if ('image_url' in block && block.image_url) {
          const imageUrl = block.image_url as any
          const url = typeof imageUrl === 'string' ? imageUrl : imageUrl?.url
          if (url) {
            imageUrls.push(url)
          }
        }
      }
    })
  } else {
    messageContent = JSON.stringify(message.content)
  }

  return (
    <div
      className={`flex gap-4 opacity-0 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
      style={{
        animation: `fadeIn 0.5s ease-out forwards`,
      }}
    >
      {/* 头像 */}
      {isUser ? (
        ''
      ) : (
        <div className="shrink-0">
          <PenTool className="text-alchemy-gold w-5 h-5" />
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'text-right bg-paper-dark border-r-4 border-alchemy-gold p-4 rounded-l-xl shadow-sm'
            : 'text-left'
        }`}
      >
        <div className="text-sm leading-relaxed">
          {imageUrls.length > 0 && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`image-${idx}`}
                  className="rounded w-24 h-24 shadow-sm object-cover"
                />
              ))}
            </div>
          )}
          {messageContent && <MarkdownRenderer content={messageContent} />}
        </div>
        {/* 打字光标 */}
        {message.isStreaming && (
          <span className="inline-block w-0.5 h-3 bg-alchemy-gold ml-1 typing-cursor"></span>
        )}

        <div className="text-[10px] text-text-tip mt-2">
          {getTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}
