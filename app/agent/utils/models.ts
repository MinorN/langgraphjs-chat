import { ChatOpenAI } from '@langchain/openai'

export function createModel(modelId?: string): ChatOpenAI {
  const modelName = modelId || process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo'
  console.log(`使用模型: ${modelName}`)
  return new ChatOpenAI({
    model: modelName,
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    streaming: true, // 启用流式响应
  })
}
