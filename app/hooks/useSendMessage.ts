import { useCallback } from 'react'

interface UseSendMessageParams {
  sessionId: string // 当前会话 ID
  setIsLoading: (loading: boolean) => void // 设置加载状态
  addUserMessage: (content: string) => void // 添加用户消息
  addAssistantMessage: () => { id: string } // 添加 AI 消息
  updateMessageContent: (id: string, content: string) => void // 更新消息内容
  finishStreaming: (id: string) => void // 完成流式传输
  addErrorMessage: () => void // 添加错误消息
  updateSessionName: (name: string) => void // 更新会话名称
}

export function useSendMessage({
  sessionId,
  setIsLoading,
  addUserMessage,
  addAssistantMessage,
  updateMessageContent,
  finishStreaming,
  addErrorMessage,
  updateSessionName,
}: UseSendMessageParams) {
  const sendMessage = useCallback(
    async (input: string) => {
      addUserMessage(input)
      setIsLoading(true)
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: sessionId, message: input }),
        })
        if (!resp.ok) {
          throw new Error(`网络请求失败`)
        }
        updateSessionName(input)
        // 4. 创建 AI 消息占位符
        const assistantMessage = addAssistantMessage()

        // 5. 处理流式响应
        const reader = resp.body?.getReader()
        if (!reader) {
          throw new Error('无法读取响应流')
        }

        const decoder = new TextDecoder()
        let buffer = '' // 缓冲区,处理跨块的 JSON
        setIsLoading(false)

        // 6. 逐块读取响应流
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // 解码二进制数据为文本
          buffer += decoder.decode(value, { stream: true })

          // 按行分割(每行是一个 JSON 对象)
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留不完整的行到缓冲区

          // 处理每一行
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)

                // 处理内容片段
                if (data.type === 'chunk' && data.content) {
                  updateMessageContent(assistantMessage.id, data.content)
                }
                // 流结束
                else if (data.type === 'end') {
                  finishStreaming(assistantMessage.id)
                  break
                }
                // 服务器错误
                else if (data.type === 'error') {
                  throw new Error(data.message || '服务器错误')
                }
              } catch (parseError) {
                console.error('解析流数据错误:', parseError)
              }
            }
          }
        }
      } catch (error) {
        console.error('发送消息时出错:', error)
        addErrorMessage()
      } finally {
        setIsLoading(false)
      }
    },
    [
      sessionId,
      setIsLoading,
      addUserMessage,
      addAssistantMessage,
      updateMessageContent,
      finishStreaming,
      addErrorMessage,
      updateSessionName,
    ]
  )
  return { sendMessage }
}
