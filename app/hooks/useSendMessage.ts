import { Message } from '@langchain/core/messages'
import { useCallback } from 'react'

interface UseSendMessageParams {
  sessionId: string // 当前会话 ID
  setIsLoading: (loading: boolean) => void // 设置加载状态
  addUserMessage: (content: string | Array<any>) => void // 添加用户消息
  addAssistantMessage: () => Message // 添加 AI 消息
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
    async (
      input: string,
      selectedTools?: string[],
      selectedModel?: string,
      images?: File[]
    ) => {
      setIsLoading(true)
      try {
        let messageContent: string | Array<any> = [
          { type: 'text', text: input },
        ]
        const imageData: Array<{ data: string; mimeType: string }> = []

        // 如果上传图片需要处理图片
        if (images && images.length > 0) {
          for (const image of images) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                const result = reader.result as string
                const base64Data = result.split(',')[1]
                resolve(base64Data)
              }
              reader.onerror = reject
              reader.readAsDataURL(image)
            })
            imageData.push({ data: base64, mimeType: image.type })
          }
          messageContent = [
            {
              type: 'text',
              text: input,
            },
            ...imageData.map((img) => ({
              type: 'image_url',
              image_url: {
                url: `data:${img.mimeType};base64,${img.data}`,
              },
            })),
          ]
        }

        console.log('包含图片的消息内容:', messageContent)

        addUserMessage(messageContent as any)

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thread_id: sessionId,
            message: messageContent,
            tools: selectedTools || [],
            model: selectedModel || null,
          }),
        })

        if (!response.ok || !response.body) {
          throw new Error('网络响应不正确')
        }

        updateSessionName(input)

        const assistantMessage = addAssistantMessage()

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('无法读取响应流')
        }

        const decoder = new TextDecoder()
        let buffer = '' // 缓冲区,处理跨块的 JSON

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          setIsLoading(false)

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
