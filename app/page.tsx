'use client'

import SessionSidebar from './components/SessionSidebar'
import { ChatInput, ChatInputHandle } from './components/ChatInput'
import MessageList from './components/MessageList'
import { useSessionManager } from './hooks/useSessionManager'
import { useChatHistory } from './hooks/useChatHistory'
import { useChatMessages } from './hooks/useChatMessages'
import { useSendMessage } from './hooks/useSendMessage'
import { useMemo, useRef, useState } from 'react'
import { Model } from './components/ModelSelector'
import { Tool } from './components/ToolSelector'
import { toolsConfig } from './agent/config/tools.config'

function getToolIcon(toolId: string): string {
  const iconMap: Record<string, string> = {
    calculator: '🔢',
    weather: '🌤️',
    current_time: '🕐',
    search: '🔍',
  }
  return iconMap[toolId] || '🛠️'
}

export default function ChatPage() {
  const chatInputRef = useRef<ChatInputHandle>(null)
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
    updateToolCalls,
    updateToolResult,
    updateToolError,
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

  const [currentModel, setCurrentModel] = useState('qwen3-max')
  const availableModels = useMemo<Model[]>(
    () => [
      {
        id: 'qwen3-max',
        name: '千问3Max',
        description:
          '通义千问3系列Max模型，相较preview版本在智能体编程与工具调用方向进行了专项升级。本次发布的正式版模型达到领域SOTA水平，适配场景更加复杂的智能体需求',
      },
      {
        id: 'qwen-plus',
        name: '千问3Plus',
        description:
          'Qwen3系列Plus模型，实现思考模式和非思考模式的有效融合，可在对话中切换模式。推理能力显著超过QwQ、通用能力显著超过Qwen2.5-Plus，达到同规模业界SOTA水平',
      },
      {
        id: 'qwen3-omni-flash',
        name: '千问3Omni Flash(全模态)',
        description:
          '千问3Omni系列模型，具备强大的多模态理解与生成能力，支持文本、图像等多种输入形式，能够生成高质量的多模态内容，适用于广泛的应用场景',
      },
    ],
    []
  )

  const availableTools = useMemo<Tool[]>(() => {
    return Object.entries(toolsConfig)
      .filter(([_, config]) => config.enabled)
      .map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        icon: getToolIcon(id),
      }))
  }, [])

  const { sendMessage } = useSendMessage({
    sessionId,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    updateSessionName,
    updateToolCalls,
    updateToolResult,
    updateToolError,
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
            <ChatInput
              ref={chatInputRef}
              onSend={sendMessage}
              disabled={isLoading}
              availableTools={availableTools}
              availableModels={availableModels}
              currentModel={currentModel}
              onModelChange={setCurrentModel}
            />
          </div>
        </div>
      </div>
    </>
  )
}
