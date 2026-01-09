import { useState, useCallback } from 'react'
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

  /**
   * 添加用户消息
   * @param content - 消息内容
   * @returns 创建的消息对象
   */
  const addUserMessage = useCallback((content: string): Message => {
    const userMessage: Message = {
      id: Date.now().toString(), // 使用时间戳作为唯一 ID
      content,
      role: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    return userMessage
  }, [])

  /**
   * 添加 AI 助手消息
   * 创建一个空的流式消息,用于后续逐步填充内容
   * @returns 创建的消息对象
   */
  const addAssistantMessage = useCallback((): Message => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(), // ID +1 避免与用户消息冲突
      content: '', // 初始为空,等待流式填充
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true, // 标记为流式传输中
    }
    setMessages((prev) => [...prev, assistantMessage])
    return assistantMessage
  }, [])

  /**
   * 更新消息内容(用于流式响应)
   * 将新内容追加到指定消息的末尾
   * @param messageId - 消息 ID
   * @param content - 要追加的内容
   */
  const updateMessageContent = useCallback(
    (messageId: string, content: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content + content }
            : msg
        )
      )
    },
    []
  )

  /**
   * 完成流式传输
   * 将消息标记为完成,移除流式打字光标
   * @param messageId - 消息 ID
   */
  const finishStreaming = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      )
    )
  }, [])

  /**
   * 添加错误消息
   * 在发生错误时向用户显示友好的错误提示
   */
  const addErrorMessage = useCallback(() => {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '抱歉，发送消息时出现错误。请稍后重试。',
      role: 'assistant',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, errorMessage])
  }, [])

  /**
   * 重置消息列表
   * 恢复到初始状态(只有欢迎消息)
   */
  const resetMessages = useCallback(() => {
    setMessages([])
  }, [])

  /**
   * 加载历史消息
   * 用于从服务器加载会话历史记录
   * @param historyMessages - 历史消息数组
   */
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
