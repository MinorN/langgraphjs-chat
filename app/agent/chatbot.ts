import '@app/utils/loadEnv'
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph'
import Database from 'better-sqlite3'
import path from 'path'
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite'
import { initSessionTable } from './db'
import { createModel } from './utils/models'
import { createLangChainTools } from './utils/tools'
import { AIMessage } from '@langchain/core/messages'
import { ToolNode } from '@langchain/langgraph/prebuilt'

const dbPath = path.resolve(process.cwd(), 'chat_history.db')
export const db = new Database(dbPath)
const workflowCache = new Map<string, ReturnType<typeof createWorkflow>>()

// 创建 workflow
function createWorkflow(modelId?: string, toolIds?: string[]) {
  const model = createModel(modelId)
  const tools = createLangChainTools(toolIds)
  const modelWithTools = tools.length > 0 ? model.bindTools(tools) : model

  async function chatbotNode(state: typeof MessagesAnnotation.State) {
    try {
      const response = await modelWithTools.invoke(state.messages)
      return { messages: [response] }
    } catch (error) {
      console.error('chatbotNode 错误详情:', error)
      throw error
    }
  }

  // 判断是否调用工具
  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage && AIMessage.isInstance(lastMessage)) {
      const aiMessage = lastMessage as AIMessage
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log('检测到工具调用')
        return 'tools'
      }
    }
    console.log('无工具调用')
    return END
  }

  const workflow = new StateGraph(MessagesAnnotation).addNode(
    'chatbot',
    chatbotNode
  )
  if (tools.length > 0) {
    const toolNode = new ToolNode(tools)
    workflow
      .addNode('tools', toolNode)
      .addEdge(START, 'chatbot')
      .addConditionalEdges('chatbot', shouldContinue, {
        tools: 'tools',
        [END]: END,
      })
      .addEdge('tools', 'chatbot')
  } else {
    workflow.addEdge(START, 'chatbot').addEdge('chatbot', END)
  }

  return workflow
}

let checkpointer: SqliteSaver

const getCheckpointer = () => {
  if (!checkpointer) {
    // 创建
    try {
      initSessionTable()
      checkpointer = new SqliteSaver(db)
    } catch (error) {
      console.error('SqliteSaver 初始化失败:', error)
      throw error
    }
  }
  return checkpointer
}

const getApp = async (modelId?: string, toolIds?: string[]) => {
  if (!checkpointer) {
    getCheckpointer()
  }

  const cacheKey = `${modelId || 'default'}|${(toolIds || []).sort().join(',')}`
  if (workflowCache.has(cacheKey)) {
    return workflowCache.get(cacheKey)!
  }

  const workflow = createWorkflow(modelId, toolIds)
  const app = workflow.compile({ checkpointer })
  if (workflowCache.size > 10) {
    const firstKey = workflowCache.keys().next().value
    workflowCache.delete(firstKey as string)
    console.log('缓存已满，删除最早的 workflow:', firstKey)
  }
  workflowCache.set(cacheKey, app)
  return app
}

export { getApp, checkpointer, getCheckpointer }
