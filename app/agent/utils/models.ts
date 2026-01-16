import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export function createModel(
  modelId: string
): ChatOpenAI | ChatGoogleGenerativeAI {
  const fillId = modelId || `openai:${process.env.OPENAI_MODEL_NAME}`
  const [provider, modelName] = fillId?.includes(':')
    ? fillId.split(':', 2)
    : ['openai', fillId]

  console.log('创建模型：', modelName)

  if (provider === 'openai') {
    return new ChatOpenAI({
      model: modelName,
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
      },
      streaming: true, // 启用流式响应
    })
  }

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    streaming: true, // 启用流式响应
  })
}
