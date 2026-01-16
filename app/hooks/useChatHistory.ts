import { useEffect, useCallback } from 'react'
import {
  mapStoredMessagesToChatMessages,
  HumanMessage,
  AIMessage,
} from '@langchain/core/messages'
import type { Message } from '@app/components/MessageBuble'

export function useChatHistory(
  sessionId: string,
  onLoadMessages: (messages: Message[]) => void,
  onHasUserMessage: (hasUser: boolean) => void
) {
  /**
   * 加载历史消息
   *
   * 流程:
   * 1. 从 API 获取会话历史
   * 2. 解析 LangGraph 消息格式
   * 3. 转换为应用内部的 Message 格式
   * 4. 更新消息列表和用户消息标记
   *
   * @param threadId - 要加载的会话 ID
   */
  const loadHistory = useCallback(
    async (threadId: string) => {
      try {
        // 1. 请求历史记录
        const res = await fetch(`/api/chat?thread_id=${threadId}`)
        const data = await res.json()

        if (Array.isArray(data.history) && data.history.length > 0) {
          let historyMsgs: Message[] = []
          try {
            const serializedData = JSON.parse(JSON.stringify(data.history))
            historyMsgs = mapStoredMessagesToChatMessages(
              serializedData
            ) as unknown as Message[]
          } catch (deserializeError) {
            console.error(
              '反序列化失败，尝试手动重建消息对象',
              deserializeError
            )
            historyMsgs = data.history.map((msg: any, idx: number) => {
              let msgType = null
              if (msg.id && Array.isArray(msg.id)) {
                const idArray = msg.id
                for (const part of idArray) {
                  if (part === 'HumanMessage' || part === 'human') {
                    msgType = 'human'
                    break
                  } else if (part === 'AIMessage' || part === 'ai') {
                    msgType = 'ai'
                    break
                  }
                }
              }
              if (!msgType) {
                const msgData = msg.data || msg.kwargs
                if (msgData) {
                  msgType = msgData.type
                }
              }
              if (!msgType) {
                msgType = idx % 2 === 0 ? 'human' : 'ai'
              }
              const msgData = msg.data || msg.kwargs || msg
              const content = msgData.content || msg.content || ''
              const messageId = msgData.id || msg.id

              if (msgType === 'human' || msgType === 'HumanMessage') {
                return new HumanMessage({
                  content,
                  id: messageId,
                }) as unknown as Message
              } else {
                return new AIMessage({
                  content,
                  id: messageId,
                }) as unknown as Message
              }
            })
          }
          // 3. 更新消息列表
          onLoadMessages(historyMsgs)

          // 4. 检查是否有用户消息(用于判断是否需要更新会话名)
          const hasUserMsg = historyMsgs.some((msg) => {
            const msgType = (msg as any)._getType?.()
            return msgType === 'human'
          })
          onHasUserMessage(hasUserMsg)
        } else {
          // 没有历史记录,重置为初始状态
          onLoadMessages([])
          onHasUserMessage(false)
        }
      } catch {
        // 静默失败,不影响用户体验
        // 加载失败时也重置为初始状态
        onLoadMessages([])
        onHasUserMessage(false)
      }
    },
    [onLoadMessages, onHasUserMessage]
  )

  // 当 sessionId 变化时自动加载历史记录
  useEffect(() => {
    loadHistory(sessionId)
  }, [sessionId, loadHistory])

  return { loadHistory }
}
