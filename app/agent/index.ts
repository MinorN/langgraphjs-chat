export { getApp, checkpointer } from './chatbot'

// 辅助函数
export function formatMessagesForAgent(
  messages: { role: string; content: string }[]
) {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return { content: msg.content, type: 'human' }
    } else if (msg.role === 'assistant') {
      return { content: msg.content, type: 'ai' }
    }
    return msg
  })
}
