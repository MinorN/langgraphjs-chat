import '@app/utils/loadEnv'
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import Database from 'better-sqlite3'
import path from 'path'
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite'
import { initSessionTable } from './db'

// 初始化模型
const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL_NAME,
  temperature: 0.7,
  streaming: true, // 启用流式响应
})

// 对话节点
async function chatbotNode(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages)
  return { messages: [response] }
}

const dbPath = path.resolve(process.cwd(), 'chat_history.db')
export const db = new Database(dbPath)

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('chatbot', chatbotNode)
  .addEdge(START, 'chatbot')
  .addEdge('chatbot', END)

let checkpointer: SqliteSaver
let app: ReturnType<typeof workflow.compile>

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

async function initializeApp() {
  if (!checkpointer) {
    try {
      // 使用 better-sqlite3 创建数据库连接
      const db = new Database(dbPath)
      // 初始化自定义 sessions 表
      initSessionTable()
      checkpointer = new SqliteSaver(db)
    } catch (error) {
      console.error('SqliteSaver 初始化失败:', error)
      throw error
    }
  }
  if (!app) {
    app = workflow.compile({ checkpointer })
  }
  return app
}

initializeApp()

const getApp = async () => {
  return await initializeApp()
}

export { getApp, checkpointer, getCheckpointer }
