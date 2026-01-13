import { useState, useCallback } from 'react'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import type { Message } from '@app/components/MessageBuble'

/**
 * 聊天消息管理 Hook
 *
 * 负责管理聊天消息的所有状态和操作:
 * - 消息列表的增删改查
 * - 加载状态管理
 * - 流式消息更新
 * - 错误消息处理
 *
 * @returns {Object} 消息状态和操作方法
 */
export function useChatMessages() {
  // 消息列表状态,默认包含初始欢迎消息
  const [messages, setMessages] = useState<Message[]>([])
  // 加载状态,标识是否正在发送/接收消息
  const [isLoading, setIsLoading] = useState(false)

  const addUserMessage = useCallback(
    (content: string | Array<any>): Message => {
      const userMessage = new HumanMessage({
        content,
        id: Date.now().toString(),
      })
      setMessages((prev) => [...prev, userMessage])
      return userMessage
    },
    []
  )

  const addAssistantMessage = useCallback((): Message => {
    const assistantMessage = new AIMessage({
      content: '',
      id: (Date.now() + 1).toString(),
    }) as Message
    assistantMessage.isStreaming = true // 标记为流式传输中
    setMessages((prev) => [...prev, assistantMessage])
    return assistantMessage
  }, [])

  const updateMessageContent = useCallback(
    (messageId: string, content: string) => {
      setMessages((pre) =>
        pre.map((msg) => {
          if (msg.id === messageId) {
            const currentContent =
              typeof msg.content === 'string' ? msg.content : ''
            const updatedMessage = new AIMessage({
              content: currentContent + content,
              id: msg.id,
            }) as Message
            updatedMessage.isStreaming = msg.isStreaming
            return updatedMessage
          }
          return msg
        })
      )
    },
    []
  )

  const finishStreaming = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const updatedMsg = msg as Message
          updatedMsg.isStreaming = false
          return updatedMsg
        }
        return msg
      })
    )
  }, [])

  const addErrorMessage = useCallback(() => {
    const errorMessage = new AIMessage({
      content: '抱歉，消息发送失败，请稍后重试。',
      id: (Date.now() + 1).toString(),
    })
    setMessages((prev) => [...prev, errorMessage])
  }, [])

  const resetMessages = useCallback(() => {
    setMessages([])
  }, [])

  const loadMessages = useCallback((historyMessages: Message[]) => {
    setMessages(historyMessages.length > 0 ? historyMessages : [])
  }, [])

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    resetMessages,
    loadMessages,
  }
}
