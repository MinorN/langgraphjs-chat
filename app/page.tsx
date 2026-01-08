'use client'

import SessionSidebar from './components/SessionSidebar'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import { useSessionManager } from './hooks/useSessionManager'
import { useChatHistory } from './hooks/useChatHistory'
import { useChatMessages } from './hooks/useChatMessages'
import { useSendMessage } from './hooks/useSendMessage'

export default function ChatPage() {
  const {
    messages, // 当前会话的所有消息
    isLoading, // 是否正在加载(发送消息中)
    setIsLoading, // 设置加载状态
    addUserMessage, // 添加用户消息
    addAssistantMessage, // 添加 AI 助手消息
    updateMessageContent, // 更新消息内容(用于流式响应)
    finishStreaming, // 完成流式传输
    addErrorMessage, // 添加错误消息
    loadMessages, // 加载历史消息
  } = useChatMessages()
  const {
    sessionId, // 当前会话 ID
    sidebarRef, // 侧边栏组件引用
    createNewSession, // 创建新会话
    selectSession, // 切换会话
    updateSessionName, // 更新会话名称
    setHasUserMessage, // 设置是否有用户消息(用于判断是否需要更新会话名)
  } = useSessionManager()

  useChatHistory(sessionId, loadMessages, setHasUserMessage)

  const { sendMessage } = useSendMessage({
    sessionId,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    updateSessionName,
  })
  return (
    <>
      <div className="h-screen flex bg-environment p-10">
        {/* 最左侧用户信息 */}
        {/* 左边会话列表页 */}
        <SessionSidebar
          ref={sidebarRef}
          currentSessionId={sessionId}
          onSelect={selectSession}
          onNew={createNewSession}
        />
        {/* 中间聊天页 */}
        <div className="flex-1 flex flex-col bg-paper rounded-br-lg rounded-tr-lg">
          <div className="flex-1 w-full flex flex-col h-full">
            {/* 聊天消息列表 */}
            <MessageList messages={messages} isLoading={isLoading} />
            {/* 聊天输入框 */}
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </>
  )
}
